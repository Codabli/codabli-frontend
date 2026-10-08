import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { TaleStructureComponent } from './tale-structure.component';
import { CreateDancedTaleDraftService } from '../../../core/services/create-danced-tale-draft.service';
import { ProjectContext } from '../../../models/interfaces/project-context.interface';
import { TaleStructure } from '../../../models/interfaces/tale-structure.interface';
import { TaleUniverse } from '../../../models/interfaces/tale-universe.interface';

const CONTEXT: ProjectContext = {
  ageRange: '6-8',
  country: 'France',
  region: 'Bretagne',
  city: '',
  theme: 'Le Moyen Âge',
  secretIngredients: [],
  performanceSpace: null,
};

const UNIVERSE: TaleUniverse = {
  places: [],
  characters: [
    { id: 'arthur', name: 'Arthur', role: 'Héros', description: 'Un écuyer', goal: 'Devenir roi', image: null },
    { id: 'merlin', name: 'Merlin', role: 'Guide', description: 'Un enchanteur', goal: 'Aider', image: null },
  ],
  periods: [],
  objects: [],
};

const afterRender = () => new Promise((resolve) => setTimeout(resolve));

describe('TaleStructureComponent', () => {
  let fixture: ComponentFixture<TaleStructureComponent>;
  let element: HTMLElement;
  let router: Router;
  let draftService: CreateDancedTaleDraftService;

  async function setup(options: {
    context?: Partial<ProjectContext>;
    universe?: TaleUniverse | null;
    structure?: TaleStructure;
  } = {}): Promise<void> {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [TaleStructureComponent],
      providers: [provideRouter([]), provideTranslateService()],
    }).compileComponents();

    draftService = TestBed.inject(CreateDancedTaleDraftService);
    draftService.saveContext({ ...CONTEXT, ...options.context });
    if (options.universe !== null) {
      draftService.saveUniverse(options.universe ?? UNIVERSE);
    }
    if (options.structure) {
      draftService.saveStructure(options.structure);
    }

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(TaleStructureComponent);
    element = fixture.nativeElement;
    await fixture.whenStable();
  }

  function steps(): HTMLLIElement[] {
    return Array.from(element.querySelectorAll<HTMLLIElement>('li.story-step'));
  }

  function titleInput(step: HTMLElement): HTMLInputElement {
    return step.querySelector<HTMLInputElement>('input[type="text"]')!;
  }

  function stepTitles(): string[] {
    return steps().map((step) => titleInput(step).value);
  }

  function type(field: HTMLInputElement | HTMLTextAreaElement, value: string): void {
    field.value = value;
    field.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function click(target: HTMLElement): void {
    target.click();
    fixture.detectChanges();
  }

  function actionButtons(step: HTMLElement): HTMLButtonElement[] {
    return Array.from(step.querySelectorAll<HTMLButtonElement>('.story-step__actions button'));
  }

  function clickNext(): void {
    click(element.querySelector<HTMLElement>('.tale-structure__actions app-button:last-child')!);
  }

  it('propose 5 étapes par défaut, numérotées', async () => {
    await setup();

    expect(steps()).toHaveLength(5);
    expect(stepTitles()[0]).toBe('createDancedTale.structure.kinds.initialSituation.title');
    expect(steps().map((step) => step.querySelector('.story-step__number')!.textContent!.trim())).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
    ]);
  });

  it('propose 3 étapes pour les 3-5 ans (RG-CMC-09)', async () => {
    await setup({ context: { ageRange: '3-5' } });

    expect(stepTitles()).toEqual([
      'createDancedTale.structure.kinds.initialSituation.title',
      'createDancedTale.structure.kinds.adventures.title',
      'createDancedTale.structure.kinds.finalSituation.title',
    ]);
  });

  it('descend une étape avec le bouton et garde le focus dessus (RG-CMC-10)', async () => {
    await setup();
    type(titleInput(steps()[0]), 'Premier');
    type(titleInput(steps()[1]), 'Deuxième');

    click(actionButtons(steps()[0])[1]);
    await afterRender();

    expect(stepTitles().slice(0, 2)).toEqual(['Deuxième', 'Premier']);
    expect(document.activeElement).toBe(actionButtons(steps()[1])[1]);
    expect(element.querySelector('[aria-live="polite"]')!.textContent).toContain(
      'createDancedTale.structure.announce.moved',
    );
  });

  it('désactive « monter » sur la première étape et « descendre » sur la dernière', async () => {
    await setup();

    expect(actionButtons(steps()[0])[0].disabled).toBe(true);
    expect(actionButtons(steps()[4])[1].disabled).toBe(true);
  });

  it('ajoute une étape à la fin et place le focus sur son titre', async () => {
    await setup();

    click(element.querySelector<HTMLButtonElement>('#add-step')!);
    await afterRender();

    expect(steps()).toHaveLength(6);
    expect(document.activeElement).toBe(titleInput(steps()[5]));
  });

  it('supprime une étape et renumérote les suivantes', async () => {
    await setup();

    click(actionButtons(steps()[0])[2]);

    expect(steps()).toHaveLength(4);
    expect(stepTitles()[0]).toBe('createDancedTale.structure.kinds.trigger.title');
    expect(steps()[0].querySelector('.story-step__number')!.textContent!.trim()).toBe('1');
  });

  it('associe des personnages de l\'univers à une étape', async () => {
    await setup();
    const checkboxes = steps()[0].querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    expect(checkboxes).toHaveLength(2);

    click(checkboxes[1]);
    clickNext();
    clickNext();

    expect(draftService.structure()!.steps[0].characterIds).toEqual(['merlin']);
  });

  it('renvoie vers l\'univers s\'il n\'y a aucun personnage', async () => {
    await setup({ universe: null });

    expect(steps()[0].querySelector('input[type="checkbox"]')).toBeNull();
    expect(steps()[0].querySelector('.characters__empty a')).not.toBeNull();
  });

  it('alerte sur les étapes essentielles vides sans bloquer', async () => {
    await setup();

    clickNext();

    expect(router.navigate).not.toHaveBeenCalled();
    expect(element.querySelector('#empty-steps-alert')).not.toBeNull();
    expect(element.querySelectorAll('.step-warning')).toHaveLength(5);
    const summary = steps()[0].querySelector('textarea')!;
    expect(summary.getAttribute('aria-describedby')).toContain('-warning');

    click(element.querySelector<HTMLElement>('#empty-steps-alert app-button')!);

    expect(draftService.structure()!.steps).toHaveLength(5);
    expect(router.navigate).toHaveBeenCalledWith(['../writing'], expect.anything());
  });

  it('passe directement à la suite quand les étapes essentielles sont remplies', async () => {
    await setup();
    steps().forEach((step) => type(step.querySelector('textarea')!, 'Il se passe quelque chose.'));

    clickNext();

    expect(element.querySelector('#empty-steps-alert')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['../writing'], expect.anything());
  });

  it('bloque si une étape n\'a pas de titre', async () => {
    await setup();
    type(titleInput(steps()[2]), '   ');

    clickNext();

    expect(router.navigate).not.toHaveBeenCalled();
    const errorId = titleInput(steps()[2]).getAttribute('aria-describedby');
    expect(element.querySelector(`#${errorId}`)).not.toBeNull();
  });

  it('restaure la trame du brouillon', async () => {
    await setup({
      structure: {
        steps: [{ id: 's1', kind: null, title: 'Ma seule étape', summary: 'Résumé', characterIds: ['arthur'] }],
      },
    });

    expect(stepTitles()).toEqual(['Ma seule étape']);
    expect(steps()[0].querySelector<HTMLInputElement>('input[type="checkbox"]')!.checked).toBe(true);
    // Une seule étape : elle ne peut pas être supprimée.
    expect(actionButtons(steps()[0])[2].disabled).toBe(true);
  });

  it('garde la saisie en revenant à l\'univers', async () => {
    await setup();
    type(steps()[0].querySelector('textarea')!, 'Au début…');

    click(element.querySelector<HTMLElement>('.tale-structure__actions app-button:first-child')!);

    expect(draftService.structure()!.steps[0].summary).toBe('Au début…');
    expect(router.navigate).toHaveBeenCalledWith(['../universe'], expect.anything());
  });
});
