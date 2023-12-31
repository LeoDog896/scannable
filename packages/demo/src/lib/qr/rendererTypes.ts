interface Option<Type, DisplayName> {
	name: string;
	type: DisplayName;
	value: Type;
	defaultValue: Type;
}

type TextOption = Option<string, 'text'>;
type BooleanOption = Option<boolean, 'boolean'>;
type ColorOption = Option<string, 'color'>;
type NumberOption = Option<number, 'number'> & {
	min?: number;
	max?: number;
	step?: number;
};

type OptionList = TextOption | BooleanOption | ColorOption | NumberOption;
type OptionNames = OptionList['type'];

type OptionParam<T extends OptionNames> = Extract<OptionList, { type: T }>;

type Options<P extends OptionNames> = {
	[key: string]: { type: P } & OptionParam<P>;
};

export type RenderSystem<OptionsType extends Options<OptionNames> = Options<OptionNames>> =
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
				render: (value: string, options: OptionsType, size: number) => string;
		  }
	);

export const createRenderSystems = <OptionsType extends Options<OptionNames>>(
	o: RenderSystem<OptionsType>[]
): RenderSystem<OptionsType>[] => o;
