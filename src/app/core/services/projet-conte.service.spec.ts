import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { apiInterceptor } from '../http/api.interceptor';
import type { ApiError } from '../../models/interfaces/api-error.interface';
import type { ProjetConteRequest } from '../../models/interfaces/projet-conte.interface';
import { ProjetConteService } from './projet-conte.service';

const REQUEST: ProjetConteRequest = {
  trancheAge: '9-11',
  pays: 'France',
  region: 'Bretagne',
  ville: null,
  theme: 'Nature',
  ingredientsSecrets: ['la mer'],
  espaceRepresentation: 'exterieur',
};

describe('ProjetConteService', () => {
  let service: ProjetConteService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([apiInterceptor])), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProjetConteService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('GET /api/projets-contes', () => {
    service.lister().subscribe();
    expect(http.expectOne('/api/projets-contes').request.method).toBe('GET');
  });

  it('GET /api/projets-contes/{id}', () => {
    service.getById('abc').subscribe();
    expect(http.expectOne('/api/projets-contes/abc').request.method).toBe('GET');
  });

  it('POST /api/projets-contes avec le contexte', () => {
    service.creer(REQUEST).subscribe();

    const req = http.expectOne('/api/projets-contes');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(REQUEST);
  });

  it('PUT /api/projets-contes/{id} avec le contexte', () => {
    service.modifierContexte('abc', REQUEST).subscribe();

    const req = http.expectOne('/api/projets-contes/abc');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(REQUEST);
  });

  it('remonte les erreurs de validation par champ', () => {
    let error: ApiError | undefined;
    service.creer(REQUEST).subscribe({ error: (e: ApiError) => (error = e) });

    http
      .expectOne('/api/projets-contes')
      .flush({ errors: { region: 'La region est obligatoire' } }, { status: 400, statusText: 'Bad Request' });

    expect(error?.kind).toBe('bad-request');
    expect(error?.fieldErrors).toEqual({ region: 'La region est obligatoire' });
  });
});
