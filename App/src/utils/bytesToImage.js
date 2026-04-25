export function bytesToBase64(blob) {
  if (!blob || !blob._byteString || !blob._byteString.binaryString) {
    return null;
  }

  const binaryString = blob._byteString.binaryString;

  // Convert binary string → base64
  const base64 = btoa(binaryString);

  return `data:image/jpeg;base64,${base64}`;
}
