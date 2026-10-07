import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiInterceptor } from '../http/api.interceptor';
import { API_TIMEOUT_MS } from '../http/api.config';
import type { ApiError } from '../../models/interfaces/api-error.interface';
import type { Page } from '../../models/interfaces/page.interface';
import type { ConteDanse } from '../../models/interfaces/conte-danse.interface';
import { ConteDanseService } from './conte-danse.service';

describe('ConteDanseService', () => {
  let service: ConteDanseService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
        { provide: API_TIMEOUT_MS, useValue: 1000 },
      ],
    });
    service = TestBed.inject(ConteDanseService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    vi.useRealTimers();
  });

  it('GET /api/contes-danses avec filtres et pagination', () => {
    const page = { content: [], totalElements: 0 } as unknown as Page<ConteDanse>;
    let result: Page<ConteDanse> | undefined;

    service.lister({ langue: 'fr', age: 8, page: 0, size: 5, pays: undefined }).subscribe((p) => (result = p));

    const req = http.expectOne((r) => r.url === '/api/contes-danses');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('langue')).toBe('fr');
    expect(req.request.params.get('age')).toBe('8');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.has('pays')).toBe(false);
    req.flush(page);

    expect(result).toBe(page);
  });

  it('GET /api/contes-danses/{id}', () => {
    service.getById('abc').subscribe();
    http.expectOne('/api/contes-danses/abc').flush({ id: 'abc' });
  });

  it('mappe un 501 en erreur not-implemented', () => {
    let error: ApiError | undefined;
    service.getById('abc').subscribe({ error: (e: ApiError) => (error = e) });

    http.expectOne('/api/contes-danses/abc').flush(null, { status: 501, statusText: 'Not Implemented' });

    expect(error).toMatchObject({ kind: 'not-implemented', status: 501 });
  });

  it('reprend le message du backend pour un 404', () => {
    let error: ApiError | undefined;
    service.getById('abc').subscribe({ error: (e: ApiError) => (error = e) });

    http
      .expectOne('/api/contes-danses/abc')
      .flush({ status: 404, message: 'Conte introuvable' }, { status: 404, statusText: 'Not Found' });

    expect(error).toMatchObject({ kind: 'not-found', status: 404, message: 'Conte introuvable' });
  });

  it('mappe une erreur réseau (status 0)', () => {
    let error: ApiError | undefined;
    service.getById('abc').subscribe({ error: (e: ApiError) => (error = e) });

    http.expectOne('/api/contes-danses/abc').error(new ProgressEvent('error'));

    expect(error).toMatchObject({ kind: 'network', status: 0 });
  });

  it('lève une erreur timeout si le backend ne répond pas à temps', () => {
    vi.useFakeTimers();
    let error: ApiError | undefined;
    service.getById('abc').subscribe({ error: (e: ApiError) => (error = e) });
    http.expectOne('/api/contes-danses/abc');

    vi.advanceTimersByTime(1001);

    expect(error).toMatchObject({ kind: 'timeout', status: 0 });
  });
});
