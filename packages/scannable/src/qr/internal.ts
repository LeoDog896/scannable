/* Code ported from https://www.nayuki.io/page/qr-code-generator-library */

import { appendBits, getBytes } from './utils/bitUtils.js';
import {
	ECC_CODEWORDS_PER_BLOCK,
	MAX_VERSION,
	MIN_VERSION,
	NUM_ERROR_CORRECTION_BLOCKS,
} from './utils/constants.js';
import {
	ErrorCorrection,
	CONSTANTS as ErrorCorrectionConstants,
} from './utils/errorCorrection.js';
import { ReedSolomonGenerator } from './utils/reedSolomon.js';
import {
	getTotalBits,
	makeBytes,
	makeSegments,
	type QrSegment,
} from './utils/segment.js';
import { numCharCountBits } from './utils/segmentMode.js';

type byte = number;
type int = number;

/** Returns true iff the i'th bit of x is set to 1. */
function getBit(x: int, i: int): boolean {
	return ((x >>> i) & 1) != 0;
}

function assertVersion(version: int): void {
	if (version < MIN_VERSION || version > MAX_VERSION)
		throw 'Version number out of range';
}

/**
 * Returns a sequence of positions of the alignment patterns in ascending order. These positions are
 * used on both the x and y axes. Each value in the resulting sequence is in the range [0, 177).
 * This stateless pure function could be implemented as table of 40 variable-length lists of integers.
 */
function getAlignmentPatternPositions(version: int): Array<int> {
	assertVersion(version);

	if (version == 1) return [];
	else {
		const size: int = version * 4 + 17;
		const numAlign: int = Math.floor(version / 7) + 2;
		const step: int =
			version == 32 ? 26 : Math.ceil((size - 13) / (numAlign * 2 - 2)) * 2;

		const result: Array<int> = [6];
		for (let i = 0, pos = size - 7; i < numAlign - 1; i++, pos -= step)
			result.splice(1, 0, pos);
		return result;
	}
}

/**
 * Returns the number of data bits that can be stored in a QR Code of the given version number, after
 * all function modules are excluded. This includes remainder bits, so it might not be a multiple of 8.
 * The result is in the range [208, 29648]. This could be implemented as a 40-entry lookup table.
 */
function getNumRawDataModules(version: int): int {
	assertVersion(version);
	let result: int = (16 * version + 128) * version + 64;
	if (version >= 2) {
		const numAlign: int = Math.floor(version / 7) + 2;
		result -= (25 * numAlign - 10) * numAlign - 55;
		if (version >= 7) result -= 18 * 2; // Subtract version information
	}
	return result;
}

/**
 * Returns the number of 8-bit data (i.e. not error correction) codewords contained in any
 * QR Code of the given version number and error correction level, with remainder bits discarded.
 * This stateless pure function could be implemented as a (40*4)-cell lookup table.
 */
function getNumDataCodewords(version: int, ecl: ErrorCorrection): int {
	assertVersion(version);
	return (
		Math.floor(getNumRawDataModules(version) / 8) -
		ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][version] *
			NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][version]
	);
}

// For use in getPenaltyScore(), when evaluating which mask is best.
const PENALTY_N1 = 3;
const PENALTY_N2 = 3;
const PENALTY_N3 = 40;
const PENALTY_N4 = 10;

/*
 * Represents an square grid of black and white cells for a QR Code symbol,
 * and covers the QR Code model 2 specification, supporting all versions (sizes)
 * from 1 to 40, all 4 error correction levels.
 */
export interface QrCode {
	/** This QR Code symbol's version number, which is always between 1 and 40 (inclusive). */
	version: int;

	/**
	 * The width and height of this QR Code symbol, measured in modules.
	 * Always equal to version * 4 + 17, in the range 21 to 177.
	 */
	size: int;

	/** The error correction level used in this QR Code symbol. */
	errorCorrectionLevel: ErrorCorrection;

