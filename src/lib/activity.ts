export type ActivityType = 'burn' | 'shed' | 'shred' | 'breathe' | 'laugh';

interface ActivityEvent {
  type: ActivityType;
  ts: number;
}

const LOG_KEY = 'activityLog';
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
  log: ActivityEvent[];
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

const readLog = (): ActivityEvent[] => {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const build = (): ActivitySnapshot => {
  migrateCounts();
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
    log: readLog(),
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

  const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 90;
  const log = readLog()
    .filter(entry => entry && typeof entry.ts === 'number' && entry.ts > cutoff)
    .concat({ type, ts: Date.now() })
    .slice(-500);
  localStorage.setItem(LOG_KEY, JSON.stringify(log));

  emit();
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
