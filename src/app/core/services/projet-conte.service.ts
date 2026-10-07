import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../http/api.config';
import type { ProjetConte, ProjetConteRequest } from '../../models/interfaces/projet-conte.interface';

/** Projets de conte de l'enseignant connecté (parcours « Créer mon conte »). Authentification requise. */
@Injectable({ providedIn: 'root' })
export class ProjetConteService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/projets-contes`;

  lister(): Observable<ProjetConte[]> {
    return this.http.get<ProjetConte[]>(this.url);
  }

  getById(id: string): Observable<ProjetConte> {
    return this.http.get<ProjetConte>(`${this.url}/${id}`);
  }

  creer(request: ProjetConteRequest): Observable<ProjetConte> {
    return this.http.post<ProjetConte>(this.url, request);
  }

  modifierContexte(id: string, request: ProjetConteRequest): Observable<ProjetConte> {
    return this.http.put<ProjetConte>(`${this.url}/${id}`, request);
  }
}
