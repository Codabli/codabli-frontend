import { HttpContextToken } from '@angular/common/http';
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

/**
 * Délai propre à une requête, à la place de `API_TIMEOUT_MS`. Pour une réponse en flux,
 * il s'applique entre deux morceaux reçus.
 */
export const API_REQUEST_TIMEOUT_MS = new HttpContextToken<number | null>(() => null);