	/**
	 * The mask pattern used in this QR Code symbol, in the range 0 to 7 (i.e. unsigned 3-bit integer).
	 * Note that even if the constructor was called with automatic masking requested
	 * (mask = -1), the resulting object will still have a mask value between 0 and 7.
	 */
	mask: int;

	/** The modules of this QR Code symbol (false = white, true = black). */
	modules: Array<Array<boolean>>;

	/** Indicates function modules that are not subjected to masking. */
	isFunction: Array<Array<boolean>>;
}

/**
 * Sets the color of a module and marks it as a function module.
 * Only used by the constructor. Coordinates must be in bounds.
 */
function setFunctionModule(
	x: int,
	y: int,
	isBlack: boolean,
	modules: boolean[][],
	isFunction: boolean[][]
): void {
	modules[y][x] = isBlack;
	isFunction[y][x] = true;
}

/**
 * Draws two copies of the format bits (with its own error correction code)
 * based on the given mask and this object's error correction level field.
 */
function drawFormatBits(
	mask: int,
	errorCorrectionLevel: ErrorCorrection,
	size: int,
	modules: boolean[][],
	isFunction: boolean[][]
): void {
	// Calculate error correction code and pack bits
	const data: int = (errorCorrectionLevel.formatBits << 3) | mask; // errCorrLvl is uint2, mask is uint3
	let rem: int = data;
	for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
	const bits = ((data << 10) | rem) ^ 0x5412; // uint15
	if (bits >>> 15 != 0) throw 'Assertion error';

	// Draw first copy
	for (let i = 0; i <= 5; i++)
		setFunctionModule(8, i, getBit(bits, i), modules, isFunction);
	setFunctionModule(8, 7, getBit(bits, 6), modules, isFunction);
	setFunctionModule(8, 8, getBit(bits, 7), modules, isFunction);
	setFunctionModule(7, 8, getBit(bits, 8), modules, isFunction);
	for (let i = 9; i < 15; i++)
		setFunctionModule(14 - i, 8, getBit(bits, i), modules, isFunction);

	// Draw second copy
	for (let i = 0; i <= 7; i++)
		setFunctionModule(size - 1 - i, 8, getBit(bits, i), modules, isFunction);
	for (let i = 8; i < 15; i++)
		setFunctionModule(8, size - 15 + i, getBit(bits, i), modules, isFunction);
	setFunctionModule(8, size - 8, true, modules, isFunction); // Always black
}

/**
 * Draws two copies of the version bits (with its own error correction code),
 * based on this object's version field, iff `7 <= version <= 40`.
 */
function drawVersion(
	version: int,
	size: int,
	modules: boolean[][],
	isFunction: boolean[][]
): void {
	if (version < 7) return;

	// Calculate error correction code and pack bits
	let rem: int = version; // version is uint6, in the range [7, 40]
	for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
	const bits: int = (version << 12) | rem; // uint18
	if (bits >>> 18 != 0) throw 'Assertion error';

	// Draw two copies
	for (let i = 0; i < 18; i++) {
		const bt: boolean = getBit(bits, i);
		const a: int = size - 11 + (i % 3);
		const b: int = Math.floor(i / 3);
		setFunctionModule(a, b, bt, modules, isFunction);
		setFunctionModule(b, a, bt, modules, isFunction);
	}
}

/**
 * Draws a 9*9 finder pattern including the border separator,
 * with the center module at (x, y). Modules can be out of bounds.
 */
function drawFinderPattern(
	x: int,
	y: int,
	size: int,
	modules: boolean[][],
	isFunction: boolean[][]
): void {
	for (let i = -4; i <= 4; i++) {
		for (let j = -4; j <= 4; j++) {
			const dist: int = Math.max(Math.abs(i), Math.abs(j)); // Chebyshev/infinity norm
			const xx: int = x + j;
			const yy: int = y + i;
			if (0 <= xx && xx < size && 0 <= yy && yy < size)
				setFunctionModule(xx, yy, dist != 2 && dist != 4, modules, isFunction);
		}
	}
}

/**
 * Draws a 5*5 alignment pattern, with the center module
 * at (x, y). All modules must be in bounds.
 */
