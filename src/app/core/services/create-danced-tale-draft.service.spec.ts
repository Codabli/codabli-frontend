import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { apiInterceptor } from '../http/api.interceptor';
import {
  CREATE_DANCED_TALE_DRAFT_KEY,
  CreateDancedTaleDraftService,
} from './create-danced-tale-draft.service';
import { ProjectContext } from '../../models/interfaces/project-context.interface';
import type { ProjetConte } from '../../models/interfaces/projet-conte.interface';

const CONTEXT: ProjectContext = {
  ageRange: '6-8',
  country: 'France',
  region: 'Bretagne',
  city: '',
  theme: 'Fantastique',
  secretIngredients: ['dragons'],
  performanceSpace: 'salle_spectacle',
};

const PROJET: ProjetConte = {
  id: 'projet-1',
  enseignantId: 'enseignant-1',
  trancheAge: '6-8',
  pays: 'France',
  region: 'Bretagne',
  ville: null,
  theme: 'Fantastique',
  ingredientsSecrets: ['dragons'],
  espaceRepresentation: 'salle_spectacle',
  dateCreation: '2026-10-07T10:00:00Z',
  dateModification: '2026-10-07T10:00:00Z',
};

describe('CreateDancedTaleDraftService', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => http?.verify());

  function createService(): CreateDancedTaleDraftService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([apiInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    return TestBed.inject(CreateDancedTaleDraftService);
  }

  it('démarre sans projet', () => {
    const service = createService();

    expect(service.projectId()).toBeNull();
    expect(service.context()).toBeNull();
  });

  it('crée le projet au premier enregistrement puis le met en cache', () => {
    const service = createService();
    let done = false;

    service.saveContext(CONTEXT).subscribe(() => (done = true));

    const req = http.expectOne('/api/projets-contes');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      trancheAge: '6-8',
      pays: 'France',
      region: 'Bretagne',
      ville: null,
      theme: 'Fantastique',
      ingredientsSecrets: ['dragons'],
      espaceRepresentation: 'salle_spectacle',
    });
    req.flush(PROJET);

    expect(done).toBe(true);
    expect(service.projectId()).toBe('projet-1');
    expect(service.context()).toEqual(CONTEXT);
    expect(JSON.parse(localStorage.getItem(CREATE_DANCED_TALE_DRAFT_KEY)!).projectId).toBe('projet-1');
  });

  it('met à jour le projet déjà créé au lieu d\'en créer un autre', () => {
    const service = createService();
    service.saveContext(CONTEXT).subscribe();
    http.expectOne('/api/projets-contes').flush(PROJET);

    service.saveContext({ ...CONTEXT, theme: 'Les émotions' }).subscribe();

    const req = http.expectOne('/api/projets-contes/projet-1');
    expect(req.request.method).toBe('PUT');
    req.flush({ ...PROJET, theme: 'Les émotions' });

    expect(service.context()?.theme).toBe('Les émotions');
  });

  it('ne modifie pas le cache si l\'enregistrement échoue', () => {
    const service = createService();
    let failed = false;

    service.saveContext(CONTEXT).subscribe({ error: () => (failed = true) });
    http.expectOne('/api/projets-contes').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(failed).toBe(true);
    expect(service.projectId()).toBeNull();
    expect(localStorage.getItem(CREATE_DANCED_TALE_DRAFT_KEY)).toBeNull();
  });

  it('restaure le projet en cours depuis le cache', () => {
    localStorage.setItem(CREATE_DANCED_TALE_DRAFT_KEY, JSON.stringify({ projectId: 'projet-1', context: CONTEXT }));

    const service = createService();

    expect(service.projectId()).toBe('projet-1');
    expect(service.context()).toEqual(CONTEXT);
  });

  it('ignore un cache illisible', () => {
    localStorage.setItem(CREATE_DANCED_TALE_DRAFT_KEY, '{pas du json');

    expect(createService().context()).toBeNull();
  });

  it('efface le projet en cours', () => {
    localStorage.setItem(CREATE_DANCED_TALE_DRAFT_KEY, JSON.stringify({ projectId: 'projet-1', context: CONTEXT }));
    const service = createService();

    service.clear();

    expect(service.projectId()).toBeNull();
    expect(localStorage.getItem(CREATE_DANCED_TALE_DRAFT_KEY)).toBeNull();
  });
});
