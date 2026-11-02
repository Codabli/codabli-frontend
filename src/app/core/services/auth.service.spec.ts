import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiInterceptor } from '../http/api.interceptor';
import { AUTH_STORAGE_KEY, AuthService } from './auth.service';

describe('AuthService', () => {
  let http: HttpTestingController;

  function setUp(): AuthService {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([apiInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    return TestBed.inject(AuthService);
  }

  function login(service: AuthService, expiresIn = 300): void {
    service.login({ email: 'prof@codabli.dev', password: 'secret' }).subscribe();
    http
      .expectOne('/api/auth/login')
      .flush({ accessToken: 'jwt-1', refreshToken: 'r', expiresIn, tokenType: 'Bearer' });
  }

  beforeEach(() => sessionStorage.clear());

  afterEach(() => {
    http.verify();
    vi.useRealTimers();
  });

  it('garde la session en sessionStorage et la restaure au rechargement', () => {
    login(setUp());
    expect(sessionStorage.getItem(AUTH_STORAGE_KEY)).toContain('jwt-1');

    TestBed.resetTestingModule();
    const reloaded = setUp();

    expect(reloaded.isLoggedIn()).toBe(true);
    expect(reloaded.getAccessToken()).toBe('jwt-1');
  });

  it('ignore une session expirée', () => {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ accessToken: 'old', expiresAt: Date.now() - 1 }));

    expect(setUp().isLoggedIn()).toBe(false);
  });

  it('ferme la session quand le token expire', () => {
    vi.useFakeTimers();
    const service = setUp();
    login(service, 60);

    vi.advanceTimersByTime(61_000);

    expect(service.getAccessToken()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
    expect(sessionStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it('logout efface la session', () => {
    const service = setUp();
    login(service);

    service.logout();

    expect(service.isLoggedIn()).toBe(false);
    expect(sessionStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });
});
