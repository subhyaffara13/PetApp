/**
 * Profanity Filter Utility
 * Validates text inputs against a list of forbidden/obscene words in English and transliterated Hebrew.
 */

const BAD_WORDS_LIST = [
  // English
  'fuck',
  'shit',
  'bitch',
  'asshole',
  'bastard',
  'cunt',
  'dick',
  'pussy',
  'cock',
  'whore',
  'slut',
  'nigger',
  'faggot',
  'crap',
  'piss',
  // Transliterated Hebrew / Local slang
  'kuss',
  'kusamak',
  'ben zona',
  'zain',
  'sharmuta',
  'maniyak',
  'zonah',
  'kaki',
];

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateProfanity(input: string): ValidationResult {
  if (!input || !input.trim()) {
    return { isValid: true };
  }

  const normalized = input.toLowerCase().trim();

  for (const word of BAD_WORDS_LIST) {
    // Check whole word or substring match
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(normalized) || normalized.includes(word)) {
      return {
        isValid: false,
        error: `Inappropriate language detected ("${word}"). Please keep pet profile names family-friendly.`,
      };
    }
  }

  return { isValid: true };
}
