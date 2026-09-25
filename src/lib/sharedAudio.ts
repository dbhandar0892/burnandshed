// One app-wide AudioContext that is unlocked on the first user tap and never
// closed, so sounds started later (e.g. after a timer) are not blocked by the
// browser's autoplay rules.
let shared: AudioContext | null = null;

export const getSharedAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!shared || shared.state === 'closed') {
    const Ctx = window.AudioContext || (window as typeof window & {
      webkitAudioContext?: typeof AudioContext;
    }).webkitAudioContext;
    if (!Ctx) return null;
    shared = new Ctx();
  }
  if (shared.state !== 'running') shared.resume().catch(() => undefined);
  return shared;
};

if (typeof window !== 'undefined') {
  const unlock = () => {
    const ctx = getSharedAudioContext();
    if (!ctx) return;
    // Play a silent blip to fully unlock audio on iOS Safari
    try {
      const src = ctx.createBufferSource();
      src.buffer = ctx.createBuffer(1, 1, 22050);
      src.connect(ctx.destination);
      src.start(0);
    } catch { /* ignore */ }
  };
  ['pointerdown', 'touchend', 'keydown'].forEach(evt =>
    window.addEventListener(evt, unlock, { capture: true, passive: true }),
  );
}
