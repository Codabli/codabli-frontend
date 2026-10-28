import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { TaleDiscoveryComponent } from './tale-discovery.component';
import { DISCOVERY_CATALOG } from './discovery-catalog';
import { CreateDancedTaleDraftService } from '@core/services/create-danced-tale-draft.service';
import { TaleDiscovery } from '@models/interfaces/tale-discovery.interface';
import { AgeRange } from '@models/types/age-range.type';

describe('TaleDiscoveryComponent', () => {
  let fixture: ComponentFixture<TaleDiscoveryComponent>;
  let element: HTMLElement;
  let router: Router;
  let draftService: CreateDancedTaleDraftService;

  async function setup(ageRange: AgeRange = '6-8', discovery?: TaleDiscovery): Promise<void> {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [TaleDiscoveryComponent],
      providers: [provideRouter([]), provideTranslateService()],
    }).compileComponents();

    draftService = TestBed.inject(CreateDancedTaleDraftService);
    draftService.saveContext({
      ageRange,
      country: 'France',
      region: 'Bretagne',
      city: '',
      theme: 'Le Moyen Âge',
      secretIngredients: [],
      performanceSpace: null,
    });
    if (discovery) {
      draftService.saveDiscovery(discovery);
    }

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(TaleDiscoveryComponent);
    element = fixture.nativeElement;
    document.body.appendChild(element);
    await fixture.whenStable();
  }

  afterEach(() => {
    document.body.innerHTML = '';
  });

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

  function disciplineButton(index: number): HTMLButtonElement {
    return element.querySelectorAll<HTMLButtonElement>('.disciplines__item')[index];
  }

  async function select(id: string, value: string): Promise<void> {
    const field = element.querySelector<HTMLSelectElement>(`#${id}`)!;
    field.value = value;
    field.dispatchEvent(new Event('change'));
    await fixture.whenStable();
  }

  async function click(button: HTMLElement): Promise<void> {
    button.click();
    await fixture.whenStable();
  }

  it('n\'affiche que les ressources de la tranche d\'âge choisie à l\'étape 1 (RG-CMC-03)', async () => {
    await setup('6-8');

    const expected = DISCOVERY_CATALOG.filter((resource) => resource.ageRanges.includes('6-8')).map((r) => r.id);
    expect(cardIds()).toEqual(expected);
    expect(cardIds()).not.toContain('setDesign');
    expect(element.textContent).toContain('createDancedTale.discovery.ageNote');
  });

  it('propose d\'autres ressources pour une autre tranche d\'âge', async () => {
    await setup('12-14');

    expect(cardIds()).toContain('setDesign');
    expect(cardIds()).not.toContain('animalWakeUp');
  });

  it('filtre par discipline, avec le nombre de ressources de chaque catégorie', async () => {
    await setup('6-8');
    const counts = Array.from(element.querySelectorAll('.disciplines__count')).map((count) => count.textContent!.trim());
    // Toutes, danse, théâtre, musique, scénographie.
    expect(counts).toEqual(['8', '4', '2', '1', '1']);

    await click(disciplineButton(2));

    expect(cardIds()).toEqual(['pierrotMime', 'livingStatues']);
    expect(disciplineButton(2).getAttribute('aria-pressed')).toBe('true');
    expect(disciplineButton(0).getAttribute('aria-pressed')).toBe('false');
  });

  it('filtre par format et par durée d\'activité', async () => {
    await setup('6-8');

    await select('discovery-format', 'video');
    expect(cardIds()).toEqual(['serpentineAnnabelle', 'serpentineLumiere', 'lightAndVeils']);

    await select('discovery-duration', 'short');
    expect(cardIds()).toEqual(['serpentineAnnabelle']);
  });

  it('recherche dans les titres et propose d\'effacer les filtres quand rien ne correspond', async () => {
    await setup('6-8');
    const search = element.querySelector<HTMLInputElement>('#discovery-search')!;

    search.value = 'PIERROT';
    search.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(cardIds()).toEqual(['pierrotMime']);

    await select('discovery-format', 'pdf');
    expect(cardIds()).toEqual([]);
    expect(element.textContent).toContain('createDancedTale.discovery.empty');

    await click(element.querySelector<HTMLElement>('.catalog__empty app-button button')!);
    expect(cardIds()).toHaveLength(8);
    expect(search.value).toBe('');
  });

  it('ajoute une ressource au projet et l\'enregistre dans le brouillon', async () => {
    await setup('6-8');
    const add = card('blueDancers').querySelector<HTMLButtonElement>('.action--add')!;

    await click(add);

    expect(add.getAttribute('aria-pressed')).toBe('true');
    expect(card('blueDancers').classList).toContain('card--added');
    expect(draftService.discovery()?.added).toEqual(['blueDancers']);
    expect(element.querySelector('.resource-screen__summary')!.textContent).toContain('createDancedTale.discovery.addedCount');

    await click(add);
    expect(draftService.discovery()?.added).toEqual([]);
  });

  it('ajoute une ressource aux favoris (RG-CMC-04)', async () => {
    await setup('6-8');

    await click(card('swanImprovisation').querySelector<HTMLButtonElement>('.action--favorite')!);

    expect(draftService.discovery()?.favorites).toEqual(['swanImprovisation']);
  });

  it('reprend les choix enregistrés', async () => {
    await setup('6-8', { added: ['pierrotMime'], done: ['pierrotMime'], favorites: ['blueDancers'] });

    expect(card('pierrotMime').querySelector('.action--add')!.getAttribute('aria-pressed')).toBe('true');
    expect(card('pierrotMime').querySelector('.card__done')).not.toBeNull();
    expect(card('blueDancers').querySelector('.action--favorite')!.getAttribute('aria-pressed')).toBe('true');
  });

  it('ouvre la vidéo dans une fenêtre avec un lecteur sous-titré', async () => {
    await setup('6-8');

    await click(card('serpentineAnnabelle').querySelector<HTMLButtonElement>('.action--view')!);

    const dialog = element.querySelector('[role="dialog"]')!;
    const video = dialog.querySelector('video')!;
    expect(video.hasAttribute('controls')).toBe(true);
    expect(video.getAttribute('src')).toContain('danse-serpentine-annabelle.mp4');
    const tracks = Array.from(video.querySelectorAll('track'));
    expect(tracks.map((track) => track.getAttribute('srclang'))).toEqual(['fr', 'en']);
    expect(tracks.every((track) => track.getAttribute('kind') === 'subtitles')).toBe(true);
    expect(tracks[0].hasAttribute('default')).toBe(true);
    // Origine du média : lien vers sa source.
    expect(dialog.querySelector('.detail__credit a')!.getAttribute('href')).toContain('commons.wikimedia.org');
  });

  it('marque une ressource comme réalisée depuis la fenêtre de détails (RG-CMC-04)', async () => {
    await setup('6-8');
    await click(card('livingStatues').querySelector<HTMLButtonElement>('.action--view')!);
    const dialog = element.querySelector('[role="dialog"]')!;
    expect(dialog.querySelector('audio')).not.toBeNull();

    const done = Array.from(dialog.querySelectorAll<HTMLButtonElement>('.detail__actions .action'))[1];
    await click(done);

    expect(done.getAttribute('aria-pressed')).toBe('true');
    expect(draftService.discovery()?.done).toEqual(['livingStatues']);

    element.querySelector('app-modal')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(element.querySelector('[role="dialog"]')).toBeNull();
    expect(card('livingStatues').querySelector('.card__done')).not.toBeNull();
  });

  it('ouvre une fiche PDF dans un nouvel onglet', async () => {
    await setup('6-8');

    await click(card('animalWakeUp').querySelector<HTMLButtonElement>('.action--view')!);

    const link = element.querySelector<HTMLAnchorElement>('.detail__pdf')!;
    expect(link.getAttribute('href')).toContain('fiche-eveil-corporel-animaux.pdf');
    expect(link.target).toBe('_blank');
  });

  it('revient au contexte ou passe aux ressources culturelles', async () => {
    await setup();
    const buttons = element.querySelectorAll<HTMLButtonElement>('.resource-screen__actions app-button button');

    buttons[0].click();
    expect(router.navigate).toHaveBeenCalledWith(['../context'], expect.anything());

    buttons[1].click();
    expect(router.navigate).toHaveBeenCalledWith(['../resources'], expect.anything());
  });
});
