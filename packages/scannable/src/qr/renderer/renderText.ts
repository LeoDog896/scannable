import {
  FrameOptions,
  FrameResults,
  UserFacingFrameOptions,
  defaultFrameOptions,
  generateFrame,
} from '../Frame.js';
import { WithRequired } from '../utils.js';
interface IsolatedTextRenderOptions {
  /** The activated characters (black on a regular QR code.) */
  readonly foregroundChar: string;
  /** The non-activated characters (white on a regular QR code) */
  readonly backgroundChar: string;
}

export const renderTextFromFrame = (
  options: IsolatedTextRenderOptions,
  frame: FrameResults
): string => {
  let str = '';

  for (let i = 0; i < frame.size; i++) {
    for (let j = 0; j < frame.size; j++) {
      if (frame.buffer[j * frame.size + i]) {
        str += options.foregroundChar;
      } else {
        str += options.backgroundChar;
      }
    }
    if (i !== frame.size - 1) {
      str += '\n';
    }
  }

  return str;
};

/**
 * The options for the renderText function.
 */
type TextRenderOptions = FrameOptions & IsolatedTextRenderOptions;
/**
 * Render a QR code in text format.
 *
 * @param options - The options you want the QR code to have.
 * If you don't have any specific preferences, pass a regular string.
 *
 * @returns The QR code in text format
 */
export const renderText = (
  options: Readonly<UserFacingFrameOptions<TextRenderOptions>> | string
): string => {
  const processedOptions: WithRequired<TextRenderOptions, 'value'> = {
    ...defaultFrameOptions,
    foregroundChar: '#',
    backgroundChar: ' ',
    ...(typeof options === 'string' ? { value: options } : options),
  };

  const frame = generateFrame(processedOptions);

  return renderTextFromFrame(processedOptions, frame);
};
