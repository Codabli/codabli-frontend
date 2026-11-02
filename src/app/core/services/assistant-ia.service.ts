import { HttpClient, HttpContext, HttpEventType } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, distinctUntilChanged, filter, map } from 'rxjs';
import { API_BASE_URL, API_REQUEST_TIMEOUT_MS } from '../http/api.config';
import type { MessageIa } from '../../models/interfaces/assistant-ia.interface';

/** Le modèle peut mettre du temps à commencer sa réponse, ou entre deux morceaux. */
export const ASSISTANT_TIMEOUT_MS = 60_000;

/**
 * Assistant pédagogique d'un conte (écran 7, SCRUM-131). La conversation est gardée par le back :
 * on n'envoie que le nouveau message, le back y ajoute l'historique du conte.
 */
@Injectable({ providedIn: 'root' })
export class AssistantIaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/ia/contes-danses`;

  historique(conteId: string): Observable<MessageIa[]> {
    return this.http.get<MessageIa[]>(`${this.url}/${conteId}/assistant-history`);
  }

  /** Envoie un message ; émet la réponse au fur et à mesure qu'elle arrive (texte reçu jusque-là). */
  envoyer(conteId: string, contenu: string): Observable<string> {
    return this.http
      .post(
        `${this.url}/${conteId}/assistant-stream`,
        { contenu },
        {
          observe: 'events',
          reportProgress: true,
          responseType: 'text',
          context: new HttpContext().set(API_REQUEST_TIMEOUT_MS, ASSISTANT_TIMEOUT_MS),
        },
      )
      .pipe(
        filter((event) => event.type === HttpEventType.DownloadProgress || event.type === HttpEventType.Response),
        map((event) =>
          event.type === HttpEventType.Response
            ? readTokens(event.body ?? '', true)
            : readTokens(event.partialText ?? '', false),
        ),
        distinctUntilChanged(),
      );
  }
}

/**
 * Texte des événements `token` d'un flux SSE. Tant que le flux n'est pas terminé, le dernier
 * événement peut être incomplet : on ne lit que ceux suivis d'une ligne vide.
 *
 * Spring écrit `data:` sans espace après les deux-points : un espace en tête fait partie du texte.
 */
export function readTokens(stream: string, complete: boolean): string {
  const events = stream.replace(/\r\n?/g, '\n').split('\n\n');

  if (!complete) {
    events.pop();
  }

  return events
    .map((event) => event.split('\n'))
    .filter((lines) => lines.some((line) => line === 'event:token' || line === 'event: token'))
    .map((lines) =>
      lines
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice('data:'.length))
        .join('\n'),
    )
    .join('');
}
