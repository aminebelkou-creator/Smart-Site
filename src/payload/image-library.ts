// The image library Payload uses for resizing. Kept as its own module so builds
// with SMARTSITE_IMAGE_PROCESSING=off can alias this path to a stub (see
// next.config.ts); aliasing "sharp" itself does not work under webpack, where
// Next treats sharp as a server external before aliases apply.
export { default } from "sharp"
