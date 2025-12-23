// EBCDIC encoding table for common ASCII characters
const asciiToEbcdic: { [key: string]: string } = {
  ' ': '40', '!': '5A', '"': '7F', '#': '7B', '$': '5B', '%': '6C', '&': '50',
  "'": '7D', '(': '4D', ')': '5D', '*': '5C', '+': '4E', ',': '6B', '-': '60',
  '.': '4B', '/': '61', '0': 'F0', '1': 'F1', '2': 'F2', '3': 'F3', '4': 'F4',
  '5': 'F5', '6': 'F6', '7': 'F7', '8': 'F8', '9': 'F9', ':': '7A', ';': '5E',
  '<': '4C', '=': '7E', '>': '6E', '?': '6F', '@': '7C', 'A': 'C1', 'B': 'C2',
  'C': 'C3', 'D': 'C4', 'E': 'C5', 'F': 'C6', 'G': 'C7', 'H': 'C8', 'I': 'C9',
  'J': 'D1', 'K': 'D2', 'L': 'D3', 'M': 'D4', 'N': 'D5', 'O': 'D6', 'P': 'D7',
  'Q': 'D8', 'R': 'D9', 'S': 'E2', 'T': 'E3', 'U': 'E4', 'V': 'E5', 'W': 'E6',
  'X': 'E7', 'Y': 'E8', 'Z': 'E9', '[': 'BA', '\\': 'E0', ']': 'BB', '^': '5F',
  '_': '6D', '`': '79', 'a': '81', 'b': '82', 'c': '83', 'd': '84', 'e': '85',
  'f': '86', 'g': '87', 'h': '88', 'i': '89', 'j': '91', 'k': '92', 'l': '93',
  'm': '94', 'n': '95', 'o': '96', 'p': '97', 'q': '98', 'r': '99', 's': 'A2',
  't': 'A3', 'u': 'A4', 'v': 'A5', 'w': 'A6', 'x': 'A7', 'y': 'A8', 'z': 'A9',
  '{': 'C0', '|': '4F', '}': 'D0', '~': 'A1'
};

const convertToEbcdic = (char: string): string => {
  return asciiToEbcdic[char] || '3F'; // '3F' is EBCDIC for '?' (unknown char)
};

export const parseAndConvertPastedString = (pastedText: string): string => {
  // If the pasted text is already a plain hexadecimal string, return it as-is
  if (/^[0-9A-Fa-f]+$/.test(pastedText)) {
    return pastedText.toUpperCase();
  }

  let result = '';
  let i = 0;

  while (i < pastedText.length) {
    // Check if we're at the start of a hex block <0x...>
    if (pastedText[i] === '<' && pastedText.substring(i, i + 3) === '<0x') {
      // Find the closing >
      const closeIndex = pastedText.indexOf('>', i);
      if (closeIndex !== -1) {
        // Extract hex value between <0x and >
        const hexBlock = pastedText.substring(i + 3, closeIndex);
        // Validate it's actually hex
        if (/^[0-9A-Fa-f]+$/.test(hexBlock)) {
          result += hexBlock;
          i = closeIndex + 1;
          continue;
        }
      }
    }
    
    // Regular character - convert to EBCDIC
    const char = pastedText[i];
    result += convertToEbcdic(char);
    i++;
  }

  return result.toUpperCase();
};
