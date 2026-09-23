export type ActivityType = 'burn' | 'shed' | 'shred' | 'breathe' | 'laugh';

const COUNT_KEYS: Record<ActivityType, string> = {
  burn: 'burnCount',
  shed: 'shedCount',
  shred: 'shredCount',
  breathe: 'breatheCount',
  laugh: 'laughCount',
};

const WEEK_KEY = 'weeklyCounts';

export interface ActivitySnapshot {
  burn: number;
  shed: number;
  shred: number;
  breathe: number;
  laugh: number;
  total: number;
  releases: number;
  /** Counts for the current week only (resets every Monday). */
  week: Record<ActivityType, number>;
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

/** Monday 00:00 local time of the current week. */
export const startOfWeek = (date = new Date()) => {
  const start = new Date(date);
  const day = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const weekIndex = (date = new Date()) =>
  Math.floor(startOfWeek(date).getTime() / (1000 * 60 * 60 * 24 * 7));

const emptyWeek = (): Record<ActivityType, number> => ({
  burn: 0,
  shed: 0,
  shred: 0,
  breathe: 0,
  laugh: 0,
});

const readWeek = (): Record<ActivityType, number> => {
  try {
    const raw = localStorage.getItem(WEEK_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && parsed.weekIndex === weekIndex()) {
      return { ...emptyWeek(), ...parsed.counts };
    }
  } catch {
    // fall through
  }
  return emptyWeek();
};

const build = (): ActivitySnapshot => {
  migrateCounts();
  // History is no longer kept — drop any old log left behind.
  localStorage.removeItem('activityLog');

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
    week: readWeek(),
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

  const week = readWeek();
  week[type] += 1;
  localStorage.setItem(WEEK_KEY, JSON.stringify({ weekIndex: weekIndex(), counts: week }));

  emit();
};
