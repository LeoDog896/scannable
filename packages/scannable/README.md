# scannable

[![npm](https://img.shields.io/npm/v/scannable)](https://npmjs.com/package/scannable)
[![GitHub](https://img.shields.io/badge/license-MIT-green)](https://github.com/LeoDog896/scannable/blob/master/LICENSE)
[![demo](https://img.shields.io/badge/demo-live-brightgreen)](https://leodog896.github.io/scannable/demo)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/scannable)
![npm](https://img.shields.io/npm/dt/scannable)

QR code generation for a modern web.

> The core of this is from [nayuki's QR code generator](https://github.com/nayuki/QR-Code-generator/)

TIP: If you want to try out the methods, open inspect element.

## Install

```sh
npm install scannable
```

### Deno

```ts
import {} from 'https://esm.sh/scannable'; // all functions are exposed!
```

## QR Generation

```ts
import {
	renderCanvas,
	renderSVG,
	renderText,
	renderTwoTone,
} from 'scannable/qr';

// Render it to a canvas
renderCanvas('https://yahoo.net', coolCanvas);

// Outputs a qr code with ASCII text
const text = renderText('https://example.com');

// You can also specify options
const customText = renderText({
	value: 'https://google.com',
	foregroundChar: '%',
});

// You can even use unicode characters to squish text.
const unicodeText = renderTwoTone('https://leodog896.github.io/scannable');

// Or make an SVG!
const svgHTML = renderSVG('https://netflix.com');
```
