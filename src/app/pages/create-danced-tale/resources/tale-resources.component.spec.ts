import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { TaleResourcesComponent } from './tale-resources.component';
import { CULTURAL_RESOURCE_CATALOG, isNearSchool, matchedKeywords } from './resource-catalog';
import { CreateDancedTaleDraftService } from '@core/services/create-danced-tale-draft.service';
import { ProjectContext } from '@models/interfaces/project-context.interface';
import { TaleResources } from '@models/interfaces/tale-resources.interface';

const CONTEXT: ProjectContext = {
  ageRange: '6-8',
  country: 'France',
  region: 'Bretagne',
  city: 'Rennes',
  theme: 'Le Moyen Âge : le roi Arthur',
  secretIngredients: ['chevaliers'],
  performanceSpace: null,
};

function catalogResource(id: string) {
  return CULTURAL_RESOURCE_CATALOG.find((resource) => resource.id === id)!;
}

describe('catalogue des ressources culturelles', () => {
  it('retrouve les mots-clés dans le thème et les ingrédients, au début d\'un mot', () => {
    expect(matchedKeywords(catalogResource('montSaintMichel'), CONTEXT)).toEqual(['moyen age', 'chevalier']);
    expect(matchedKeywords(catalogResource('chambord'), { ...CONTEXT, theme: 'Un hiver froid' })).toEqual([]);
    expect(matchedKeywords(catalogResource('chambord'), null)).toEqual([]);
  });

  it('reconnaît une ressource proche de l\'école sans tenir compte de la casse, des accents ni des tirets', () => {
    const joan = catalogResource('joanOfArc');

    expect(isNearSchool(joan, { ...CONTEXT, region: 'centre val de loire' })).toBe(true);
    expect(isNearSchool(joan, { ...CONTEXT, region: 'Occitanie', city: 'ORLEANS' })).toBe(true);
    expect(isNearSchool(joan, CONTEXT)).toBe(false);
    expect(isNearSchool(catalogResource('kingArthur'), CONTEXT)).toBe(false);
  });
});

