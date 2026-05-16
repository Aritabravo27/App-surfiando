export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};

export function resolveApiBaseUrl(): string {
  const u = environment.apiUrl?.trim();
  if (u) {
    return u.replace(/\/$/, '');
  }
  if (
    typeof globalThis !== 'undefined' &&
    'location' in globalThis &&
    (globalThis as { location?: { origin?: string } }).location?.origin
  ) {
    const origin = (globalThis as { location: { origin: string } }).location.origin;
    return `${origin}/api`;
  }
  return 'http://localhost:3000/api';
}
