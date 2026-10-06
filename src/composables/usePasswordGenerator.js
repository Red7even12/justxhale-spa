import { PASSWORD_POLICY } from '@/config/passwordPolicy';

export function usePasswordGenerator() {
  /**
   * Generates a cryptographically strong 16+ character password
   * that strictly satisfies uppercase, lowercase, numbers, and symbols.
   */
  const generateStrongPassword = (length = PASSWORD_POLICY.MIN_LENGTH) => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = uppercase + lowercase + numbers + symbols;

    const targetLength = Math.max(length, PASSWORD_POLICY.MIN_LENGTH);

    // Ensure at least one of each required character class is present
    const guaranteed = [
      uppercase[crypto.getRandomValues(new Uint32Array(1))[0] % uppercase.length],
      lowercase[crypto.getRandomValues(new Uint32Array(1))[0] % lowercase.length],
      numbers[crypto.getRandomValues(new Uint32Array(1))[0] % numbers.length],
      symbols[crypto.getRandomValues(new Uint32Array(1))[0] % symbols.length],
    ];

    // Fill the remainder
    const remaining = [];
    const randomBuffer = new Uint32Array(targetLength - guaranteed.length);
    crypto.getRandomValues(randomBuffer);

    for (let i = 0; i < randomBuffer.length; i++) {
      remaining.push(allChars[randomBuffer[i] % allChars.length]);
    }

    // Shuffle using Fisher-Yates
    const combined = [...guaranteed, ...remaining];
    for (let i = combined.length - 1; i > 0; i--) {
      const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }

    return combined.join('');
  };

  return {
    generateStrongPassword,
    policyHint: PASSWORD_POLICY.HINT,
  };
}