describe('TaleResourcesComponent', () => {
  let fixture: ComponentFixture<TaleResourcesComponent>;
  let element: HTMLElement;
  let router: Router;
  let draftService: CreateDancedTaleDraftService;

  async function setup(context: ProjectContext = CONTEXT, resources?: TaleResources): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [TaleResourcesComponent],
      providers: [provideRouter([]), provideTranslateService()],
    }).compileComponents();

    draftService = TestBed.inject(CreateDancedTaleDraftService);
    draftService.saveContext(context);
    if (resources) {
      draftService.saveResources(resources);
    }

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(TaleResourcesComponent);
    element = fixture.nativeElement;
    document.body.appendChild(element);
    await fixture.whenStable();
  }

  afterEach(() => {
    document.body.innerHTML = '';
  });

  function tabs(): HTMLButtonElement[] {
    return Array.from(element.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  }

  // Sans fichier de traduction, les titres affichés sont les clés : elles contiennent l'identifiant.
  function cardIds(): string[] {
    return Array.from(element.querySelectorAll('.card__title')).map(
      (title) => title.textContent!.trim().split('.').at(-2)!,
    );
  }

  function card(id: string): HTMLElement {
    return Array.from(element.querySelectorAll<HTMLElement>('.card')).find((item) =>
      item.querySelector('.card__title')!.textContent!.includes(`.${id}.`),
    )!;
  }

  async function click(target: HTMLElement): Promise<void> {
    target.click();
    await fixture.whenStable();
  }

  async function press(key: string): Promise<void> {
    element.querySelector('[role="tablist"]')!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    await fixture.whenStable();
  }

  it('présente les recommandations en onglets, dont « près de votre école »', async () => {
    await setup();

    expect(tabs().map((tab) => tab.id)).toEqual([
      'resources-tab-places',
      'resources-tab-characters',
      'resources-tab-events',
      'resources-tab-artworks',
      'resources-tab-tales',
      'resources-tab-nearby',
    ]);
    expect(tabs()[0].getAttribute('aria-selected')).toBe('true');
    expect(element.querySelector('[role="tabpanel"]')!.getAttribute('aria-labelledby')).toBe('resources-tab-places');
  });

  it('classe les ressources les plus proches du thème en premier', async () => {
    await setup();

    // Mont-Saint-Michel : « moyen âge » et « chevalier » ; Chambord : « roi » ; Brocéliande : « Arthur ».
    expect(cardIds()).toEqual(['montSaintMichel', 'chambord', 'broceliande']);
  });

  it('affiche le badge d\'origine sur chaque carte (RG-CMC-05)', async () => {
    await setup();

    for (const tab of tabs().slice(0, 5)) {
      await click(tab);
      for (const item of Array.from(element.querySelectorAll('.card'))) {
        expect(item.querySelector('.provenance')?.className).toMatch(/provenance--(codabli|localHeritage|ai)/);
      }
    }
  });

  it('montre les ressources proches de l\'école dans l\'onglet dédié', async () => {
    await setup();

    await click(tabs()[5]);

    expect(cardIds()).toEqual(['broceliande']);
    expect(card('broceliande').querySelector('.card__nearby')).not.toBeNull();
    expect(element.textContent).toContain('createDancedTale.resources.nearbyHint');
  });

  it('indique qu\'aucune ressource n\'est encore répertoriée près de l\'école', async () => {
    await setup({ ...CONTEXT, region: 'Occitanie', city: 'Toulouse' });

    await click(tabs()[5]);

    expect(cardIds()).toEqual([]);
    expect(element.textContent).toContain('createDancedTale.resources.emptyNearby');
  });

  it('se parcourt au clavier avec les flèches, Début et Fin', async () => {
    await setup();
    tabs()[0].focus();

    await press('ArrowRight');
    expect(tabs()[1].getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tabs()[1]);
    expect(tabs().map((tab) => tab.tabIndex)).toEqual([-1, 0, -1, -1, -1, -1]);

    await press('End');
    expect(document.activeElement).toBe(tabs()[5]);

    await press('ArrowRight');
    expect(document.activeElement).toBe(tabs()[0]);

    await press('ArrowLeft');
    expect(document.activeElement).toBe(tabs()[5]);
  });

  it('ajoute une ressource au corpus du projet et l\'enregistre dans le brouillon', async () => {
    await setup();
    const add = card('chambord').querySelector<HTMLButtonElement>('.action--add')!;

    await click(add);

    expect(add.getAttribute('aria-pressed')).toBe('true');
    expect(draftService.resources()).toEqual({ added: ['chambord'] });

    await click(add);
    expect(draftService.resources()).toEqual({ added: [] });
  });

  it('reprend les ressources déjà ajoutées', async () => {
    await setup(CONTEXT, { added: ['broceliande'] });

    expect(card('broceliande').classList).toContain('card--added');
    expect(card('chambord').classList).not.toContain('card--added');
  });

  it('explique pourquoi la ressource est recommandée (RG-CMC-06)', async () => {
    await setup();

    await click(card('broceliande').querySelector<HTMLButtonElement>('.action--view')!);

    const dialog = element.querySelector('[role="dialog"]')!;
    const why = dialog.querySelector('.detail__section')!;
    expect(why.textContent).toContain('createDancedTale.resources.detail.why');
    expect(why.textContent).toContain('createDancedTale.resources.catalog.broceliande.reason');
    expect(why.textContent).toContain('createDancedTale.resources.detail.themeMatch');
    expect(why.textContent).toContain('createDancedTale.resources.detail.nearbyMatch');
    expect(dialog.querySelector('.provenance--localHeritage')).not.toBeNull();
    expect(dialog.querySelector('.detail__credit a')!.getAttribute('href')).toContain('commons.wikimedia.org');
  });

  it('signale qu\'une suggestion IA est à vérifier', async () => {
    await setup();
    await click(tabs()[1]);

    await click(card('morganLeFay').querySelector<HTMLButtonElement>('.action--view')!);

    expect(element.querySelector('[role="dialog"]')!.textContent).toContain(
      'createDancedTale.resources.detail.aiWarning',
    );
  });

  it('ajoute une ressource depuis la fenêtre de détails', async () => {
    await setup();
    await click(card('chambord').querySelector<HTMLButtonElement>('.action--view')!);

    await click(element.querySelector<HTMLButtonElement>('[role="dialog"] .action--add')!);

    expect(draftService.resources()).toEqual({ added: ['chambord'] });
  });

  it('revient à la découverte artistique ou passe aux ressources de la classe', async () => {
    await setup();
    const buttons = element.querySelectorAll<HTMLButtonElement>('.resource-screen__actions app-button button');

    buttons[0].click();
    expect(router.navigate).toHaveBeenCalledWith(['../discovery'], expect.anything());

    buttons[1].click();
    expect(router.navigate).toHaveBeenCalledWith(['../class-resources'], expect.anything());
  });
});
