import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Observable,
  expand,
  map,
  reduce,
  EMPTY,
  switchMap,
  forkJoin,
  of,
} from 'rxjs';
import { API_BASE_URL } from '../http/api.config';
import { buildParams } from '../http/build-params';
import type {
  ConteDanse,
  ConteDanseFiltres,
} from '../../models/interfaces/conte-danse.interface';
import type { Page } from '../../models/interfaces/page.interface';
import type { ConteDanseTraduction } from '@models/interfaces/conte-danse-traduction.model';
import type { FilterSelectOption } from '@models/interfaces/filter-select-option.interface';

@Injectable({ providedIn: 'root' })
export class ConteDanseService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/contes-danses`;

  /** Catalogue public des contes publiés (filtres et pagination optionnels). */
  lister(filtres: ConteDanseFiltres = {}): Observable<Page<ConteDanse>> {
    return this.http.get<Page<ConteDanse>>(this.url, {
      params: buildParams(filtres),
    });
  }

  getById(id: string): Observable<ConteDanse> {
    return this.http.get<ConteDanse>(`${this.url}/${id}`);
  }

  listerTraductionsPubliees(
    conteId: string,
  ): Observable<ConteDanseTraduction[]> {
    return this.http.get<ConteDanseTraduction[]>(
      `${this.url}/${conteId}/traductions`,
    );
  }

  listerTous(): Observable<ConteDanse[]> {
    return this.lister({ page: 0, size: 100 }).pipe(
      expand((response) =>
        response.last
          ? EMPTY
          : this.lister({
              page: response.number + 1,
              size: 100,
            }),
      ),
      map((response) => response.content),
      reduce((contes, page) => [...contes, ...page], [] as ConteDanse[]),
    );
  }
}