function drawAlignmentPattern(
	x: int,
	y: int,
	modules: boolean[][],
	isFunction: boolean[][]
): void {
	for (let i = -2; i <= 2; i++) {
		for (let j = -2; j <= 2; j++)
			setFunctionModule(
				x + j,
				y + i,
				Math.max(Math.abs(i), Math.abs(j)) != 1,
				modules,
				isFunction
			);
	}
}

/** Reads this object's version field, and draws and marks all function modules. */
function drawFunctionPatterns(
	size: number,
	version: number,
	errorCorrectionLevel: ErrorCorrection,
	modules: boolean[][],
	isFunction: boolean[][]
): void {
	// Draw horizontal and vertical timing patterns
	for (let i = 0; i < size; i++) {
		setFunctionModule(6, i, i % 2 == 0, modules, isFunction);
		setFunctionModule(i, 6, i % 2 == 0, modules, isFunction);
	}

	// Draw 3 finder patterns (all corners except bottom right; overwrites some timing modules)
	drawFinderPattern(3, 3, size, modules, isFunction);
	drawFinderPattern(size - 4, 3, size, modules, isFunction);
	drawFinderPattern(3, size - 4, size, modules, isFunction);

	// Draw numerous alignment patterns
	const alignPatPos: Array<int> = getAlignmentPatternPositions(version);
	const numAlign: int = alignPatPos.length;
	for (let i = 0; i < numAlign; i++) {
		for (let j = 0; j < numAlign; j++) {
			// Don't draw on the three finder corners
			if (
				!(
					(i == 0 && j == 0) ||
					(i == 0 && j == numAlign - 1) ||
					(i == numAlign - 1 && j == 0)
				)
			)
				drawAlignmentPattern(
					alignPatPos[i],
					alignPatPos[j],
					modules,
					isFunction
				);
		}
	}

	// Draw configuration data
	drawFormatBits(0, errorCorrectionLevel, size, modules, isFunction); // Dummy mask value; overwritten later in the constructor
	drawVersion(version, size, modules, isFunction);
}

/*-- Private helper methods for constructor: Codewords and masking --*/

/**
 * Returns a new byte string representing the given data with the appropriate error correction
 * codewords appended to it, based on this object's version and error correction level.
 */
function addEccAndInterleave(
	data: Array<byte>,
	version: number,
	errorCorrectionLevel: ErrorCorrection
): Array<byte> {
	if (data.length != getNumDataCodewords(version, errorCorrectionLevel))
		throw 'Invalid argument';

	// Calculate parameter numbers
	const numBlocks: int =
		NUM_ERROR_CORRECTION_BLOCKS[errorCorrectionLevel.ordinal][version];
	const blockEccLen: int =
		ECC_CODEWORDS_PER_BLOCK[errorCorrectionLevel.ordinal][version];
	const rawCodewords: int = Math.floor(getNumRawDataModules(version) / 8);
	const numShortBlocks: int = numBlocks - (rawCodewords % numBlocks);
	const shortBlockLen: int = Math.floor(rawCodewords / numBlocks);

	// Split data into blocks and append ECC to each block
	const blocks: Array<Array<byte>> = [];
	const rs = new ReedSolomonGenerator(blockEccLen);
	for (let i = 0, k = 0; i < numBlocks; i++) {
		const dat: Array<byte> = data.slice(
			k,
			k + shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1)
		);
		k += dat.length;
		const ecc: Array<byte> = rs.getRemainder(dat);
		if (i < numShortBlocks) dat.push(0);
		ecc.forEach((b: byte) => dat.push(b));
		blocks.push(dat);
	}

	// Interleave (not concatenate) the bytes from every block into a single sequence
	const result: Array<byte> = [];
	for (let i = 0; i < blocks[0].length; i++) {
		for (let j = 0; j < blocks.length; j++) {
			// Skip the padding byte in short blocks
			if (i != shortBlockLen - blockEccLen || j >= numShortBlocks)
				result.push(blocks[j][i]);
		}
	}
	if (result.length != rawCodewords) throw 'Assertion error';
	return result;
}

