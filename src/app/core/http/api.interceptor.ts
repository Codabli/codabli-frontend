import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, timeout } from 'rxjs';
import { API_BASE_URL, API_TIMEOUT_MS } from './api.config';
import { toApiError } from './api-error.mapper';

/** Applique timeout et normalisation des erreurs aux seuls appels vers le backend. */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(inject(API_BASE_URL))) {
    return next(req);
  }

  return next(req).pipe(
    timeout(inject(API_TIMEOUT_MS)),
    catchError((error: unknown) => throwError(() => toApiError(error))),
  );
};
