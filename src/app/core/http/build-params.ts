import { HttpParams } from '@angular/common/http';

/** Construit des `HttpParams` en ignorant les valeurs absentes ou vides. */
export function buildParams(valeurs: object): HttpParams {
  let params = new HttpParams();
  for (const [cle, valeur] of Object.entries(valeurs)) {
    if (valeur !== undefined && valeur !== null && valeur !== '') {
      params = params.set(cle, String(valeur));
    }
  }
  return params;
}
