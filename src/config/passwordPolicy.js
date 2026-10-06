/**
 * Canonical Bank-Grade Password Policy Configuration (v2.2)
 */
export const PASSWORD_POLICY = {
  MIN_LENGTH: 16,
  REQUIRE_LOWERCASE: true,
  REQUIRE_UPPERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SYMBOLS: true,
  SPECIAL_CHARACTERS: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  HINT: 'Must be at least 16 characters, including uppercase, lowercase, a number, and a symbol.',
};

/**
 * Validate password against standard policy
 * @param {string} password
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validatePassword(password) {
  const errors = [];
  if (!password || password.length < PASSWORD_POLICY.MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_POLICY.MIN_LENGTH} characters.`);
  }
  if (PASSWORD_POLICY.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Must contain at least one lowercase letter.');
  }
  if (PASSWORD_POLICY.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Must contain at least one uppercase letter.');
  }
  if (PASSWORD_POLICY.REQUIRE_NUMBERS && !/[0-9]/.test(password)) {
    errors.push('Must contain at least one number.');
  }
  if (PASSWORD_POLICY.REQUIRE_SYMBOLS && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    errors.push('Must contain at least one special character.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}