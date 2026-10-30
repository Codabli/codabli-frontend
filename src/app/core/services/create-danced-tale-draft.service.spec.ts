import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { apiInterceptor } from '../http/api.interceptor';
import { CreateDancedTaleDraftService } from './create-danced-tale-draft.service';
import { ConteDanse } from '@models/interfaces/conte-danse.interface';
import { ParcoursConte } from '@models/interfaces/parcours-conte.interface';
import { ProjectContext } from '@models/interfaces/project-context.interface';
import { TaleUniverse } from '@models/interfaces/tale-universe.interface';

const TALE_ID = 'c0ffee00-0000-4000-8000-000000000001';
const TALE_URL = `/api/contes-danses/${TALE_ID}`;
const PARCOURS_URL = `${TALE_URL}/parcours`;

const CONTEXT: ProjectContext = {
  ageRange: '6-8',
  country: 'France',
  region: 'Bretagne',
  city: '',
  theme: 'Fantastique',
  secretIngredients: ['dragons'],
  performanceSpace: 'salle_spectacle',
};

const UNIVERSE: TaleUniverse = {
  places: [{ id: 'p1', name: 'La forêt', description: '', imageId: null }],
  characters: [
    { id: 'c1', name: 'Arthur', description: 'Un roi', imageId: null, role: 'Héros', goal: 'Trouver l\'épée' },
  ],
  periods: [],
  objects: [],
};

const CONTE = {
  id: TALE_ID,
  titre: null,
  description: null,
  thematique: 'Fantastique',
  langueOriginale: 'fr',
  couvertureUrl: null,
  pays: 'France',
  culture: null,
  ageMin: 6,
  ageMax: 8,
  dureeMinutes: null,
  credits: null,
  statut: 'brouillon',
  fichierTexteUrl: null,
  fichierAudioUrl: null,
  fichierVideoUrl: null,
  ecoleId: null,
  classeId: null,
} as unknown as ConteDanse;

const EMPTY_PARCOURS: ParcoursConte = {
  conteDanseId: TALE_ID,
  region: null,
  ville: null,
  espaceRepresentation: null,
  ingredientsSecrets: [],
  decouverte: null,
  ressources: null,
  ressourcesClasse: null,
  univers: null,
  trame: null,
  ecriture: null,
  miseEnScene: null,
  dateModification: null,
};

