#!/usr/bin/env node
// Runs `next build` on EdgeOne Makers with diagnostics: build-machine resources,
// periodic memory samples and the exact exit code/signal. The Makers log does
// not show why a process died, so this makes out-of-memory kills visible.
import { spawn } from "node:child_process"
import {
  cpSync,
  writeFileSync,
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  statSync,
} from "node:fs"
import path from "node:path"
import os from "node:os"

const mb = bytes => Math.round(bytes / 2 ** 20)
const heap = process.env.SMARTSITE_BUILD_HEAP_MB || "2048"
const bundler = process.env.SMARTSITE_BUNDLER === "webpack" ? ["--webpack"] : []

function cgroupMemory() {
  for (const file of ["/sys/fs/cgroup/memory.max", "/sys/fs/cgroup/memory/memory.limit_in_bytes"]) {
    try {
      const value = readFileSync(file, "utf8").trim()
      return value === "max" ? "unlimited" : `${mb(Number(value))} MB`
    } catch {}
  }
  return "unknown"
}

function cgroupUsage() {
  for (const file of ["/sys/fs/cgroup/memory.current", "/sys/fs/cgroup/memory/memory.usage_in_bytes"]) {
    try {
      return `${mb(Number(readFileSync(file, "utf8").trim()))} MB`
    } catch {}
  }
  return "n/a"
}

console.log(
  `[smartsite] node ${process.version}, total ${mb(os.totalmem())} MB, free ${mb(os.freemem())} MB, ` +
    `cgroup limit ${cgroupMemory()}, cpus ${os.cpus().length}, images ${process.env.SMARTSITE_IMAGE_PROCESSING || "off"}, heap ${heap} MB, bundler ${bundler.length ? "webpack" : "turbopack"}`
)

const child = spawn("next", ["build", ...bundler], {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    SMARTSITE_DEPLOY_TARGET: "edgeone",
    // Keep sharp/libvips (~35 MB) out of the 128 MiB SSR function by default.
    SMARTSITE_IMAGE_PROCESSING: process.env.SMARTSITE_IMAGE_PROCESSING || "off",
    NODE_OPTIONS: `--no-deprecation --max-old-space-size=${heap}`,
    // Fewer native worker threads means less parallel memory in Turbopack.
    TOKIO_WORKER_THREADS: process.env.TOKIO_WORKER_THREADS || "1",
    RAYON_NUM_THREADS: process.env.RAYON_NUM_THREADS || "1",
  },
})

const started = Date.now()
let lowest = os.freemem()
const sampler = setInterval(() => {
  lowest = Math.min(lowest, os.freemem())
  console.log(
    `[smartsite] +${Math.round((Date.now() - started) / 1000)}s free ${mb(os.freemem())} MB, cgroup used ${cgroupUsage()}`
  )
}, 10000)

child.on("exit", (code, signal) => {
  clearInterval(sampler)
  console.log(
    `[smartsite] next build exited: code ${code}, signal ${signal ?? "none"}, ` +
      `after ${Math.round((Date.now() - started) / 1000)}s, lowest free memory ${mb(lowest)} MB`
  )
  if (code === 0) {
    materializeExternals()
    reportServerTrace()
  }
  process.exit(code ?? 1)
})

