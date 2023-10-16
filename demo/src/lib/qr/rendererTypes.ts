interface Option<T, R> {
  readonly name: string;
  readonly type: R;
  value: T;
  readonly defaultValue: T;
}

type TextOption = Option<string, "text">;
type BooleanOption = Option<boolean, "boolean">;
type ColorOption = Option<string, "color">
type NumberOption = Option<number, "number"> & { readonly min?: number, readonly max?: number, readonly step?: number };
type OptionsAdvanced = { readonly [key: string] : TextOption | BooleanOption | ColorOption | NumberOption }

type ReturnCreateOptionsAdvanced<T extends OptionsAdvanced> = 
  {
    [K in keyof T]: 
      T[K]['type'] extends 'text'
        ? TextOption
      : T[K]['type'] extends 'boolean'
        ? BooleanOption
      : T[K]['type'] extends 'color'
        ? ColorOption
      : NumberOption
  }

export type RenderSystem<OptionsType extends ReturnCreateOptionsAdvanced<OptionsAdvanced>> = 
// Default Render System Key/Value
({
  name: string
  options: OptionsType
} & ({ //Canvas
  type: 'canvas';
  render: (value: string, canvas: HTMLCanvasElement, options: OptionsType, size: number) => void
  currentCanvas?: HTMLCanvasElement
} | { // Text
  type: "text";
  lineSpacing: string;
  tracking: string;
  render: (value: string, options: OptionsType) => string;
}))

export const createRenderSystems = <T extends ReturnCreateOptionsAdvanced<any>>(o: RenderSystem<T>[]): RenderSystem<T>[] => o;