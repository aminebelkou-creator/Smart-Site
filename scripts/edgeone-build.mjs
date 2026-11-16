#!/usr/bin/env node
// Runs `next build` on EdgeOne Makers with diagnostics: build-machine resources,
// periodic memory samples and the exact exit code/signal. The Makers log does
// not show why a process died, so this makes out-of-memory kills visible.
import { spawn } from "node:child_process"
import { readFileSync } from "node:fs"
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
    `cgroup limit ${cgroupMemory()}, cpus ${os.cpus().length}, heap ${heap} MB, turbopack limit ${process.env.SMARTSITE_TURBOPACK_MEMORY_MB || 1536} MB, bundler ${bundler.length ? "webpack" : "turbopack"}`
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
  process.exit(code ?? 1)
})
