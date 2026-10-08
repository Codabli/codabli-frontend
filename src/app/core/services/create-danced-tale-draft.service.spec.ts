import { TestBed } from '@angular/core/testing';
import {
  CREATE_DANCED_TALE_DRAFT_KEY,
  CreateDancedTaleDraftService,
} from './create-danced-tale-draft.service';
import { ProjectContext } from '../../models/interfaces/project-context.interface';
import { TaleUniverse } from '../../models/interfaces/tale-universe.interface';

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
  places: [{ id: 'p1', name: 'La forêt', description: '', image: null }],
  characters: [
    { id: 'c1', name: 'Arthur', description: 'Un roi', image: null, role: 'Héros', goal: 'Trouver l\'épée' },
  ],
  periods: [],
  objects: [],
};

describe('CreateDancedTaleDraftService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function createService(): CreateDancedTaleDraftService {
    TestBed.resetTestingModule();
    return TestBed.inject(CreateDancedTaleDraftService);
  }

  it('démarre sans contexte', () => {
    expect(createService().context()).toBeNull();
  });

  it('enregistre le contexte et le persiste', () => {
    const service = createService();

    service.saveContext(CONTEXT);

    expect(service.context()).toEqual(CONTEXT);
    expect(JSON.parse(localStorage.getItem(CREATE_DANCED_TALE_DRAFT_KEY)!)).toEqual({
      context: CONTEXT,
      universe: null,
      structure: null,
      writing: null,
    });
  });

  it('lit un brouillon enregistré avant l\'écran 5 (sans univers)', () => {
    localStorage.setItem(CREATE_DANCED_TALE_DRAFT_KEY, JSON.stringify({ context: CONTEXT }));

    const service = createService();

    expect(service.context()).toEqual(CONTEXT);
    expect(service.universe()).toBeNull();
  });

  it('enregistre l\'univers sans perdre le contexte', () => {
    createService().saveContext(CONTEXT);
    const service = createService();

    expect(service.saveUniverse(UNIVERSE)).toBe(true);

    const restored = createService();
    expect(restored.context()).toEqual(CONTEXT);
    expect(restored.universe()).toEqual(UNIVERSE);
  });

  it('enregistre la trame sans perdre le contexte ni l\'univers', () => {
    const service = createService();
    service.saveContext(CONTEXT);
    service.saveUniverse(UNIVERSE);
    const structure = {
      steps: [{ id: 's1', kind: 'initialSituation' as const, title: 'La situation initiale', summary: '', characterIds: ['c1'] }],
    };

    expect(service.saveStructure(structure)).toBe(true);

    const restored = createService();
    expect(restored.context()).toEqual(CONTEXT);
    expect(restored.universe()).toEqual(UNIVERSE);
    expect(restored.structure()).toEqual(structure);
  });

  it('signale un univers qui n\'a pas pu être écrit (stockage plein) et le garde en mémoire', () => {
    const service = createService();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });

    expect(service.saveUniverse(UNIVERSE)).toBe(false);
    expect(service.universe()).toEqual(UNIVERSE);

    vi.restoreAllMocks();
  });

  it('restaure le brouillon enregistré', () => {
    createService().saveContext(CONTEXT);

    expect(createService().context()).toEqual(CONTEXT);
  });

  it('ignore un brouillon illisible', () => {
    localStorage.setItem(CREATE_DANCED_TALE_DRAFT_KEY, '{pas du json');

    expect(createService().context()).toBeNull();
  });

  it('efface le brouillon', () => {
    const service = createService();
    service.saveContext(CONTEXT);

    service.clear();

    expect(service.context()).toBeNull();
    expect(localStorage.getItem(CREATE_DANCED_TALE_DRAFT_KEY)).toBeNull();
  });
});
