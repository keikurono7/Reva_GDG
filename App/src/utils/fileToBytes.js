export async function fileToBytes(file) {
  if (!file) return null;
  const buffer = await file.arrayBuffer();
  return new Uint8Array(buffer);
}
