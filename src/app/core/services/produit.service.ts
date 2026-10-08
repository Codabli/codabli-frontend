import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../http/api.config';
import { buildParams } from '../http/build-params';
import type { Produit, ProduitFiltres } from '../../models/interfaces/produit.interface';
import type { Page } from '../../models/interfaces/page.interface';

@Injectable({ providedIn: 'root' })
export class ProduitService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/produits`;

  /** Catalogue produits, filtrable par type. */
  lister(filtres: ProduitFiltres = {}): Observable<Page<Produit>> {
    return this.http.get<Page<Produit>>(this.url, { params: buildParams(filtres) });
  }

  getById(id: string): Observable<Produit> {
    return this.http.get<Produit>(`${this.url}/${id}`);
  }
}
