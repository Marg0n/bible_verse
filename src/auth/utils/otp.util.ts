import { randomInt } from 'crypto';

export function generateOtp(length = 6): string {
  const min = 10 ** (length - 1); //? e.g., 100000 for length=6 & Smallest number with the desired length (inclusive)
  // const max = 10 ** length - 1; //? e.g., 999999 for length=6 & Largest number with the desired length (inclusive)
  const max = 10 ** length; //? Exclude upper bound, so use 10^length

  //   return Math.floor(min + Math.random() * (max - min + 1)).toString();  //? max + 1 makes it so it can also give 999999
  return randomInt(min, max).toString(); //? range [100000, 999999]
}

/**
 * Why crypto.randomInt() instead of Math.random()?
    Math.random() is not cryptographically secure.

    For OTPs, tokens, verification codes, password reset codes, and authentication-related randomness, production systems generally use Node’s crypto module.

    This is a subtle but important security improvement.
 */
