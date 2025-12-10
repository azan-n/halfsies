// Convert to URL-safe base64
function toBase64(str: string): string {
  return btoa(str)
    .replace(/\+/g, "-") // Convert '+' to '-'
    .replace(/\//g, "_") // Convert '/' to '_'
    .replace(/=+$/, ""); // Remove ending '=';
}

// Decode URL-safe base64
function fromBase64(str: string): string {
  // Add padding back
  const pad = str.length % 4;
  const padded = pad ? str + "=".repeat(4 - pad) : str;

  return atob(
    padded
      .replace(/\-/g, "+") // Convert '-' to '+'
      .replace(/\_/g, "/"), // Convert '_' to '/'
  );
}

export function encodeUriBase64(v: object) {
  const json = JSON.stringify(v, undefined, 0);
  try {
    return toBase64(json);
  } catch (e) {
    throw Error("Failed to encode as fragment.");
  }
}

export function decodeUriBase64(t: string): any[] {
  try {
    // Try base64 decoding first (new format)
    const decoded = fromBase64(t);
    return JSON.parse(decoded);
  } catch (e) {
    return [];
  }
}

/**
 * @deprecated Use base64 instead
 */
export function encodeUriJson(v: object): string {
  return encodeURIComponent(JSON.stringify(v));
}

/**
 * @deprecated Use base64 instead
 */
export function decodeUriJson(t: string): any[] {
  try {
    const decoded = JSON.parse(decodeURIComponent(t));
    return decoded;
  } catch (e) {
    return [];
  }
}
