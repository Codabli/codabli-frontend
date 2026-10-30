import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, timeout } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { API_BASE_URL, API_REQUEST_TIMEOUT_MS, API_TIMEOUT_MS } from './api.config';
import { toApiError } from './api-error.mapper';

/**
 * Sur les seuls appels vers le backend : ajoute le token de l'utilisateur connecté,
 * applique le timeout et normalise les erreurs. Un 401 (token refusé) ferme la session.
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(inject(API_BASE_URL))) {
    return next(req);
  }

  const authService = inject(AuthService);
  const token = authService.getAccessToken();
  const authorizedReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authorizedReq).pipe(
    timeout(req.context.get(API_REQUEST_TIMEOUT_MS) ?? inject(API_TIMEOUT_MS)),
    catchError((error: unknown) => {
      const apiError = toApiError(error);
      if (apiError.kind === 'unauthorized') {
        authService.logout();
      }
      return throwError(() => apiError);
    }),
  );
};
