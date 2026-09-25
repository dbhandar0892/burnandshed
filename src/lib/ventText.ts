// One-time handoff of vented text from the Guided Ritual to the chosen
// release tab (Burn / Shed / Shred). Text is NOT shared between tabs —
// each tab keeps its own private text, and a handoff is consumed once.
let pendingText: string | null = null;

export const setVentText = (next: string) => {
  pendingText = next;
};

export const consumeVentText = (): string | null => {
  const text = pendingText;
  pendingText = null;
  return text;
};
