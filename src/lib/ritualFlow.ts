import type { ActivityType } from '@/lib/activity';

const PENDING_KEY = 'guidedRitualPendingRelease';
const RETURN_KEY = 'guidedRitualReturnToReset';

export interface PendingRitualRelease {
  type: Extract<ActivityType, 'burn' | 'shed' | 'shred'>;
  characterCount: number;
}

export const beginRitualRelease = (release: PendingRitualRelease) => {
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(release));
  sessionStorage.removeItem(RETURN_KEY);
};

export const getPendingRitualRelease = (): PendingRitualRelease | null => {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingRitualRelease>;
    if (!['burn', 'shed', 'shred'].includes(parsed.type ?? '')) return null;
    return {
      type: parsed.type as PendingRitualRelease['type'],
      characterCount: typeof parsed.characterCount === 'number' ? parsed.characterCount : 0,
    };
  } catch {
    return null;
  }
};

export const completeRitualRelease = () => {
  sessionStorage.removeItem(PENDING_KEY);
  sessionStorage.setItem(RETURN_KEY, '1');
};

export const consumeRitualReturn = () => {
  const shouldReturn = sessionStorage.getItem(RETURN_KEY) === '1';
  sessionStorage.removeItem(RETURN_KEY);
  return shouldReturn;
};


export const getRitualReleaseDuration = (release: PendingRitualRelease) => {
  if (release.type === 'shed') return 3400;
  if (release.type === 'shred') return 3250;
  return 1500 + 450 + release.characterCount * 115 + 1250 + 200;
};