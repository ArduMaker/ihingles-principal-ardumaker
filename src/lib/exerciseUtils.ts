// Utility functions for exercise validation

/**
 * Normalizes a string for comparison:
 * - Converts to lowercase
 * - Removes accents
 * - Trims whitespace
 */
export function normalizeAnswer(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Checks if user answer matches any of the valid answers
 * @param userAnswer - The user's input
 * @param validAnswers - Array of valid answers
 * @returns true if there's a match
 */
export function checkAnswer(userAnswer: string, validAnswers: (string | undefined)[]): boolean {
  const normalizedUser = normalizeAnswer(userAnswer);
  
  if (!normalizedUser) return false;
  
  return validAnswers.some(valid => {
    if (!valid) return false;
    return normalizeAnswer(valid) === normalizedUser;
  });
}
