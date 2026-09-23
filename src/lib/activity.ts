export type ActivityType = 'burn' | 'shed' | 'shred' | 'breathe' | 'laugh' | 'ritual';

const COUNT_KEYS: Record<ActivityType, string> = {
  burn: 'burnCount',
  shed: 'shedCount',
  shred: 'shredCount',
  breathe: 'breatheCount',
  laugh: 'laughCount',
  ritual: 'ritualCount',
};

export interface MonthCounts {
  burn: number;
  shed: number;
  shred: number;
  breathe: number;
  laugh: number;
  ritual: number;
  releases: number;
}

export interface MonthEntry {
  key: string; // "YYYY-M"
  label: string; // e.g. "September 2026"
  counts: MonthCounts;
}

export interface ActivitySnapshot {
  burn: number;
  shed: number;
  shred: number;
  breathe: number;
  laugh: number;
  ritual: number;
  total: number;
  releases: number;
  month: MonthCounts;
  months: MonthEntry[]; // newest first, up to the last 3 calendar months
}

const MONTH_KEY = 'monthlyCounts';
const MONTHS_KEPT = 3;
const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}`;
const currentMonth = () => monthKey(new Date());
const lastMonths = (): string[] => {
  const keys: string[] = [];
  const d = new Date();
  for (let i = 0; i < MONTHS_KEPT; i++) {
    keys.push(monthKey(new Date(d.getFullYear(), d.getMonth() - i, 1)));
  }
  return keys;
};
const monthLabel = (key: string) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' });
};
type MonthStore = { months: Record<string, Partial<Record<ActivityType, number>>> };
const readMonthStore = (): MonthStore => {
  try {
    const raw = JSON.parse(localStorage.getItem(MONTH_KEY) || 'null');
    // Migrate the old single-month shape { month, counts }
    if (raw && raw.months) return { months: raw.months };
    if (raw && raw.month && raw.counts) return { months: { [raw.month]: raw.counts } };
  } catch { /* ignore */ }
  return { months: {} };
};
const writeMonthStore = (store: MonthStore) => {
  // Keep only the last 3 calendar months; older monthly data disappears.
  const keep = new Set(lastMonths());
  const months: MonthStore['months'] = {};
  for (const key of Object.keys(store.months)) {
    if (keep.has(key)) months[key] = store.months[key];
  }
  localStorage.setItem(MONTH_KEY, JSON.stringify({ months }));
};
const toMonthCounts = (c: Partial<Record<ActivityType, number>> = {}): MonthCounts => {
  const m = {
    burn: c.burn || 0,
    shed: c.shed || 0,
    shred: c.shred || 0,
    breathe: c.breathe || 0,
    laugh: c.laugh || 0,
    ritual: c.ritual || 0,
  };
  return { ...m, releases: m.burn + m.shed + m.shred };
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

  const store = readMonthStore();
  const keys = lastMonths();
  const months: MonthEntry[] = keys.map(key => ({
    key,
    label: monthLabel(key),
    counts: toMonthCounts(store.months[key]),
  }));

  return {
    burn,
    shed,
    shred,
    breathe,
    laugh,
    ritual,
    releases: burn + shed + shred,
    month: months[0].counts,
    months,
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
  const store = readMonthStore();
  const mk = currentMonth();
  const counts = store.months[mk] || {};
  counts[type] = (counts[type] || 0) + 1;
  store.months[mk] = counts;
  writeMonthStore(store);

  emit();
};
