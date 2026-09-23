export type ActivityType = 'burn' | 'shed' | 'shred' | 'breathe' | 'laugh';

const COUNT_KEYS: Record<ActivityType, string> = {
  burn: 'burnCount',
  shed: 'shedCount',
  shred: 'shredCount',
  breathe: 'breatheCount',
  laugh: 'laughCount',
};

export interface ActivitySnapshot {
  burn: number;
  shed: number;
  shred: number;
  breathe: number;
  laugh: number;
  total: number;
  releases: number;
}

const listeners = new Set<() => void>();
let cache: ActivitySnapshot | null = null;

const readNumber = (key: string) => {
  const value = Number.parseInt(localStorage.getItem(key) || '0', 10);
  return Number.isFinite(value) ? value : 0;
};

// One-time migration: before the wash-away "Shed It" tab existed, shedCount
// tracked the shredder. Move that history to shredCount so the new tab starts clean.
const migrateCounts = () => {
  if (localStorage.getItem('shredMigrationDone')) return;
  const oldShed = readNumber(COUNT_KEYS.shed);
  if (oldShed > 0 && readNumber(COUNT_KEYS.shred) === 0) {
    localStorage.setItem(COUNT_KEYS.shred, oldShed.toString());
    localStorage.setItem(COUNT_KEYS.shed, '0');
  }
  localStorage.setItem('shredMigrationDone', '1');
};

const build = (): ActivitySnapshot => {
  migrateCounts();
  // History is no longer kept — drop any old log left behind.
  localStorage.removeItem('activityLog');
  localStorage.removeItem('weeklyCounts');

  const burn = readNumber(COUNT_KEYS.burn);
  const shed = readNumber(COUNT_KEYS.shed);
  const shred = readNumber(COUNT_KEYS.shred);
  const breathe = readNumber(COUNT_KEYS.breathe);
  const laugh = readNumber(COUNT_KEYS.laugh);

  return {
    burn,
    shed,
    shred,
    breathe,
    laugh,
    releases: burn + shed + shred,
    total: burn + shed + shred + breathe + laugh,
  };
};

const emit = () => {
  cache = build();
  listeners.forEach(listener => listener());
};

export const subscribeActivity = (listener: () => void) => {
  listeners.add(listener);
  window.addEventListener('storage', emit);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('storage', emit);
  };
};

export const getActivitySnapshot = (): ActivitySnapshot => {
  if (!cache) cache = build();
  return cache;
};

export const logActivity = (type: ActivityType) => {
  const key = COUNT_KEYS[type];
  localStorage.setItem(key, (readNumber(key) + 1).toString());

  emit();
};
