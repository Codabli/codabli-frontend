import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { requireProjectContext } from './create-danced-tale.guards';
import { CreateDancedTaleDraftService } from '../../core/services/create-danced-tale-draft.service';

@Component({ template: '' })
class DummyComponent {}

describe('requireProjectContext', () => {
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
