export interface SegmentMode {
  /** An unsigned 4-bit integer value (range 0 to 15) representing the mode indicator bits for this mode object. */
  modeBits: number;
  numBitsCharCount: [number, number, number];
}

/** Creates a new QR Code segment mode with the specified encoding mode, bit count, and data bits. */
export function segmentMode(
  modeBits: number,
  numBitsCharCount: [number, number, number]
): SegmentMode {
  return { modeBits, numBitsCharCount };
}

/** Returns the bit width of the segment character count field for this mode object at the given version number. */
export function numCharCountBits(segment: SegmentMode, ver: number): number {
  if (1 <= ver && ver <= 9) return segment.numBitsCharCount[0];
  else if (10 <= ver && ver <= 26) return segment.numBitsCharCount[1];
  else if (27 <= ver && ver <= 40) return segment.numBitsCharCount[2];
  else throw RangeError('Version number out of range (1-40)');
}

export const CONSTANTS = Object.freeze({
  NUMERIC: segmentMode(0x1, [10, 12, 14]),
  ALPHANUMERIC: segmentMode(0x2, [9, 11, 13]),
  BYTE: segmentMode(0x4, [8, 16, 16]),
  KANJI: segmentMode(0x8, [8, 10, 12]),
  ECI: segmentMode(0x7, [0, 0, 0]),
});
