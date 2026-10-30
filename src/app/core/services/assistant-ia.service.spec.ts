import { HttpEventType, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { apiInterceptor } from '../http/api.interceptor';
import { AssistantIaService, readTokens } from './assistant-ia.service';

const URL = '/api/ia/contes-danses/t1';

describe('AssistantIaService', () => {
  let service: AssistantIaService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([apiInterceptor])), provideHttpClientTesting()],
    });
    service = TestBed.inject(AssistantIaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lit l\'historique de la conversation du conte', () => {
    let roles: string[] = [];

    service.historique('t1').subscribe((messages) => (roles = messages.map((message) => message.role)));
    http.expectOne(`${URL}/assistant-history`).flush([
      { id: 'm1', conteDanseId: 't1', role: 'user', contenu: 'Bonjour', dateCreation: '2026-10-30T10:00:00Z' },
      { id: 'm2', conteDanseId: 't1', role: 'assistant', contenu: 'Bonjour !', dateCreation: '2026-10-30T10:00:01Z' },
    ]);

    expect(roles).toEqual(['user', 'assistant']);
  });

  it('envoie le seul nouveau message et émet la réponse au fil du flux', () => {
    const received: string[] = [];
    let done = false;

    service.envoyer('t1', 'Des mots pour la nuit ?').subscribe({
      next: (text) => received.push(text),
      complete: () => (done = true),
    });
    const request = http.expectOne({ method: 'POST', url: `${URL}/assistant-stream` });
    expect(request.request.body).toEqual({ contenu: 'Des mots pour la nuit ?' });

    request.event({ type: HttpEventType.DownloadProgress, loaded: 1, partialText: 'event:token\ndata:Sombre\n\nevent:tok' });
    request.event({
      type: HttpEventType.DownloadProgress,
      loaded: 2,
      partialText: 'event:token\ndata:Sombre\n\nevent:token\ndata:, calme\n\n',
    });
    request.flush('event:token\ndata:Sombre\n\nevent:token\ndata:, calme\n\nevent:token\ndata: et étoilée');

    expect(received).toEqual(['Sombre', 'Sombre, calme', 'Sombre, calme et étoilée']);
    expect(done).toBe(true);
  });

  it('remonte l\'erreur du back lisible malgré la réponse attendue en texte', () => {
    let message: string | undefined;

    service.envoyer('t1', 'Question').subscribe({ error: (error) => (message = error.message) });
    http
      .expectOne(`${URL}/assistant-stream`)
      .flush(JSON.stringify({ message: 'Conte deja publie' }), { status: 400, statusText: 'Bad Request' });

    expect(message).toBe('Conte deja publie');
  });
});

describe('readTokens', () => {
  it('ignore le dernier événement tant que le flux n\'est pas terminé', () => {
    expect(readTokens('event:token\ndata:Il\n\nevent:token\ndata: é', false)).toBe('Il');
    expect(readTokens('event:token\ndata:Il\n\nevent:token\ndata: était', true)).toBe('Il était');
  });

  it('garde les espaces et les retours à la ligne d\'un morceau', () => {
    expect(readTokens('event:token\ndata: une\ndata:ligne\n\n', false)).toBe(' une\nligne');
  });

  it('ne lit que les événements token', () => {
    expect(readTokens('event:info\ndata:x\n\nevent:token\r\ndata:ok\r\n\r\n', false)).toBe('ok');
  });
});
