#!/usr/bin/env node
// Runs `next build` on EdgeOne Makers with diagnostics: build-machine resources,
// periodic memory samples and the exact exit code/signal. The Makers log does
// not show why a process died, so this makes out-of-memory kills visible.
import { spawn } from "node:child_process"
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from "node:fs"
import path from "node:path"
import os from "node:os"

const mb = bytes => Math.round(bytes / 2 ** 20)
const heap = process.env.SMARTSITE_BUILD_HEAP_MB || "2560"
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
    `cgroup limit ${cgroupMemory()}, cpus ${os.cpus().length}, heap ${heap} MB, bundler ${bundler.length ? "webpack" : "turbopack"}`
)

const child = spawn("next", ["build", ...bundler], {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    SMARTSITE_DEPLOY_TARGET: "edgeone",
    NODE_OPTIONS: `--no-deprecation --max-old-space-size=${heap}`,
    // Fewer native worker threads means less parallel memory in Turbopack.
    TOKIO_WORKER_THREADS: process.env.TOKIO_WORKER_THREADS || "2",
    RAYON_NUM_THREADS: process.env.RAYON_NUM_THREADS || "2",
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
  if (code === 0) reportServerTrace()
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
      const name = match ? match[1] : "(app)"
      byPackage.set(name, (byPackage.get(name) || 0) + stat.size)
      total += stat.size
    }
    const top = [...byPackage.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30)
    console.log(`[smartsite] traced server files: ${files.size}, ${mb(total)} MB total`)
    for (const [name, size] of top) console.log(`[smartsite]   ${String(mb(size)).padStart(5)} MB  ${name}`)
  } catch (error) {
    console.log(`[smartsite] trace report failed: ${error.message}`)
  }
}
