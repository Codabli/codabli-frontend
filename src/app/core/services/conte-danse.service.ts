import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../http/api.config';
import { buildParams } from '../http/build-params';
import type { ConteDanse, ConteDanseFiltres } from '../../models/interfaces/conte-danse.interface';
import type { Page } from '../../models/interfaces/page.interface';

@Injectable({ providedIn: 'root' })
export class ConteDanseService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/contes-danses`;

  /** Catalogue public des contes publiés (filtres et pagination optionnels). */
  lister(filtres: ConteDanseFiltres = {}): Observable<Page<ConteDanse>> {
    return this.http.get<Page<ConteDanse>>(this.url, { params: buildParams(filtres) });
  }

  getById(id: string): Observable<ConteDanse> {
    return this.http.get<ConteDanse>(`${this.url}/${id}`);
  }
}
