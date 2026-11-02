import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { CreateDancedTaleComponent } from './create-danced-tale.component';
import { CREATE_DANCED_TALE_STEPS } from './create-danced-tale.steps';
import { requireProjectContext, requireTaleStructure } from './create-danced-tale.guards';
import { CreateDancedTaleDraftService } from '@core/services/create-danced-tale-draft.service';

@Component({ template: '' })
class DummyComponent {}

const CONTEXT = {
  ageRange: '6-8' as const,
  country: 'France',
  region: 'Bretagne',
  city: '',
  theme: 'Fantastique',
  secretIngredients: [],
  performanceSpace: null,
};

describe('CreateDancedTaleComponent : frise des étapes', () => {
  let harness: RouterTestingHarness;

  async function setup(url: string, draft: { context?: boolean; structure?: boolean } = {}): Promise<void> {
    TestBed.configureTestingModule({
      providers: [
        provideTranslateService(),
        provideRouter([
          {
            path: 'create-danced-tale',
            component: CreateDancedTaleComponent,
            children: [
              {
                path: ':taleId',
                children: CREATE_DANCED_TALE_STEPS.map((step) => ({
                  path: step.path,
                  component: DummyComponent,
                  canActivate:
                    step.requires === 'structure'
                      ? [requireTaleStructure]
                      : step.requires === 'context'
                        ? [requireProjectContext]
                        : [],
                })),
              },
            ],
          },
        ]),
      ],
    });

    const draftService = TestBed.inject(CreateDancedTaleDraftService);
    if (draft.context) {
      draftService.saveContext(CONTEXT);
    }
    if (draft.structure) {
      draftService.saveStructure({
        steps: [{ id: 's1', kind: 'initialSituation', title: 'Départ', summary: '', characterIds: [] }],
      });
    }
    // Conte ouvert (après l'état ci-dessus, enregistré sans backend).
    vi.spyOn(draftService, 'taleId').mockReturnValue('t1');

    harness = await RouterTestingHarness.create(url);
  }

  function items(): HTMLElement[] {
    return Array.from(harness.routeNativeElement!.ownerDocument.querySelectorAll<HTMLElement>('.stepper__item'));
  }

  /** Chemin des liens de la frise, null pour une étape qui n'est pas un lien. */
  function links(): (string | null)[] {
    return items().map((item) => item.querySelector('a')?.getAttribute('href') ?? null);
  }

  it('sans contexte, seule l\'étape en cours est affichée, sans lien', async () => {
    await setup('/create-danced-tale/t1/context');

    expect(links()).toEqual([null, null, null, null, null, null, null, null]);
    expect(items()[0].querySelector('[aria-current="step"]')).not.toBeNull();
  });

  it('avec un contexte, les écrans 1 à 6 sont accessibles depuis la frise', async () => {
    await setup('/create-danced-tale/t1/universe', { context: true });

    expect(links()).toEqual([
      '/create-danced-tale/t1/context',
      '/create-danced-tale/t1/discovery',
      '/create-danced-tale/t1/resources',
      '/create-danced-tale/t1/class-resources',
      null,
      '/create-danced-tale/t1/structure',
      null,
      null,
    ]);
    expect(items()[4].querySelector('[aria-current="step"]')).not.toBeNull();
  });

  it('avec une trame, l\'écriture et la scénographie s\'ouvrent aussi', async () => {
    await setup('/create-danced-tale/t1/context', { context: true, structure: true });

    expect(links().slice(6)).toEqual(['/create-danced-tale/t1/writing', '/create-danced-tale/t1/staging']);
  });

  it('un clic sur une étape ouvre l\'écran correspondant', async () => {
    await setup('/create-danced-tale/t1/discovery', { context: true });

    items()[5].querySelector('a')!.click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/create-danced-tale/t1/structure');
    expect(items()[5].querySelector('a')).toBeNull();
    expect(items()[1].querySelector('a')).not.toBeNull();
  });
});
