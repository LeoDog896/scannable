import { UserFacingFrameOptions, generateFrame, FrameOptions, RenderOptionsDefaults, defaultFrameOptions } from '../Frame';

export interface ImageLikeRenderOptions extends FrameOptions {
  readonly backgroundColor: string;
  readonly backgroundAlpha: number;
  readonly foregroundColor: string;
  readonly foregroundAlpha: number;
  readonly width: number;
  readonly height: number;
  readonly x: number;
  readonly y: number;
}

export const defaultImageLikeRenderOptions: RenderOptionsDefaults<ImageLikeRenderOptions> = Object.freeze({
  backgroundColor: 'white',
  backgroundAlpha: 1,
  foregroundColor: 'black',
  foregroundAlpha: 1,
  width: 100,
  height: 100,
  x: 0,
  y: 0,
  ...defaultFrameOptions
});

/**
 * Renders a QR code onto a canvas context
 * 
 * @param options - the options to use for the frame.
 * @param context - The canvas context to use
 * @param width - The width of the QR code, **not the canvas**
 * @param height - The height of the QR code, **not the canvas**
 */
export const renderContext = (
  options: UserFacingFrameOptions<ImageLikeRenderOptions> | string,
  context: CanvasRenderingContext2D,
  width?: number,
  height?: number
) => {
  
  const jsonOptions = typeof options === 'string' ? { value: options } : options;

  const processedOptions: ImageLikeRenderOptions = { 
    ...defaultImageLikeRenderOptions,
    width: width ?? (context.canvas.width - ((jsonOptions.x ?? 0) * 2)),
    height: height ?? (context.canvas.height - ((jsonOptions.y ?? 0) * 2)),
    ...jsonOptions,
  };
  
  const frame = generateFrame(processedOptions);
  
  const rawModuleSizeWidth = processedOptions.width / frame.width;
  const rawModuleSizeHeight = processedOptions.height / frame.width;

  const offsetX = (rawModuleSizeWidth % 1) * frame.width / 2;
  const offsetY = (rawModuleSizeHeight % 1) * frame.width / 2;

  const moduleSizeWidth = Math.floor(rawModuleSizeWidth);
  const moduleSizeHeight = Math.floor(rawModuleSizeHeight);

  for (let i = 0; i < frame.width; i++) {
    for (let j = 0; j < frame.width; j++) {
      if (frame.buffer[(j * frame.width) + i]) {
        context.fillStyle = processedOptions.foregroundColor;
        context.globalAlpha = processedOptions.foregroundAlpha;

        context.fillRect(
          offsetX + (moduleSizeWidth * i) + processedOptions.x,
          offsetY + (moduleSizeHeight * j) + processedOptions.y,
          moduleSizeWidth, moduleSizeHeight
        );
      } else {
        context.fillStyle = processedOptions.backgroundColor;
        context.globalAlpha = processedOptions.backgroundAlpha;

        context.fillRect(
          offsetX + (moduleSizeWidth * i) + processedOptions.x,
          offsetY + (moduleSizeHeight * j) + processedOptions.y,
          moduleSizeWidth, moduleSizeHeight
        );
      }
    }
  }
};

export const renderCanvas = (options: UserFacingFrameOptions<ImageLikeRenderOptions> | string , canvas: HTMLCanvasElement) => {
  const context = canvas.getContext('2d');

  if (context == null) {
    throw Error('2d Context is null!');
  }

  return renderContext(options, context);
};