/**
 * Draws the given sequence of 8-bit codewords (data and error correction) onto the entire
 * data area of this QR Code symbol. Function modules need to be marked off before this is called.
 */
function drawCodewords(
	data: Array<byte>,
	version: int,
	size: int,
	isFunction: readonly boolean[][],
	modules: boolean[][]
): void {
	if (data.length != Math.floor(getNumRawDataModules(version) / 8))
		throw 'Invalid argument';
	let i: int = 0; // Bit index into the data
	// Do the funny zigzag scan
	for (let right = size - 1; right >= 1; right -= 2) {
		// Index of right column in each column pair
		if (right == 6) right = 5;
		for (let vert = 0; vert < size; vert++) {
			// Vertical counter
			for (let j = 0; j < 2; j++) {
				const x: int = right - j; // Actual x coordinate
				const upward: boolean = ((right + 1) & 2) == 0;
				const y: int = upward ? size - 1 - vert : vert; // Actual y coordinate
				if (!isFunction[y][x] && i < data.length * 8) {
					modules[y][x] = getBit(data[i >>> 3], 7 - (i & 7));
					i++;
				}
				// If there are any remainder bits (0 to 7), they are already
				// set to 0/false/white when the grid of modules was initialized
			}
		}
	}
	if (i != data.length * 8) throw 'Assertion error';
}

/**
 * XORs the codeword modules in this QR Code with the given mask pattern.
 * The function modules must be marked and the codeword bits must be drawn
 * before masking. Due to the arithmetic of XOR, calling applyMask() with
 * the same mask value a second time will undo the mask. A final well-formed
 * QR Code symbol needs exactly one (not zero, two, etc.) mask applied.
 */
function applyMask(
	mask: int,
	size: int,
	modules: boolean[][],
	isFunction: readonly boolean[][]
): void {
	if (mask < 0 || mask > 7) throw 'Mask value out of range';
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			let invert: boolean;
			switch (mask) {
				case 0:
					invert = (x + y) % 2 == 0;
					break;
				case 1:
					invert = y % 2 == 0;
					break;
				case 2:
					invert = x % 3 == 0;
					break;
				case 3:
					invert = (x + y) % 3 == 0;
					break;
				case 4:
					invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 == 0;
					break;
				case 5:
					invert = ((x * y) % 2) + ((x * y) % 3) == 0;
					break;
				case 6:
					invert = (((x * y) % 2) + ((x * y) % 3)) % 2 == 0;
					break;
				case 7:
					invert = (((x + y) % 2) + ((x * y) % 3)) % 2 == 0;
					break;
				default:
					throw 'Assertion error';
			}
			if (invert && !isFunction[y][x]) modules[y][x] = !modules[y][x];
		}
	}
}

/**
 * Calculates and returns the penalty score based on state of this QR Code's current modules.
 * This is used by the automatic mask choice algorithm to find the mask pattern that yields the lowest score.
 */
