import { expect, test } from 'bun:test';
import {
  appOriginForUserAgent,
  buildHandoffUrl,
  parseAuthHandoff,
  parseHashParams,
} from './authHandoff';

const TOKENS = {
  access_token: 'eyJhbGciOiJI.eyJzdWIiOiJhYmM.super-secret-signature',
  refresh_token: 'rt-abc123+plus-safe',
};

test('handoff tokens round-trip through a URL hash, including plus signs', () => {
  const url = buildHandoffUrl('iPhone UA', TOKENS);
  expect(url).toBe(`capacitor://localhost/#bs_at=${encodeURIComponent(TOKENS.access_token)}&bs_rt=${encodeURIComponent(TOKENS.refresh_token)}`);
  const hash = url.slice(url.indexOf('#'));
  expect(parseAuthHandoff(hash)).toEqual(TOKENS);
});

test('no handoff when the hash is missing or incomplete', () => {
  expect(parseAuthHandoff('')).toBeNull();
  expect(parseAuthHandoff('#bs_at=only-access')).toBeNull();
  expect(parseAuthHandoff('#bs_rt=only-refresh')).toBeNull();
});

test('hash params are decoded without turning + into spaces', () => {
  expect(parseHashParams('#a=x%20y+z')).toEqual({ a: 'x y+z' });
  expect(parseHashParams('#a=1&b=2&novalue')).toEqual({ a: '1', b: '2' });
});

test('handoff targets the app origin of the right platform', () => {
  expect(appOriginForUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBe('capacitor://localhost/');
  expect(appOriginForUserAgent('Mozilla/5.0 (Linux; Android 14; Pixel 8)')).toBe('https://localhost/');
  expect(appOriginForUserAgent('Mozilla/5.0 (Macintosh) Safari')).toBe('');
  expect(buildHandoffUrl('Mozilla/5.0 (Macintosh) Safari', TOKENS)).toBeNull();
});
