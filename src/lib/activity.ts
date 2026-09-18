export type ActivityType = 'burn' | 'shed' | 'breathe' | 'laugh';

interface ActivityEvent {
  type: ActivityType;
  ts: number;
}

const LOG_KEY = 'activityLog';
const COUNT_KEYS: Record<ActivityType, string> = {
  burn: 'burnCount',
  shed: 'shedCount',
  breathe: 'breatheCount',
  laugh: 'laughCount',
};

export interface ActivitySnapshot {
  burn: number;
  shed: number;
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
  const burn = readNumber(COUNT_KEYS.burn);
  const shed = readNumber(COUNT_KEYS.shed);
  const breathe = readNumber(COUNT_KEYS.breathe);
  const laugh = readNumber(COUNT_KEYS.laugh);

  return {
    burn,
    shed,
    breathe,
    laugh,
    releases: burn + shed,
    total: burn + shed + breathe + laugh,
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
