import { promises as fs } from 'fs';
import { generateFrame } from '../src';
import chance from 'chance';

const rng = new chance.Chance("scannable");

function randomInRanges(ranges: [number, number][]) {
  const total = ranges.reduce((acc, [min, max]) => acc + max - min + 1, 0);
  let random = rng.integer({ min: 0, max: total - 1 });
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
  return BigInt("0b" + [...buffer].map(x => x == 1 ? "1" : "0").join("")).toString();
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