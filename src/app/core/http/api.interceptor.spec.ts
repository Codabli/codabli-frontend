import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_STORAGE_KEY, AuthService } from '../services/auth.service';
import { API_REQUEST_TIMEOUT_MS } from './api.config';
import { apiInterceptor } from './api.interceptor';

describe('apiInterceptor', () => {
  let http: HttpTestingController;
  let client: HttpClient;

  function setUp(token?: string): void {
    if (token) {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ accessToken: token, expiresAt: Date.now() + 60_000 }));
    }
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([apiInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    client = TestBed.inject(HttpClient);
  }

  beforeEach(() => sessionStorage.clear());

  afterEach(() => http.verify());

  it("ajoute le token de l'utilisateur connecté aux appels backend", () => {
    setUp('jwt-1');

    client.get('/api/contes-danses/mes-contes').subscribe();

    expect(http.expectOne('/api/contes-danses/mes-contes').request.headers.get('Authorization')).toBe('Bearer jwt-1');
  });

  it("n'envoie pas d'en-tête sans utilisateur connecté", () => {
    setUp();

    client.get('/api/actualites').subscribe();

    expect(http.expectOne('/api/actualites').request.headers.has('Authorization')).toBe(false);
  });

  it("n'envoie pas le token hors du backend", () => {
    setUp('jwt-1');

    client.get('/i18n/fr.json').subscribe();

    expect(http.expectOne('/i18n/fr.json').request.headers.has('Authorization')).toBe(false);
  });

  it('ferme la session sur un 401', () => {
    setUp('jwt-1');
    let kind: string | undefined;

    client.get('/api/contes-danses/mes-contes').subscribe({ error: (error) => (kind = error.kind) });
    http.expectOne('/api/contes-danses/mes-contes').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(kind).toBe('unauthorized');
    expect(TestBed.inject(AuthService).isLoggedIn()).toBe(false);
  });

  it('applique le délai propre à une requête à la place du délai par défaut', () => {
    setUp();
    vi.useFakeTimers();
    let kind: string | undefined;

    client
      .get('/api/ia/lent', { context: new HttpContext().set(API_REQUEST_TIMEOUT_MS, 60_000) })
      .subscribe({ error: (error) => (kind = error.kind) });
    const request = http.expectOne('/api/ia/lent');

    vi.advanceTimersByTime(30_000);
    expect(kind).toBeUndefined();
    vi.advanceTimersByTime(30_000);
    expect(kind).toBe('timeout');
    expect(request.cancelled).toBe(true);
    vi.useRealTimers();
  });
});
