// List of keywords related to crisis situations.
// This is not exhaustive and should be expanded based on expert advice.
const crisisKeywords = [
  'suicide', 'kill myself', 'k!ll myself', 'kms',
  'self-harm', 'self harm', 'sh', 'cut myself',
  'end my life', 'want to die', 'don\'t want to live',
  'hopeless', 'no reason to live',
  'overdose',
  'hang myself',
  'shoot myself'
];

/**
 * Checks if a given message contains any crisis-related keywords.
 * The check is case-insensitive and looks for whole words to reduce false positives.
 * @param message - The user's message to check.
 * @returns true if a crisis keyword is found, false otherwise.
 */
export const checkForCrisisKeywords = (message: string): boolean => {
  const lowerCaseMessage = message.toLowerCase();
  
  for (const keyword of crisisKeywords) {
    // Use a regex to match whole words to avoid matching parts of other words (e.g., 'sh' in 'should').
    const regex = new RegExp(`\\b${keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lowerCaseMessage)) {
      return true;
    }
  }
  
  return false;
};
