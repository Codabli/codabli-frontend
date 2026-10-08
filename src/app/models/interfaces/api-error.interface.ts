export type ApiErrorKind =
  | 'timeout'
  | 'network'
  | 'bad-request'
  | 'unauthorized'
  | 'forbidden'
  | 'not-found'
  | 'conflict'
  | 'not-implemented'
  | 'server'
  | 'unknown';

export interface ApiError {
  kind: ApiErrorKind;
  /** Code HTTP, 0 si la requête n'a pas atteint le backend (timeout, réseau). */
  status: number;
  message: string;
  /** Erreurs de validation par champ (400 du backend). */
  fieldErrors?: Record<string, string>;
}
