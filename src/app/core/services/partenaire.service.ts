import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../http/api.config';
import { buildParams } from '../http/build-params';
import type { Partenaire, PartenaireFiltres } from '../../models/interfaces/partenaire.interface';
import type { Page } from '../../models/interfaces/page.interface';

@Injectable({ providedIn: 'root' })
export class PartenaireService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/partenaires`;

  /** Partenaires actifs, filtrables par catégorie. */
  lister(filtres: PartenaireFiltres = {}): Observable<Page<Partenaire>> {
    return this.http.get<Page<Partenaire>>(this.url, { params: buildParams(filtres) });
  }

  getById(id: string): Observable<Partenaire> {
    return this.http.get<Partenaire>(`${this.url}/${id}`);
  }
}
