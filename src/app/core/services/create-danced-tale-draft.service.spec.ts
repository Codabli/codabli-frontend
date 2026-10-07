import { TestBed } from '@angular/core/testing';
import {
  CREATE_DANCED_TALE_DRAFT_KEY,
  CreateDancedTaleDraftService,
} from './create-danced-tale-draft.service';
import { ProjectContext } from '../../models/interfaces/project-context.interface';

const CONTEXT: ProjectContext = {
  ageRange: '6-8',
  country: 'France',
  region: 'Bretagne',
  city: '',
  theme: 'Fantastique',
  secretIngredients: ['dragons'],
  performanceSpace: 'salle_spectacle',
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
    expect(JSON.parse(localStorage.getItem(CREATE_DANCED_TALE_DRAFT_KEY)!)).toEqual({ context: CONTEXT });
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
