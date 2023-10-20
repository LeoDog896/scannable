import {
  type ErrorCorrection,
  CONSTANTS as ErrorCorrectionConstants,
} from './qr/errorCorrection.js';
import { encodeText } from './internal.js';

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
  readonly level: ErrorCorrection;
  /** The mask type. IF none is specified, one will be automatically chosen based on badness. */
  readonly maskType?: MaskType;
}

export interface FrameResults {
  readonly buffer: Uint8Array;
  readonly width: number;
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
  const qrCode = encodeText(
    options.value,
    options.level ?? defaultFrameOptions.level
  );

  return {
    buffer: Uint8Array.from(
      qrCode.modules.map((row) => row.map((bit) => (bit ? 1 : 0))).flat()
    ),
    width: qrCode.size,
    version: qrCode.version,
  };
}
