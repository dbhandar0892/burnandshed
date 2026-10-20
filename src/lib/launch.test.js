import { afterEach, expect, test } from 'bun:test';
import config from '../../capacitor.config';
import { cleanupLegacyAppWorker } from './launch';

const originals = new Map();
function mockGlobal(name, value) {
  originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
  Object.defineProperty(globalThis, name, { value, configurable: true });
}
afterEach(() => {
  for (const [name, descriptor] of originals) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else Reflect.deleteProperty(globalThis, name);
  }
  originals.clear();
});

test('native release loads bundled app instead of a remote preview', () => {
  expect(config.webDir).toBe('dist');
  expect(config.server?.url).toBeUndefined();
});

test('startup removes legacy shell worker and caches without touching messaging', async () => {
  const removedWorkers = [];
  const removedCaches = [];
  mockGlobal('navigator', { serviceWorker: { getRegistrations: async () =>
    ['sw.js', 'firebase-messaging-sw.js'].map(path => ({
      active: { scriptURL: `https://burnandshed.com/${path}` },
      unregister: async () => { removedWorkers.push(path); return true; },
    })) } });
  mockGlobal('window', { location: { origin: 'https://burnandshed.com' }, caches: {} });
  mockGlobal('caches', {
    keys: async () => ['burn-and-shed-v6', 'firebase-messaging'],
    delete: async (key) => { removedCaches.push(key); return true; },
  });
  await cleanupLegacyAppWorker();
  expect(removedWorkers).toEqual(['sw.js']);
  expect(removedCaches).toEqual(['burn-and-shed-v6']);
});