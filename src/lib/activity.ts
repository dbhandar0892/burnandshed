export type ActivityType = 'burn' | 'shed' | 'shred' | 'breathe' | 'laugh' | 'ritual';

const COUNT_KEYS: Record<ActivityType, string> = {
  burn: 'burnCount',
  shed: 'shedCount',
  shred: 'shredCount',
  breathe: 'breatheCount',
  laugh: 'laughCount',
  ritual: 'ritualCount',
};

export interface ActivitySnapshot {
  burn: number;
  shed: number;
  shred: number;
  breathe: number;
  laugh: number;
  ritual: number;
  total: number;
  releases: number;
  month: { burn: number; shed: number; shred: number; breathe: number; laugh: number; ritual: number; releases: number };
}

const MONTH_KEY = 'monthlyCounts';
const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}`;
};
type MonthStore = { month: string; counts: Partial<Record<ActivityType, number>> };
const readMonth = (): MonthStore => {
  try {
    const raw = JSON.parse(localStorage.getItem(MONTH_KEY) || 'null') as MonthStore | null;
    if (raw && raw.month === currentMonth() && raw.counts) return raw;
  } catch { /* ignore */ }
  return { month: currentMonth(), counts: {} };
};

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
  const ritual = readNumber(COUNT_KEYS.ritual);

  return {
    burn,
    shed,
    shred,
    breathe,
    laugh,
    ritual,
    releases: burn + shed + shred,
    month: (() => {
      const c = readMonth().counts;
      const m = { burn: c.burn || 0, shed: c.shed || 0, shred: c.shred || 0, breathe: c.breathe || 0, laugh: c.laugh || 0, ritual: c.ritual || 0 };
      return { ...m, releases: m.burn + m.shed + m.shred };
    })(),
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

let cacheMonth = '';
export const getActivitySnapshot = (): ActivitySnapshot => {
  if (!cache || cacheMonth !== currentMonth()) { cache = build(); cacheMonth = currentMonth(); }
  return cache;
};

export const logActivity = (type: ActivityType) => {
  const key = COUNT_KEYS[type];
  localStorage.setItem(key, (readNumber(key) + 1).toString());
  const m = readMonth();
  m.counts[type] = (m.counts[type] || 0) + 1;
  localStorage.setItem(MONTH_KEY, JSON.stringify(m));

  emit();
};
