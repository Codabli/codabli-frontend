import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import type { ApiError, ApiErrorKind } from '../../models/interfaces/api-error.interface';

const KIND_BY_STATUS: Readonly<Record<number, ApiErrorKind>> = {
  400: 'bad-request',
  401: 'unauthorized',
  403: 'forbidden',
  404: 'not-found',
  409: 'conflict',
  501: 'not-implemented',
};

const DEFAULT_MESSAGE: Readonly<Record<ApiErrorKind, string>> = {
  timeout: 'Le serveur met trop de temps à répondre.',
  network: 'Impossible de joindre le serveur.',
  'bad-request': 'La requête est invalide.',
  unauthorized: 'Authentification requise.',
  forbidden: "Vous n'avez pas les droits nécessaires.",
  'not-found': 'Ressource introuvable.',
  conflict: 'Conflit avec l\'état actuel de la ressource.',
  'not-implemented': "Cette fonctionnalité n'est pas encore disponible.",
  server: 'Erreur interne du serveur.',
  unknown: 'Une erreur inattendue est survenue.',
};

/** Convertit n'importe quelle erreur de transport en `ApiError` exploitable par l'UI. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof TimeoutError) {
    return { kind: 'timeout', status: 0, message: DEFAULT_MESSAGE.timeout };
  }

  if (!(error instanceof HttpErrorResponse)) {
    return { kind: 'unknown', status: 0, message: DEFAULT_MESSAGE.unknown };
  }

  if (error.status === 0) {
    return { kind: 'network', status: 0, message: DEFAULT_MESSAGE.network };
  }

  const kind: ApiErrorKind = KIND_BY_STATUS[error.status] ?? (error.status >= 500 ? 'server' : 'unknown');
  const body = error.error as { message?: unknown; errors?: unknown } | null;
  const message = typeof body?.message === 'string' && body.message ? body.message : DEFAULT_MESSAGE[kind];
  const fieldErrors =
    body?.errors && typeof body.errors === 'object' ? (body.errors as Record<string, string>) : undefined;

  return { kind, status: error.status, message, ...(fieldErrors && { fieldErrors }) };
}
