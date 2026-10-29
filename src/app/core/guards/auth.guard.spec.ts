import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { AUTH_STORAGE_KEY } from '../services/auth.service';
import { requireAuthentication } from './auth.guard';

describe('requireAuthentication', () => {
  const state = { url: '/create-danced-tale/context' } as RouterStateSnapshot;

  function run(): boolean | UrlTree {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient()] });
    return TestBed.runInInjectionContext(
      () => requireAuthentication({} as ActivatedRouteSnapshot, state) as boolean | UrlTree,
    );
  }

  beforeEach(() => sessionStorage.clear());

  it('laisse passer un utilisateur connecté', () => {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ accessToken: 'jwt', expiresAt: Date.now() + 60_000 }));

    expect(run()).toBe(true);
  });

  it('renvoie au login en gardant la page demandée', () => {
    const result = run();

    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe(
      '/login?returnUrl=%2Fcreate-danced-tale%2Fcontext',
    );
  });
});
