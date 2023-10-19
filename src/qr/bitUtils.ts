/** 
 * Packs this buffer's bits into bytes in big endian,
 * padding with '0' bit values, and returns the new array.
 */
export function getBytes(buffer: number[]): number[] {
  const result: number[] = [];
  while (result.length * 8 < buffer.length) result.push(0);
  buffer.forEach((b, i) => (result[i >>> 3] |= b << (7 - (i & 7))));
  return result;
}

/**
 * Appends the given number of low bits of the given
 * value to this sequence. Requires `0 <= val < 2^len`.
 */
export function appendBits(buffer: number[], val: number, len: number): void {
  if (len < 0 || len > 31 || val >>> len != 0) throw 'Value out of range';
  for (
    let i = len - 1;
    i >= 0;
    i-- // Append bit by bit
  )
  buffer.push((val >>> i) & 1);
}