/**
  * Returns the product of the two given field elements modulo GF(2^8/0x11D). The arguments and result
  * are unsigned 8-bit integers. This could be implemented as a lookup table of 256*256 entries of uint8.
  */
function multiply(x: number, y: number): number {
  if (x >>> 8 != 0 || y >>> 8 != 0) throw 'Byte out of range';
  // Russian peasant multiplication
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  if (z >>> 8 != 0) throw 'Assertion error';
  return z;
}

/*
 * Computes the Reed-Solomon error correction codewords for a sequence of data codewords
 * at a given degree. Objects are immutable, and the state only depends on the degree.
 * This class exists because each data block in a QR Code shares the same the divisor polynomial.
 */
export class ReedSolomonGenerator {
  // Coefficients of the divisor polynomial, stored from highest to lowest power, excluding the leading term which
  // is always 1. For example the polynomial x^3 + 255x^2 + 8x + 93 is stored as the uint8 array {255, 8, 93}.
  private readonly coefficients: Array<number> = [];

  // Creates a Reed-Solomon ECC generator for the given degree. This could be implemented
  // as a lookup table over all possible parameter values, instead of as an algorithm.
  public constructor(degree: number) {
    if (degree < 1 || degree > 255) throw new RangeError('Degree out of range (1 to 255)');
    const coefs = this.coefficients;

    // Start with the monomial x^0
    for (let i = 0; i < degree - 1; i++) coefs.push(0);
    coefs.push(1);

    // Compute the product polynomial (x - r^0) * (x - r^1) * (x - r^2) * ... * (x - r^{degree-1}),
    // drop the highest term, and store the rest of the coefficients in order of descending powers.
    // Note that r = 0x02, which is a generator element of this field GF(2^8/0x11D).
    let root = 1;
    for (let i = 0; i < degree; i++) {
      // Multiply the current product by (x - r^i)
      for (let j = 0; j < coefs.length; j++) {
        coefs[j] = multiply(coefs[j], root);
        if (j + 1 < coefs.length) coefs[j] ^= coefs[j + 1];
      }
      root = multiply(root, 0x02);
    }
  }

  // Computes and returns the Reed-Solomon error correction codewords for the given
  // sequence of data codewords. The returned object is always a new byte array.
  // This method does not alter this object's state (because it is immutable).
  public getRemainder(data: Array<number>): Array<number> {
    // Compute the remainder by performing polynomial division
    const result: Array<number> = this.coefficients.map(() => 0);
    data.forEach((b: number) => {
      const factor = b ^ result.shift() as number;
      result.push(0);
      for (let i = 0; i < result.length; i++)
        result[i] ^= multiply(
          this.coefficients[i],
          factor
        );
    });
    return result;
  }
}
