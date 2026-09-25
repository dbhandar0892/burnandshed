// One-time handoff of vented text from the Guided Ritual to the chosen
// release tab (Burn / Shed / Shred). Text is NOT shared between tabs —
// each tab keeps its own private text, and a handoff is used once.
//
// peek/clear are separate on purpose: React StrictMode double-invokes
// state initializers, so an initializer must stay pure (read-only). The
// tab clears the handoff in a mount effect after capturing the text.
let pendingText: string | null = null;

export const setVentText = (next: string) => {
  pendingText = next;
};

export const peekVentText = (): string | null => pendingText;

export const clearVentText = () => {
  pendingText = null;
};
