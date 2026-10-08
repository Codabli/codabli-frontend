import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../http/api.config';
import type { LoginRequest, LoginResponse } from '../../models/interfaces/auth.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/auth`;
  private readonly accessToken = signal<string | null>(null);
  readonly isLoggedIn = computed(() => this.accessToken() !== null);

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.url}/login`, credentials)
      .pipe(tap((response) => this.accessToken.set(response.accessToken)));
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }

  logout(): void {
    this.accessToken.set(null);
  }
}
