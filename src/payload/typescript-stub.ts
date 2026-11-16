// Replaces the "typescript" package in EdgeOne Makers builds (see next.config.ts).
// A dependency imports typescript when the server starts, but nothing needs it to
// serve pages (it is only used by CLI tasks such as type generation). Turbopack
// references it through a hashed external that EdgeOne's packaging does not keep,
// so every request failed with "Cannot find module typescript-<hash>".
//
// Property reads at import time (e.g. ts.SyntaxKind.X) return further stubs; any
// actual call throws, so an unexpected runtime use fails loudly instead of silently.
const unavailable = () => {
  throw new Error("typescript is not available in this deployment (EdgeOne Makers build).")
}

function stub(path: string): any {
  return new Proxy(unavailable, {
    get(_target, key) {
      if (key === "__esModule") return false
      if (key === "default") return root
      if (key === "then") return undefined
      if (key === Symbol.toPrimitive) return () => `[typescript stub ${path}]`
      return stub(`${path}.${String(key)}`)
    },
    apply: unavailable,
    construct: unavailable,
  })
}

const root = stub("typescript")

export default root