describe('CreateDancedTaleDraftService', () => {
  let service: CreateDancedTaleDraftService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([apiInterceptor])), provideHttpClientTesting()],
    });
    service = TestBed.inject(CreateDancedTaleDraftService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  /** Laisse partir les envois en attente (enchaînés par promesses). */
  async function settle(): Promise<void> {
    for (let i = 0; i < 5; i++) {
      await Promise.resolve();
    }
  }

  async function load(parcours: Partial<ParcoursConte> = {}, conte: Partial<ConteDanse> = {}): Promise<void> {
    const loading = service.load(TALE_ID);
    http.expectOne(TALE_URL).flush({ ...CONTE, ...conte });
    http.expectOne(PARCOURS_URL).flush({ ...EMPTY_PARCOURS, ...parcours });
    await loading;
  }

  it('démarre sans conte ni contexte', () => {
    expect(service.taleId()).toBeNull();
    expect(service.context()).toBeNull();
  });

  it('nouveau conte : garde la saisie sans rien envoyer avant sa création', async () => {
    expect(await service.saveUniverse(UNIVERSE)).toBe(true);

    expect(service.universe()).toEqual(UNIVERSE);
    http.expectNone(() => true);
  });

  it('crée le conte en brouillon puis enregistre le contexte du parcours', async () => {
    const creating = service.createTale(CONTEXT);

    const post = http.expectOne({ method: 'POST', url: '/api/contes-danses' });
    expect(post.request.body).toMatchObject({ titre: null, pays: 'France', thematique: 'Fantastique', ageMin: 6, ageMax: 8 });
    post.flush(CONTE);
    await settle();

    const contexte = http.expectOne({ method: 'PUT', url: `${PARCOURS_URL}/contexte` });
    expect(contexte.request.body).toEqual({
      region: 'Bretagne',
      ville: null,
      espaceRepresentation: 'salle_spectacle',
      ingredientsSecrets: ['dragons'],
    });
    contexte.flush(EMPTY_PARCOURS);

    expect(await creating).toBe(TALE_ID);
    expect(service.taleId()).toBe(TALE_ID);
    expect(service.context()).toEqual(CONTEXT);
  });

  it('rejette la création si le conte n\'a pas pu être créé', async () => {
    const creating = service.createTale(CONTEXT);

    http.expectOne('/api/contes-danses').flush(null, { status: 500, statusText: 'Erreur' });

    await expect(creating).rejects.toMatchObject({ kind: 'server' });
    expect(service.taleId()).toBeNull();
  });

  it('ouvre un conte : contexte (conte + parcours) et étapes enregistrées', async () => {
    const structure = { steps: [{ id: 's1', kind: 'initialSituation', title: 'Début', summary: '', characterIds: [] }] };

    await load(
      {
        region: 'Bretagne',
        espaceRepresentation: 'salle_spectacle',
        ingredientsSecrets: ['dragons'],
        univers: UNIVERSE,
        trame: structure,
        ecriture: { texts: { s1: '<p>Il était une fois</p>' } },
      },
      { titre: 'Le roi des oiseaux' },
    );

    expect(service.taleId()).toBe(TALE_ID);
    expect(service.context()).toEqual(CONTEXT);
    expect(service.universe()).toEqual(UNIVERSE);
    expect(service.structure()).toEqual(structure);
    expect(service.writing()).toEqual({ title: 'Le roi des oiseaux', texts: { s1: '<p>Il était une fois</p>' } });
    expect(service.discovery()).toBeNull();
  });

  it('ouvre un conte sans contexte enregistré', async () => {
    await load();

    expect(service.context()).toBeNull();
    expect(service.writing()).toBeNull();
  });

  it('signale un conte qui ne peut pas être ouvert', async () => {
    const loading = service.load(TALE_ID);
    const parcours = http.expectOne(PARCOURS_URL);
    http.expectOne(TALE_URL).flush(null, { status: 404, statusText: 'Introuvable' });

    expect(parcours.cancelled).toBe(true);

    await expect(loading).rejects.toMatchObject({ kind: 'not-found' });
    expect(service.loadError()).toMatchObject({ kind: 'not-found' });
    expect(service.taleId()).toBeNull();
  });

  it('enregistre une étape dans le parcours du conte', async () => {
    await load();

    const saving = service.saveUniverse(UNIVERSE);

    expect(service.universe()).toEqual(UNIVERSE);
    await settle();
    const put = http.expectOne({ method: 'PUT', url: `${PARCOURS_URL}/univers` });
    expect(put.request.body).toEqual(UNIVERSE);
    put.flush(EMPTY_PARCOURS);
    expect(await saving).toBe(true);
  });

  it('envoie chaque étape sous son chemin backend', async () => {
    await load();

    service.saveDiscovery({ added: [], done: [], favorites: [] });
    service.saveResources({ added: ['chambord'] });
    service.saveClassResources({ items: [] });
    service.saveStructure({ steps: [] });
    service.saveStaging({ scenes: {} });
    await settle();

    for (const etape of ['decouverte', 'ressources', 'ressources-classe', 'trame', 'mise-en-scene']) {
      http.expectOne(`${PARCOURS_URL}/${etape}`).flush(EMPTY_PARCOURS);
    }
  });

  it('n\'envoie que le dernier contenu d\'une étape modifiée pendant un envoi', async () => {
    await load();
    const first = { added: ['a'] };
    const last = { added: ['a', 'b', 'c'] };

    service.saveResources(first);
    await settle();
    const pending = http.expectOne(`${PARCOURS_URL}/ressources`);
    service.saveResources({ added: ['a', 'b'] });
    const saving = service.saveResources(last);

    // Rien ne part tant que le premier envoi n'est pas terminé.
    http.expectNone(`${PARCOURS_URL}/ressources`);
    pending.flush(EMPTY_PARCOURS);
    await settle();

    const put = http.expectOne(`${PARCOURS_URL}/ressources`);
    expect(put.request.body).toEqual(last);
    put.flush(EMPTY_PARCOURS);
    expect(await saving).toBe(true);
  });

  it('ne renvoie pas un contenu déjà enregistré', async () => {
    await load();

    service.saveResources({ added: ['a'] });
    await settle();
    http.expectOne(`${PARCOURS_URL}/ressources`).flush(EMPTY_PARCOURS);
    await settle();

    expect(await service.saveResources({ added: ['a'] })).toBe(true);
    http.expectNone(`${PARCOURS_URL}/ressources`);
  });

  it('enregistre le titre de l\'écriture comme titre du conte, avec tous ses champs', async () => {
    await load();

    service.saveWriting({ title: 'Le roi des oiseaux', texts: { s1: '<p>Texte</p>' } });
    await settle();

    const conte = http.expectOne({ method: 'PUT', url: TALE_URL });
    expect(conte.request.body).toMatchObject({ titre: 'Le roi des oiseaux', pays: 'France', langueOriginale: 'fr' });
    conte.flush({ ...CONTE, titre: 'Le roi des oiseaux' });
    const ecriture = http.expectOne(`${PARCOURS_URL}/ecriture`);
    expect(ecriture.request.body).toEqual({ texts: { s1: '<p>Texte</p>' } });
    ecriture.flush(EMPTY_PARCOURS);
  });

  it('modifie le conte quand le contexte change de pays, de thème ou d\'âge', async () => {
    await load({ region: 'Bretagne' });

    service.saveContext({ ...CONTEXT, ageRange: '9-11' });
    await settle();

    expect(http.expectOne({ method: 'PUT', url: TALE_URL }).request.body).toMatchObject({ ageMin: 9, ageMax: 11 });
    http.expectOne(`${PARCOURS_URL}/contexte`).flush(EMPTY_PARCOURS);
  });

  it('signale un enregistrement en échec, garde la saisie et le relance', async () => {
    await load();

    const saving = service.saveUniverse(UNIVERSE);
    await settle();
    http.expectOne(`${PARCOURS_URL}/univers`).flush(null, { status: 0, statusText: 'Hors ligne' });

    expect(await saving).toBe(false);
    expect(service.universe()).toEqual(UNIVERSE);
    expect(service.saveError()).toMatchObject({ kind: 'network' });

    const retrying = service.retryFailedSaves();
    await settle();
    http.expectOne(`${PARCOURS_URL}/univers`).flush(EMPTY_PARCOURS);

    expect(await retrying).toBe(true);
    expect(service.saveError()).toBeNull();
  });

  it('repart d\'un conte vide', async () => {
    await load({ region: 'Bretagne' });

    service.reset();

    expect(service.taleId()).toBeNull();
    expect(service.context()).toBeNull();
  });
});
