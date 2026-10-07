import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../http/api.config';
import { buildParams } from '../http/build-params';
import type { Actualite } from '../../models/interfaces/actualite.interface';
import type { Page } from '../../models/interfaces/page.interface';
import type { PaginationParams } from '../../models/interfaces/pagination.interface';

@Injectable({ providedIn: 'root' })
export class ActualiteService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/actualites`;

  /** Actualités publiées, paginées. */
  lister(filtres: PaginationParams = {}): Observable<Page<Actualite>> {
    return this.http.get<Page<Actualite>>(this.url, { params: buildParams(filtres) });
  }

  getById(id: string): Observable<Actualite> {
    return this.http.get<Actualite>(`${this.url}/${id}`);
  }
}