function getPenaltyScore(size: int, modules: readonly boolean[][]): int {
	let result: int = 0;

	// Adjacent modules in row having same color
	for (let y = 0; y < size; y++) {
		for (let x = 0, runX = 0, colorX = false; x < size; x++) {
			if (x == 0 || modules[y][x] != colorX) {
				colorX = modules[y][x];
				runX = 1;
			} else {
				runX++;
				if (runX == 5) result += PENALTY_N1;
				else if (runX > 5) result++;
			}
		}
	}
	// Adjacent modules in column having same color
	for (let x = 0; x < size; x++) {
		for (let y = 0, runY = 0, colorY = false; y < size; y++) {
			if (y == 0 || modules[y][x] != colorY) {
				colorY = modules[y][x];
				runY = 1;
			} else {
				runY++;
				if (runY == 5) result += PENALTY_N1;
				else if (runY > 5) result++;
			}
		}
	}

	// 2*2 blocks of modules having same color
	for (let y = 0; y < size - 1; y++) {
		for (let x = 0; x < size - 1; x++) {
			const color = modules[y][x];
			if (
				color == modules[y][x + 1] &&
				color == modules[y + 1][x] &&
				color == modules[y + 1][x + 1]
			)
				result += PENALTY_N2;
		}
	}

	// Finder-like pattern in rows
	for (let y = 0; y < size; y++) {
		for (let x = 0, bits = 0; x < size; x++) {
			bits = ((bits << 1) & 0x7ff) | (modules[y][x] ? 1 : 0);
			if (x >= 10 && (bits == 0x05d || bits == 0x5d0))
				// Needs 11 bits accumulated
				result += PENALTY_N3;
		}
	}
	// Finder-like pattern in columns
	for (let x = 0; x < size; x++) {
		for (let y = 0, bits = 0; y < size; y++) {
			bits = ((bits << 1) & 0x7ff) | (modules[y][x] ? 1 : 0);
			if (y >= 10 && (bits == 0x05d || bits == 0x5d0))
				// Needs 11 bits accumulated
				result += PENALTY_N3;
		}
	}

	// Balance of black and white modules
	let black: int = 0;
	modules.forEach((row: Array<boolean>) => {
		row.forEach((color: boolean) => {
			if (color) black++;
		});
	});
	const total = size * size; // Note that size is odd, so black/total != 1/2
	// Compute the smallest integer k >= 0 such that (45-5k)% <= black/total <= (55+5k)%
	const k: int = Math.ceil(Math.abs(black * 20 - total * 10) / total) - 1;
	result += k * PENALTY_N4;
	return result;
}

/**
 * This constructor creates a new QR Code symbol with the given version number, error correction level, binary data array,
 * and mask number. mask = -1 is for automatic choice, or 0 to 7 for fixed choice. This is a cumbersome low-level constructor
 * that should not be invoked directly by the user. To go one level up, see the QrCode.encodeSegments() function.
 */
export function qrCode(
	dataCodewords: Array<byte>,
	mask: int,
	version: int,
	errorCorrectionLevel: ErrorCorrection
): QrCode {
	// Check arguments and handle simple scalar fields
	if (mask < -1 || mask > 7) throw 'Mask value out of range';
	if (version < MIN_VERSION || version > MAX_VERSION)
		throw 'Version value out of range';
	const size = version * 4 + 17;

	const modules = [];
	const isFunction = [];

	// Initialize both grids to be size*size arrays of Boolean false
	const row: Array<boolean> = [];
	for (let i = 0; i < size; i++) row.push(false);
	for (let i = 0; i < size; i++) {
		modules.push(row.slice());
		isFunction.push(row.slice());
	}

	// Handle grid fields, draw function patterns, draw all codewords
	drawFunctionPatterns(
		size,
		version,
		errorCorrectionLevel,
		modules,
		isFunction
	);
	const allCodewords: Array<byte> = addEccAndInterleave(
		dataCodewords,
		version,
		errorCorrectionLevel
	);
	drawCodewords(allCodewords, version, size, isFunction, modules);

	// Handle masking
	if (mask == -1) {
		// Automatically choose best mask
		let minPenalty: int = Number.MAX_SAFE_INTEGER;
		for (let i = 0; i < 8; i++) {
			drawFormatBits(i, errorCorrectionLevel, size, modules, isFunction);
			applyMask(i, size, modules, isFunction);
			const penalty: int = getPenaltyScore(size, modules);
			if (penalty < minPenalty) {
				mask = i;
				minPenalty = penalty;
			}
			applyMask(i, size, modules, isFunction); // Undoes the mask due to XOR
		}
	}
	if (mask < 0 || mask > 7) throw 'Assertion error';
	drawFormatBits(mask, errorCorrectionLevel, size, modules, isFunction); // Overwrite old format bits
	applyMask(mask, size, modules, isFunction); // Apply the final choice of mask

	return {
		version,
		size,
		mask,
		errorCorrectionLevel,
		modules,
		isFunction,
	};
}

