import { InjectionToken } from '@angular/core';

/** Préfixe commun des endpoints backend. Routé par le proxy en dev, par Caddy en prod. */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api',
});

/** Délai maximal d'attente d'une réponse backend. */
export const API_TIMEOUT_MS = new InjectionToken<number>('API_TIMEOUT_MS', {
  providedIn: 'root',
  factory: () => 15_000,
});
