import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { requireProjectContext, requireTaleStructure } from './create-danced-tale.guards';
import { CreateDancedTaleDraftService } from '../../core/services/create-danced-tale-draft.service';

@Component({ template: '' })
class DummyComponent {}

function saveContext(): void {
  TestBed.inject(CreateDancedTaleDraftService).saveContext({
    ageRange: '6-8',
    country: 'France',
    region: 'Bretagne',
    city: '',
    theme: 'Fantastique',
    secretIngredients: [],
    performanceSpace: null,
  });
}

describe('gardes du parcours', () => {
  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'create-danced-tale',
            children: [
              { path: 'context', component: DummyComponent },
              { path: 'universe', component: DummyComponent, canActivate: [requireProjectContext] },
              { path: 'structure', component: DummyComponent },
              { path: 'writing', component: DummyComponent, canActivate: [requireTaleStructure] },
            ],
          },
        ]),
      ],
    });
  });

  it('renvoie vers le contexte du projet s\'il n\'est pas renseigné', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/create-danced-tale/universe');

    expect(TestBed.inject(Router).url).toBe('/create-danced-tale/context');
  });

  it('renvoie vers la trame si l\'écriture est ouverte sans trame', async () => {
    saveContext();
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/create-danced-tale/writing');

    expect(TestBed.inject(Router).url).toBe('/create-danced-tale/structure');
  });

  it('ouvre l\'écriture quand une trame est enregistrée', async () => {
    saveContext();
    TestBed.inject(CreateDancedTaleDraftService).saveStructure({
      steps: [{ id: 's1', kind: null, title: 'Étape', summary: '', characterIds: [] }],
    });
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/create-danced-tale/writing');

    expect(TestBed.inject(Router).url).toBe('/create-danced-tale/writing');
  });

  it('laisse passer quand le contexte est enregistré', async () => {
    TestBed.inject(CreateDancedTaleDraftService).saveContext({
      ageRange: '6-8',
      country: 'France',
      region: 'Bretagne',
      city: '',
      theme: 'Fantastique',
      secretIngredients: [],
      performanceSpace: null,
    });
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/create-danced-tale/universe');

    expect(TestBed.inject(Router).url).toBe('/create-danced-tale/universe');
  });
});