/**
 * Returns a QR Code symbol representing the given data segments with the given encoding parameters.
 * The smallest possible QR Code version within the given range is automatically chosen for the output.
 * This function allows the user to create a custom sequence of segments that switches
 * between modes (such as alphanumeric and binary) to encode text more efficiently.
 * This function is considered to be lower level than simply encoding text or binary data.
 */
function encodeSegments(
	segments: Array<QrSegment>,
	ecl: ErrorCorrection,
	minVersion: int = 1,
	maxVersion: int = 40,
	mask: int = -1,
	boostEcl = true
): QrCode {
	if (
		!(
			MIN_VERSION <= minVersion &&
			minVersion <= maxVersion &&
			maxVersion <= MAX_VERSION
		) ||
		mask < -1 ||
		mask > 7
	)
		throw 'Invalid value';

	// Find the minimal version number to use
	let version: int;
	let dataUsedBits: int;
	for (version = minVersion; ; version++) {
		const dataCapacityBits: int = getNumDataCodewords(version, ecl) * 8; // Number of data bits available
		const usedBits: number | null = getTotalBits(segments, version);
		if (usedBits != null && usedBits <= dataCapacityBits) {
			dataUsedBits = usedBits;
			break; // This version number is found to be suitable
		}
		if (version >= maxVersion)
			// All versions in the range could not fit the given data
			throw `Data too long (> ${dataCapacityBits / 8} bytes)`;
	}

	// Increase the error correction level while the data still fits in the current version number
	[
		ErrorCorrectionConstants.MEDIUM,
		ErrorCorrectionConstants.QUARTILE,
		ErrorCorrectionConstants.HIGH,
	].forEach((newEcl: ErrorCorrection) => {
		// From low to high
		if (boostEcl && dataUsedBits <= getNumDataCodewords(version, newEcl) * 8)
			ecl = newEcl;
	});

	// Concatenate all segments to create the data bit string
	const bb: number[] = [];
	for (const seg of segments) {
		appendBits(bb, seg.mode.modeBits, 4);
		appendBits(bb, seg.numChars, numCharCountBits(seg.mode, version));
		for (const bit of seg.bitData) bb.push(bit);
	}

	// Add terminator and pad up to a byte if applicable
	const dataCapacityBits: int = getNumDataCodewords(version, ecl) * 8;
	if (bb.length > dataCapacityBits) throw 'Assertion error';
	appendBits(bb, 0, Math.min(4, dataCapacityBits - bb.length));
	appendBits(bb, 0, (8 - (bb.length % 8)) % 8);
	if (bb.length % 8 != 0) throw 'Assertion error';

	// Pad with alternating bytes until data capacity is reached
	for (let padByte = 0xec; bb.length < dataCapacityBits; padByte ^= 0xec ^ 0x11)
		appendBits(bb, padByte, 8);

	// Create the QR Code symbol
	return qrCode(getBytes(bb), mask, version, ecl);
}

/**
 * Returns a QR Code symbol representing the specified Unicode text string at the specified error correction level.
 * As a conservative upper bound, this function is guaranteed to succeed for strings that have 738 or fewer
 * Unicode code points (not UTF-16 code units) if the low error correction level is used. The smallest possible
 * QR Code version is automatically chosen for the output. The ECC level of the result may be higher than the
 * ecl argument if it can be done without increasing the version.
 */
export function encodeText(
	text: string,
	ecl: ErrorCorrection,
	minVersion: int = 1,
	maxVersion: int = 40,
	mask: int = -1,
	boostEcl = true
): QrCode {
	const segments = makeSegments(text);
	return encodeSegments(segments, ecl, minVersion, maxVersion, mask, boostEcl);
}

/**
 * Returns a QR Code symbol representing the given binary data string at the given error correction level.
 * This function always encodes using the binary segment mode, not any text mode. The maximum number of
 * bytes allowed is 2953. The smallest possible QR Code version is automatically chosen for the output.
 * The ECC level of the result may be higher than the ecl argument if it can be done without increasing the version.
 */
export function encodeBinary(data: Array<byte>, ecl: ErrorCorrection): QrCode {
	const seg = makeBytes(data);
	return encodeSegments([seg], ecl);
}
