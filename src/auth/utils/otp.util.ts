import { randomInt } from 'crypto';

export function generateOtp(length = 6): string {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;

  //   return Math.floor(min + Math.random() * (max - min + 1)).toString();
  return randomInt(min, max).toString();
}

/**
 * Why crypto.randomInt() instead of Math.random()?
    Math.random() is not cryptographically secure.

    For OTPs, tokens, verification codes, password reset codes, and authentication-related randomness, production systems generally use Node’s crypto module.

    This is a subtle but important security improvement.
 */
