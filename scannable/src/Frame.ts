import { encodeText } from './internal.js';
import {
  CONSTANTS as ErrorCorrectionConstants,
  ErrorCorrectionLevel,
  toErrorCorrectionLevel,
  type ErrorCorrection,
} from './qr/errorCorrection.js';

/* All Mask types with visible descriptions. */
export enum MaskType {
  ALTERNATING_TILES = 0,
  ALTERNATING_HORIZONTAL_LINES = 1,
  ALTERNATING_VERTICAL_LINES_TWO_GAP = 2,
  DIAGONAL = 3,
  FOUR_BY_TWO_RECTANGLE_ALTERNATING = 4,
  FLOWER_IN_SQAURE = 5,
  DIAGONAL_SQUARE = 6,
  ALTERNATING_PUZZLE_PIECE = 7,
}

/**
 * The options used by {@link Frame}.
 */
export interface FrameOptions {
  /** The value to be encoded. */
  readonly value: string;
  /** The ECC level to be used. Default is L */
  readonly level: ErrorCorrection | ErrorCorrectionLevel;
  /** The mask type. IF none is specified, one will be automatically chosen based on badness. */
  readonly maskType?: MaskType;
}

export interface FrameResults {
  /** The Uint8array that represents this QR code - a "2d" array of 1|0 */
  readonly buffer: Uint8Array;
  /** The size of the QR code - both width and height */
  readonly size: number;
  /** The version of the generated QR code, between 1 and 40. */
  readonly version: number;
}

/** Utility to make value required for users inputting in a value. */
export type UserFacingFrameOptions<T = FrameOptions> = Partial<T> & {
  readonly value: string;
};

/** Make every option required except for value -- the opposite of UserFacingFrameOptions */
export type RenderOptionsDefaults<T = FrameOptions> = Omit<T, 'value'> & {
  readonly value?: string;
};

export const defaultFrameOptions: RenderOptionsDefaults<FrameOptions> =
  Object.freeze({
    level: ErrorCorrectionConstants.LOW,
  });

/**
 * Generates information for a QR code frame based on a specific value to be encoded.
 *
 * @param options - the options to be used
 */
export function generateFrame(options: UserFacingFrameOptions): FrameResults {
  const level = options.level ?? defaultFrameOptions.level;
  const qrCode = encodeText(
    options.value,
    typeof level == 'string' ? toErrorCorrectionLevel(level) : level
  );

  return {
    buffer: Uint8Array.from(
      qrCode.modules.map((row) => row.map((bit) => (bit ? 1 : 0))).flat()
    ),
    size: qrCode.size,
    version: qrCode.version,
  };
}
