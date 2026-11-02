import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../http/api.config';
import type {
  EtapeParcours,
  ParcoursConte,
  ParcoursContexteRequest,
} from '../../models/interfaces/parcours-conte.interface';

/** Parcours « Créer mon conte dansé » d'un conte : contexte (écran 1) et contenu de chaque étape. */
@Injectable({ providedIn: 'root' })
export class ParcoursConteService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/contes-danses`;

  lire(conteId: string): Observable<ParcoursConte> {
    return this.http.get<ParcoursConte>(this.parcoursUrl(conteId));
  }

  enregistrerContexte(conteId: string, contexte: ParcoursContexteRequest): Observable<ParcoursConte> {
    return this.http.put<ParcoursConte>(`${this.parcoursUrl(conteId)}/contexte`, contexte);
  }

  /** Remplace le contenu d'une étape. */
  enregistrerEtape(conteId: string, etape: EtapeParcours, contenu: unknown): Observable<ParcoursConte> {
    return this.http.put<ParcoursConte>(`${this.parcoursUrl(conteId)}/${etape}`, contenu);
  }

  /** Conducteur du spectacle (PDF généré par le backend), avec le nom de fichier proposé. */
  telechargerConducteur(conteId: string): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.parcoursUrl(conteId)}/conducteur.pdf`, { observe: 'response', responseType: 'blob' });
  }

  private parcoursUrl(conteId: string): string {
    return `${this.url}/${conteId}/parcours`;
  }
}
