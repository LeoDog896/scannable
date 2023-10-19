import { promises as fs } from 'fs';
import { generateFrame } from '../src';

function randomInRanges(ranges: [number, number][]) {
  const total = ranges.reduce((acc, [min, max]) => acc + max - min + 1, 0);
  let random = Math.floor(Math.random() * total);
  for (const [min, max] of ranges) {
    if (random < max - min + 1) return min + random;
    random -= max - min + 1;
  }
  throw new Error("unreachable");
}

const randomChars = (length: number) => Array.from({ length }, () => String.fromCharCode(randomInRanges([
  [14, 20000]
]))).join("");

function stringify(buffer: Uint8Array) {
  const str = BigInt("0b" + [...buffer].map(x => x == 1 ? "1" : "0").join("")).toString();
  return str.substring(0, str.length - 1);
}

function fromString(str: string) {
  const buffer = new Uint8Array(Math.ceil(str.length / 8));
  for (let i = 0; i < str.length; i++) {
    if (str[i] == "1") buffer[Math.floor(i / 8)] |= 1 << (i % 8);
  }
  return buffer;
}

// open a file
const fd = await fs.open("test/resourceGen.txt", "w");

for (let i = 0; i < 1000; i += 10) {
  const value = randomChars(i);
  const { buffer } = generateFrame({ value });
  await fd.write(value + "\n" + stringify(buffer) + "\n");
  console.log(`Wrote ${i}th frame!`);
}

await fd.close();

console.log("Done!");