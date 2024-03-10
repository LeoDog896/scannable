import { appendBits } from './bitUtils.js';
import { MAX_VERSION, MIN_VERSION } from './constants.js';
import {
	CONSTANTS as SegmentModeConstants,
	numCharCountBits,
	type SegmentMode,
} from './segmentMode.js';

// Can test whether a string is encodable in numeric mode (such as by using QrSegment.makeNumeric()).
const NUMERIC_REGEX = /^[0-9]*$/;

// Can test whether a string is encodable in alphanumeric mode (such as by using QrSegment.makeAlphanumeric()).
const ALPHANUMERIC_REGEX = /^[A-Z0-9 $%*+./:-]*$/;

// The set of all legal characters in alphanumeric mode, where each character value maps to the index in the string.
const ALPHANUMERIC_CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

type bit = 0 | 1;

/*
 * Represents a character string to be encoded in a QR Code symbol.
 * Each segment has a mode, and a sequence of characters that is already encoded as
 * a sequence of bits. Instances of this class are immutable.
 * This segment class imposes no length restrictions, but QR Codes have restrictions.
 * Even in the most favorable conditions, a QR Code can only hold 7089 characters of data.
 * Any segment longer than this is meaningless for the purpose of generating QR Codes.
 */
export interface QrSegment {
	/** The mode indicator for this segment. */
	readonly mode: SegmentMode;
	/** The length of this segment's unencoded data, measured in characters. */
	readonly numChars: number;
	/** Array of 0s and 1s as all the bits */
	readonly bitData: readonly bit[];
}

/** Creates a new QR Code segment with the given attributes and data. */
export function qrSegment(
	mode: SegmentMode,
	numChars: number,
	bitData: bit[]
): QrSegment {
	if (numChars < 0) throw 'Invalid argument';
	return { mode, numChars, bitData };
}

/** Returns a segment representing the given binary data encoded in byte mode. */
export function makeBytes(data: number[]): QrSegment {
	const bb: bit[] = [];
	data.forEach((b) => appendBits(bb, b, 8));
	return qrSegment(SegmentModeConstants.BYTE, data.length, bb);
}

/** Returns a segment representing the given string of decimal digits encoded in numeric mode. */
function makeNumeric(digits: string): QrSegment {
	if (!NUMERIC_REGEX.test(digits))
		throw 'String contains non-numeric characters';
	const bb: bit[] = [];
	let i: number;
	for (
		i = 0;
		i + 3 <= digits.length;
		i += 3 // Process groups of 3
	)
		appendBits(bb, parseInt(digits.substr(i, 3), 10), 10);
	const rem = digits.length - i;
	if (rem > 0)
		// 1 or 2 digits remaining
		appendBits(bb, parseInt(digits.substring(i), 10), rem * 3 + 1);
	return qrSegment(SegmentModeConstants.NUMERIC, digits.length, bb);
}

/**
 * Returns a segment representing the given text string encoded in alphanumeric mode.
 * The characters allowed are: 0 to 9, A to Z (uppercase only), space,
 * dollar, percent, asterisk, plus, hyphen, period, slash, colon.
 */
function makeAlphanumeric(text: string): QrSegment {
	if (!ALPHANUMERIC_REGEX.test(text))
		throw 'String contains unencodable characters in alphanumeric mode';
	const bb: bit[] = [];
	let i: number;
	for (i = 0; i + 2 <= text.length; i += 2) {
		// Process groups of 2
		let temp = ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)) * 45;
		temp += ALPHANUMERIC_CHARSET.indexOf(text.charAt(i + 1));
		appendBits(bb, temp, 11);
	}
	if (i < text.length)
		// 1 character remaining
		appendBits(bb, ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)), 6);
	return qrSegment(SegmentModeConstants.ALPHANUMERIC, text.length, bb);
}

/**
 * Returns a segment representing an Extended Channel Interpretation
 * (ECI) designator with the given assignment value.
 */
export function makeEci(assignVal: number): QrSegment {
	const bb: bit[] = [];
	if (0 <= assignVal && assignVal < 1 << 7) appendBits(bb, assignVal, 8);
	else if (1 << 7 <= assignVal && assignVal < 1 << 14) {
		appendBits(bb, 2, 2);
		appendBits(bb, assignVal, 14);
	} else if (1 << 14 <= assignVal && assignVal < 1000000) {
		appendBits(bb, 6, 3);
		appendBits(bb, assignVal, 21);
	} else throw 'ECI assignment value out of range';
	return qrSegment(SegmentModeConstants.ECI, 0, bb);
}

/** Gets the number of bits needed to encode the given segments at the given version. */
export function getTotalBits(
	segs: Array<QrSegment>,
	version: number
): number | null {
	if (version < MIN_VERSION || version > MAX_VERSION)
		throw 'Version number out of range';
	let result = 0;
	for (const seg of segs) {
		const ccbits: number = numCharCountBits(seg.mode, version);
		// Fail if segment length value doesn't fit in the length field's bit-width
		if (seg.numChars >= 1 << ccbits) return null;
		result += 4 + ccbits + seg.bitData.length;
	}
	return result;
}

/** Returns a new array of bytes representing the given string encoded in UTF-8. */
function toUtf8ByteArray(str: string): number[] {
	str = encodeURI(str);
	const result: number[] = [];
	for (let i = 0; i < str.length; i++) {
		if (str.charAt(i) != '%') result.push(str.charCodeAt(i));
		else {
			result.push(parseInt(str.substr(i + 1, 2), 16));
			i += 2;
		}
	}
	return result;
}

/**
 * Returns a new mutable list of zero or more segments to represent the given Unicode text string.
 * The result may use various segment modes and switch modes to optimize the length of the bit stream.
 */
export function makeSegments(text: string): Array<QrSegment> {
	// Select the most efficient segment encoding automatically
	if (text == '') return [];
	else if (NUMERIC_REGEX.test(text)) return [makeNumeric(text)];
	else if (ALPHANUMERIC_REGEX.test(text)) return [makeAlphanumeric(text)];
	else return [makeBytes(toUtf8ByteArray(text))];
}