// Sum the files Next traced for server functions (.nft.json), grouped by npm
// package, so the 128 MiB Cloud Function limit can be attacked with data.
function reportServerTrace() {
  try {
    const root = process.cwd()
    const files = new Set()
    const walk = dir => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) walk(full)
        else if (entry.name.endsWith(".nft.json")) {
          const { files: traced = [] } = JSON.parse(readFileSync(full, "utf8"))
          for (const file of traced) files.add(path.resolve(path.dirname(full), file))
        }
      }
    }
    walk(path.join(root, ".next", "server"))
    const byPackage = new Map()
    let total = 0
    for (const file of files) {
      if (!existsSync(file)) continue
      const stat = statSync(file)
      if (!stat.isFile()) continue
      const real = realpathSync(file)
      const match = real.match(/node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?((?:@[^/]+\/)?[^/]+)/)
      const relative = path.relative(root, real)
      const name = match
        ? match[1]
        : `(app) ${relative.split(path.sep).slice(0, 3).join("/")}${real.endsWith(".map") ? " [.map]" : ""}`
      byPackage.set(name, (byPackage.get(name) || 0) + stat.size)
      total += stat.size
    }
    const top = [...byPackage.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40)
    console.log(`[smartsite] traced server files: ${files.size}, ${mb(total)} MB total`)
    for (const [name, size] of top) console.log(`[smartsite]   ${String(mb(size)).padStart(5)} MB  ${name}`)
  } catch (error) {
    console.log(`[smartsite] trace report failed: ${error.message}`)
  }
}

// Turbopack references some server externals through hashed aliases that are
// symlinks in .next/node_modules (e.g. typescript-<hash>, imported by
// @payloadcms/plugin-mcp). EdgeOne's packaging does not keep these symlinks, so
// every request failed with "Cannot find module typescript-<hash>". Replace each
// symlink with a real copy of the package's runtime files.
function materializeExternals() {
  const dir = path.join(process.cwd(), ".next", "node_modules")
  if (!existsSync(dir)) return console.log("[smartsite] no .next/node_modules externals")
  const runtimeOnly = source =>
    !/\.(d\.ts|d\.mts|d\.cts|map|md|markdown|txt)$/i.test(source) &&
    !/[\\/](docs?|test|tests|__tests__|examples?)[\\/]/.test(source) &&
    // typescript: keep only lib/typescript.js (what require("typescript") loads);
    // drop tsc, tsserver, typings installer and localized diagnostics (~10 MB).
    !/typescript[^\\/]*[\\/]lib[\\/]([a-z]{2}(-[a-z]+)?[\\/]|_?tsc|_?tsserver|_?typingsInstaller|watchGuard|lib\.)/i.test(source)
  const materialized = []
  const visit = (folder, depth) => {
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      const full = path.join(folder, entry.name)
      if (entry.name.startsWith("@") && entry.isDirectory() && depth === 0) {
        visit(full, 1)
        continue
      }
      if (!lstatSync(full).isSymbolicLink()) continue
      const target = realpathSync(full)
      rmSync(full, { recursive: true, force: true })
      cpSync(target, full, { recursive: true, dereference: true, filter: runtimeOnly })
      materialized.push(full)
      const size = mb(folderSize(full))
      console.log(`[smartsite] materialized external ${path.relative(dir, full)} (${size} MB)`)
    }
  }
  visit(dir, 0)
  if (materialized.length) addToTraces(materialized)
}

// EdgeOne packages only files listed in Next's .nft.json traces, so list the
// materialized externals in every server trace.
function addToTraces(folders) {
  const files = []
  const collect = folder => {
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      const full = path.join(folder, entry.name)
      if (entry.isDirectory()) collect(full)
      else files.push(full)
    }
  }
  folders.forEach(collect)
  const root = path.join(process.cwd(), ".next")
  const traces = []
  const findTraces = folder => {
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      const full = path.join(folder, entry.name)
      if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== "cache") findTraces(full)
      else if (entry.name.endsWith(".nft.json")) traces.push(full)
    }
  }
  findTraces(root)
  for (const trace of traces) {
    const data = JSON.parse(readFileSync(trace, "utf8"))
    const listed = new Set(data.files || [])
    for (const file of files) listed.add(path.relative(path.dirname(trace), file))
    data.files = [...listed]
    writeFileSync(trace, JSON.stringify(data))
  }
  console.log(`[smartsite] added ${files.length} external files to ${traces.length} traces`)
}

function folderSize(folder) {
  let total = 0
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    const full = path.join(folder, entry.name)
    total += entry.isDirectory() ? folderSize(full) : statSync(full).size
  }
  return total
}
