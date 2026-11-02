import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../http/api.config';
import type { LoginRequest, LoginResponse } from '../../models/interfaces/auth.interface';

/** Clé de la session en `sessionStorage` : survit au rechargement, pas à la fermeture de l'onglet. */
export const AUTH_STORAGE_KEY = 'codabli.auth';

interface StoredSession {
  accessToken: string;
  /** Échéance du token, en millisecondes depuis l'epoch. */
  expiresAt: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/auth`;
  private readonly session = signal<StoredSession | null>(readSession());
  readonly isLoggedIn = computed(() => this.session() !== null);

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.url}/login`, credentials).pipe(
      tap((response) => {
        const session = { accessToken: response.accessToken, expiresAt: Date.now() + response.expiresIn * 1000 };
        this.session.set(session);
        writeSession(session);
      }),
    );
  }

  /** Token courant, ou `null` s'il est absent ou expiré (la session est alors fermée). */
  getAccessToken(): string | null {
    const session = this.session();
    if (session && session.expiresAt <= Date.now()) {
      this.logout();
      return null;
    }
    return session?.accessToken ?? null;
  }

  logout(): void {
    this.session.set(null);
    writeSession(null);
  }
}

function readSession(): StoredSession | null {
  try {
    const session = JSON.parse(sessionStorage.getItem(AUTH_STORAGE_KEY) ?? 'null') as StoredSession | null;
    return session?.accessToken && session.expiresAt > Date.now() ? session : null;
  } catch {
    return null;
  }
}

function writeSession(session: StoredSession | null): void {
  try {
    if (session) {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    // Stockage indisponible (navigation privée...) : la session reste en mémoire.
  }
}
