export type TextSegment =
  | { type: 'word'; characters: Array<{ character: string; index: number }> }
  | { type: 'space'; text: string; index: number }
  | { type: 'break'; index: number };

export const segmentText = (text: string): TextSegment[] => {
  const segments: TextSegment[] = [];
  const characters = Array.from(text);
  let index = 0;

  while (index < characters.length) {
    const character = characters[index];

    if (character === '\n') {
      segments.push({ type: 'break', index });
      index += 1;
      continue;
    }

    if (/\s/.test(character)) {
      const start = index;
      let whitespace = '';
      while (index < characters.length && characters[index] !== '\n' && /\s/.test(characters[index])) {
        whitespace += characters[index];
        index += 1;
      }
      segments.push({ type: 'space', text: whitespace, index: start });
      continue;
    }

    const word: Array<{ character: string; index: number }> = [];
    while (index < characters.length && !/\s/.test(characters[index])) {
      word.push({ character: characters[index], index });
      index += 1;
    }
    segments.push({ type: 'word', characters: word });
  }

  return segments;
};