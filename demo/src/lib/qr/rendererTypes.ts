interface Option<Type, DisplayName> {
	readonly name: string;
	readonly type: DisplayName;
	value: Type;
	readonly defaultValue: Type;
}

type TextOption = Option<string, 'text'>;
type BooleanOption = Option<boolean, 'boolean'>;
type ColorOption = Option<string, 'color'>;
type NumberOption = Option<number, 'number'> & {
	readonly min?: number;
	readonly max?: number;
	readonly step?: number;
};

type Options = {
	readonly [key: string]: TextOption | BooleanOption | ColorOption | NumberOption;
};

type ReturnCreateOptionsAdvanced<T extends Options> = {
	[K in keyof T]: T[K]['type'] extends 'text'
		? TextOption
		: T[K]['type'] extends 'boolean'
		? BooleanOption
		: T[K]['type'] extends 'color'
		? ColorOption
		: NumberOption;
};

export type RenderSystem<OptionsType extends ReturnCreateOptionsAdvanced<Options>> =
	// Default Render System key / value
	{
		name: string;
		options: OptionsType;
	} & (
		| {
				// Canvas
				type: 'canvas';
				render: (
					value: string,
					canvas: HTMLCanvasElement,
					options: OptionsType,
					size: number
				) => void;
				currentCanvas?: HTMLCanvasElement;
		  }
		| {
				// Text
				type: 'text';
				lineSpacing: string;
				tracking: string;
				render: (value: string, options: OptionsType) => string;
		  }
    | {
      // HTML
      type: 'html';
      render: (value: string, options: OptionsType) => string;
    }
	);

export const createRenderSystems = <T extends ReturnCreateOptionsAdvanced<any>>(
	o: RenderSystem<T>[]
): RenderSystem<T>[] => o;
