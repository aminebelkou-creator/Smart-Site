// Replaces the native "sharp" module when SMARTSITE_IMAGE_PROCESSING=off (see
// next.config.ts). Payload receives no sharp dependency in that mode, so this
// only fails loudly if something unexpected still tries to process an image.
function sharpUnavailable(): never {
  throw new Error(
    "Image processing is disabled (SMARTSITE_IMAGE_PROCESSING=off): sharp is not bundled on this host."
  )
}

export default sharpUnavailable
