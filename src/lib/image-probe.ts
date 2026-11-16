/**
 * Reads the format and pixel size of a PNG, JPEG or WebP from its header,
 * without native dependencies. Used where only validation is needed, so hosts
 * that cannot ship sharp (EdgeOne Makers' 128 MiB function limit) still work.
 */
export type ImageProbe = { format: "png" | "jpeg" | "webp"; width: number; height: number }

export function probeImage(bytes: Buffer): ImageProbe | null {
  // PNG: 8-byte signature, then the IHDR chunk with width/height.
  if (
    bytes.length >= 24 &&
    bytes.readUInt32BE(0) === 0x89504e47 &&
    bytes.readUInt32BE(4) === 0x0d0a1a0a &&
    bytes.toString("ascii", 12, 16) === "IHDR"
  ) {
    return { format: "png", width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
  }

  // JPEG: walk segments until a start-of-frame marker.
  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) return null
      const marker = bytes[offset + 1]
      if (marker === 0xff) {
        offset += 1
        continue
      }
      if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
        offset += 2
        continue
      }
      const length = bytes.readUInt16BE(offset + 2)
      const isFrame =
        marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc
      if (isFrame) {
        return {
          format: "jpeg",
          height: bytes.readUInt16BE(offset + 5),
          width: bytes.readUInt16BE(offset + 7),
        }
      }
      if (length < 2) return null
      offset += 2 + length
    }
    return null
  }

  // WebP: RIFF container with a VP8, VP8L or VP8X chunk.
  if (
    bytes.length >= 30 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    const chunk = bytes.toString("ascii", 12, 16)
    if (chunk === "VP8X") {
      return {
        format: "webp",
        width: 1 + bytes.readUIntLE(24, 3),
        height: 1 + bytes.readUIntLE(27, 3),
      }
    }
    if (chunk === "VP8L" && bytes[20] === 0x2f) {
      const bits = bytes.readUInt32LE(21)
      return { format: "webp", width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) }
    }
    if (chunk === "VP8 " && bytes.length >= 30) {
      return {
        format: "webp",
        width: bytes.readUInt16LE(26) & 0x3fff,
        height: bytes.readUInt16LE(28) & 0x3fff,
      }
    }
  }

  return null
}
