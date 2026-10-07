import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../http/api.config';
import { buildParams } from '../http/build-params';
import type { PaginationParams } from '../../models/interfaces/pagination.interface';
import type { ResultatsRecherche } from '../../models/interfaces/recherche.interface';

@Injectable({ providedIn: 'root' })
export class RechercheService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/recherche`;

  /** Recherche transversale (actualités, contes, cartes, produits, partenaires). */
  rechercher(q: string, pagination: PaginationParams = {}): Observable<ResultatsRecherche> {
    return this.http.get<ResultatsRecherche>(this.url, { params: buildParams({ q, ...pagination }) });
  }
}
