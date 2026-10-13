import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { TaleUniverseComponent } from './tale-universe.component';
import { CreateDancedTaleDraftService } from '../../../core/services/create-danced-tale-draft.service';
import { ImageResizeError, ImageResizeService } from '../../../core/services/image-resize.service';
import { ProjectContext } from '../../../models/interfaces/project-context.interface';
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
  places: [{ id: 'p1', name: 'La forêt', description: '', image: 'data:image/jpeg;base64,AAA' }],
  characters: [],
  periods: [],
  objects: [],
};

const afterRender = () => new Promise((resolve) => setTimeout(resolve));

describe('TaleUniverseComponent', () => {
  let fixture: ComponentFixture<TaleUniverseComponent>;
  let element: HTMLElement;
  let router: Router;
  let draftService: CreateDancedTaleDraftService;
  let resize: ReturnType<typeof vi.fn>;

  async function setup(savedUniverse?: TaleUniverse): Promise<void> {
    localStorage.clear();
    resize = vi.fn().mockResolvedValue('data:image/jpeg;base64,RESIZED');

    await TestBed.configureTestingModule({
      imports: [TaleUniverseComponent],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: ImageResizeService, useValue: { resize } },
      ],
    }).compileComponents();

    draftService = TestBed.inject(CreateDancedTaleDraftService);
    draftService.saveContext(CONTEXT);
    if (savedUniverse) {
      draftService.saveUniverse(savedUniverse);
    }

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(TaleUniverseComponent);
    element = fixture.nativeElement;
    await fixture.whenStable();
  }

  function click(selector: string): void {
    element.querySelector<HTMLElement>(selector)!.click();
    fixture.detectChanges();
  }

  function cardsOf(section: string): NodeListOf<HTMLFieldSetElement> {
    return element.querySelectorAll<HTMLFieldSetElement>(`section[aria-labelledby="${section}-title"] fieldset`);
  }

  function type(field: HTMLInputElement | HTMLTextAreaElement, value: string): void {
    field.value = value;
    field.dispatchEvent(new Event('input'));
  }

  function clickNext(): void {
    click('.tale-universe__actions app-button:last-child');
  }

  it('rappelle le thème du projet et propose une carte vide par sous-section', async () => {
    await setup();

    expect(element.querySelector('.tale-universe__theme')!.textContent).toContain('Le Moyen Âge');
    expect(element.querySelectorAll('section.universe-section')).toHaveLength(4);
    for (const section of ['places', 'characters', 'periods', 'objects']) {
      expect(cardsOf(section)).toHaveLength(1);
    }
  });

  it('ajoute une carte et place le focus sur son nom', async () => {
    await setup();

    click('#add-places');
    await afterRender();

    const cards = cardsOf('places');
    expect(cards).toHaveLength(2);
    expect(document.activeElement).toBe(cards[1].querySelector('input[type="text"]'));
  });

  it('affiche rôle et objectif seulement pour un personnage', async () => {
    await setup();

    expect(cardsOf('places')[0].querySelectorAll('input[type="text"], textarea')).toHaveLength(2);
    expect(cardsOf('characters')[0].querySelectorAll('input[type="text"], textarea')).toHaveLength(4);
  });

  it('bloque le passage à l\'étape suivante et relie les erreurs aux champs', async () => {
    await setup();
    const [name, ...missing] = cardsOf('characters')[0].querySelectorAll<HTMLElement>('input[type="text"], textarea');
    type(name as HTMLInputElement, 'Arthur');

    clickNext();

    expect(router.navigate).not.toHaveBeenCalled();
    missing.forEach((field) => {
      const errorId = field.getAttribute('aria-describedby');
      expect(errorId).toBeTruthy();
      expect(element.querySelector(`#${errorId}`)).not.toBeNull();
    });
  });

  it('ignore les cartes laissées vides', async () => {
    await setup();

    clickNext();

    expect(draftService.universe()).toEqual({ places: [], characters: [], periods: [], objects: [] });
    expect(router.navigate).toHaveBeenCalledWith(['../structure'], expect.anything());
  });

  it('enregistre l\'univers et passe à la trame du récit', async () => {
    await setup();
    const [name, role, description, goal] = cardsOf('characters')[0].querySelectorAll<HTMLInputElement>(
      'input[type="text"], textarea',
    );
    type(name, 'Arthur');
    type(role, 'Héros');
    type(description, 'Un jeune roi');
    type(goal, 'Retrouver Excalibur');

    clickNext();

    expect(draftService.universe()!.characters).toEqual([
      {
        id: expect.any(String),
        name: 'Arthur',
        role: 'Héros',
        description: 'Un jeune roi',
        goal: 'Retrouver Excalibur',
        image: null,
      },
    ]);
    expect(router.navigate).toHaveBeenCalledWith(['../structure'], expect.anything());
  });

  it('garde une saisie incomplète en revenant à l\'étape précédente', async () => {
    await setup();
    type(cardsOf('objects')[0].querySelector('textarea')!, 'Une épée');

    click('.tale-universe__actions app-button:first-child');

    expect(draftService.universe()!.objects).toHaveLength(1);
    expect(router.navigate).toHaveBeenCalledWith(['../discovery'], expect.anything());
  });

  it('n\'enregistre rien en revenant en arrière si rien n\'a été saisi', async () => {
    await setup();

    click('.tale-universe__actions app-button:first-child');

    expect(draftService.universe()).toBeNull();
  });

  it('propose une carte vide dans les sous-sections vides d\'un brouillon déjà enregistré', async () => {
    await setup(UNIVERSE);

    expect(cardsOf('places')).toHaveLength(1);
    for (const section of ['characters', 'periods', 'objects']) {
      expect(cardsOf(section)).toHaveLength(1);
    }
  });

  it('restaure l\'univers du brouillon, image comprise', async () => {
    await setup(UNIVERSE);

    const card = cardsOf('places')[0];
    expect(card.querySelector<HTMLInputElement>('input[type="text"]')!.value).toBe('La forêt');
    expect(card.querySelector<HTMLImageElement>('img')!.src).toBe(UNIVERSE.places[0].image);
  });

  it('supprime une carte et rend le focus au bouton d\'ajout', async () => {
    await setup(UNIVERSE);

    click('.universe-card__remove');
    await afterRender();

    expect(cardsOf('places')).toHaveLength(0);
    expect(document.activeElement).toBe(element.querySelector('#add-places button'));
  });

  it('compresse l\'image choisie et l\'affiche', async () => {
    await setup();
    click('#add-places');
    const fileInput = cardsOf('places')[0].querySelector<HTMLInputElement>('input[type="file"]')!;
    const file = new File(['x'], 'foret.png', { type: 'image/png' });
    Object.defineProperty(fileInput, 'files', { value: [file] });

    fileInput.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(resize).toHaveBeenCalledWith(file);
    expect(cardsOf('places')[0].querySelector('img')!.getAttribute('src')).toBe('data:image/jpeg;base64,RESIZED');
  });

  it('affiche une erreur reliée au champ si le fichier n\'est pas une image', async () => {
    await setup();
    resize.mockRejectedValue(new ImageResizeError('not-an-image'));
    click('#add-places');
    const fileInput = cardsOf('places')[0].querySelector<HTMLInputElement>('input[type="file"]')!;
    Object.defineProperty(fileInput, 'files', { value: [new File(['x'], 'notes.txt', { type: 'text/plain' })] });

    fileInput.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    fixture.detectChanges();

    const errorId = fileInput.getAttribute('aria-describedby');
    expect(errorId).toBeTruthy();
    expect(element.querySelector(`#${errorId}`)).not.toBeNull();
    expect(cardsOf('places')[0].querySelector('img')).toBeNull();
  });

  it('prévient quand le brouillon ne peut pas être enregistré', async () => {
    await setup();
    vi.spyOn(draftService, 'saveUniverse').mockReturnValue(false);

    clickNext();

    expect(router.navigate).not.toHaveBeenCalled();
    expect(element.querySelector('#storage-error')).not.toBeNull();
  });
});
