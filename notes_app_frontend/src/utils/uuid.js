/**
 * A tiny UUID v4 generator (non-crypto).
 * For this app's local-only IDs, Math.random-based UUID is acceptable.
 */

// PUBLIC_INTERFACE
export function uuidV4() {
  /** Generate a UUID v4 string. */
  // eslint-disable-next-line no-bitwise
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    // eslint-disable-next-line no-bitwise
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
