/*
 * Represents the error correction level used in a QR Code symbol.
 */
export interface ErrorCorrection {
  /* In the range 0 to 3 (unsigned 2-bit integer). */
  ordinal: number;
  /* In the range 0 to 3 (unsigned 2-bit integer). */
  formatBits: number;
}

/**
 * Creates an error correction object.
 */
export function errorCorrection(ordinal: number, formatBits: number) {
  return { ordinal, formatBits };
}

export const CONSTANTS = Object.freeze({
  LOW: errorCorrection(0, 1),
  MEDIUM: errorCorrection(1, 0),
  QUARTILE: errorCorrection(2, 3),
  HIGH: errorCorrection(3, 2),
});

export type ErrorCorrectionLevel = Lowercase<keyof typeof CONSTANTS>;

/**
 * Converts an error correction level string to an error correction object.
 */
export function toErrorCorrectionLevel(
  level: ErrorCorrectionLevel
): ErrorCorrection {
  return CONSTANTS[level.toUpperCase() as Uppercase<typeof level>];
}
