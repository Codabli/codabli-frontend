import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../http/api.config';
import type { SalleGalerie } from '../../models/interfaces/salle-galerie.interface';

@Injectable({ providedIn: 'root' })
export class GalerieArtsService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/galerie-arts/salles`;

  /** Salles du musée virtuel (une par pays), avec leur fresque et leurs hotspots. */
  listerSalles(): Observable<SalleGalerie[]> {
    return this.http.get<SalleGalerie[]>(this.url);
  }

  getSalle(id: string): Observable<SalleGalerie> {
    return this.http.get<SalleGalerie>(`${this.url}/${id}`);
  }
}
