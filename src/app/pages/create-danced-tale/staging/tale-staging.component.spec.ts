import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { TaleStagingComponent } from './tale-staging.component';
import { AUTOSAVE_DELAY_MS } from '../autosave/autosave';
import { CreateDancedTaleDraftService } from '../../../core/services/create-danced-tale-draft.service';
import { TaleStaging } from '../../../models/interfaces/tale-staging.interface';

// Le premier rendu de l'écran (scènes, danses, plateau) dépasse parfois 5 s quand toute la suite tourne.
describe('TaleStagingComponent', { timeout: 15000 }, () => {
  let fixture: ComponentFixture<TaleStagingComponent>;
  let element: HTMLElement;
  let router: Router;
  let draftService: CreateDancedTaleDraftService;

  async function setup(staging?: TaleStaging): Promise<void> {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [TaleStagingComponent],
      providers: [provideRouter([]), provideTranslateService()],
    }).compileComponents();

    draftService = TestBed.inject(CreateDancedTaleDraftService);
    draftService.saveContext({
      ageRange: '6-8',
      country: 'France',
      region: 'Bretagne',
      city: '',
      theme: 'Le Moyen Âge',
      secretIngredients: [],
      performanceSpace: null,
    });
    draftService.saveUniverse({
      places: [],
      characters: [
        { id: 'arthur', name: 'Arthur', role: 'Héros', description: '', goal: '', image: null },
        { id: 'merlin', name: 'Merlin', role: 'Guide', description: '', goal: '', image: null },
      ],
      periods: [],
      objects: [],
    });
    draftService.saveStructure({
      steps: [
        { id: 's1', kind: 'initialSituation', title: 'Le banquet', summary: 'Fête au château', characterIds: ['arthur'] },
        { id: 's2', kind: 'finalSituation', title: 'Le retour', summary: '', characterIds: [] },
      ],
    });
    draftService.saveWriting({ title: '', texts: { s1: '<p>Il était une fois</p>', s2: '<p></p>' } });
    if (staging) {
      draftService.saveStaging(staging);
    }

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(TaleStagingComponent);
    element = fixture.nativeElement;
    await fixture.whenStable();
  }

  afterEach(() => {
    vi.useRealTimers();
  });

  /** Une entrée de la frise : la carte de la scène et ses danses. */
  function scenes(): HTMLElement[] {
    return Array.from(element.querySelectorAll<HTMLElement>('li.scene-item'));
  }

  function checkboxes(scene: HTMLElement): HTMLInputElement[] {
    return Array.from(scene.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
  }

  function saveNow(): void {
    vi.advanceTimersByTime(AUTOSAVE_DELAY_MS);
    fixture.detectChanges();
  }

  it('affiche une scène par étape de la trame, avec le texte écrit à l\'écran 7', async () => {
    await setup();

    expect(scenes()).toHaveLength(2);
    expect(scenes()[0].querySelector('h3')!.textContent).toContain('createDancedTale.staging.scene.title');
    expect(scenes()[0].querySelector('.scene__summary')!.textContent).toContain('Fête au château');
    expect(scenes()[0].querySelector('.scene__text-content')!.innerHTML).toBe('<p>Il était une fois</p>');
    // Texte vide : pas de bloc « Voir le texte ».
    expect(scenes()[1].querySelector('.scene__text')).toBeNull();
  });

  it('reprend les personnages associés à l\'étape dans la trame', async () => {
    await setup();

    expect(checkboxes(scenes()[0]).map((box) => box.checked)).toEqual([true, false]);
    expect(scenes()[0].querySelectorAll('fieldset.movement')).toHaveLength(1);
    expect(scenes()[1].querySelectorAll('fieldset.movement')).toHaveLength(0);
  });

  it('enregistre automatiquement personnages, entrées et sorties', async () => {
    await setup();
    vi.useFakeTimers();

    checkboxes(scenes()[0])[1].click();
    fixture.detectChanges();
    const exitSelect = scenes()[0].querySelectorAll<HTMLSelectElement>('fieldset.movement select')[3];
    exitSelect.value = 'exits';
    exitSelect.dispatchEvent(new Event('change'));
    saveNow();

    expect(draftService.staging()!.scenes['s1'].characters).toEqual([
      { characterId: 'arthur', entrance: 'onStage', exit: 'stays' },
      { characterId: 'merlin', entrance: 'onStage', exit: 'exits' },
    ]);
    expect(element.querySelector('.autosave')!.textContent).toContain('createDancedTale.autosave.saved');
  });

  it('demande le moment précis d\'une entrée pendant la scène, et l\'oublie sinon', async () => {
    await setup();
    vi.useFakeTimers();
    const movement = () => scenes()[0].querySelector<HTMLElement>('fieldset.movement')!;
    const entrance = movement().querySelector<HTMLSelectElement>('select')!;
    const momentInput = () => movement().querySelector<HTMLInputElement>('input[id$="-entrance-moment"]');
    expect(momentInput()).toBeNull();

    entrance.value = 'enters';
    entrance.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    momentInput()!.value = 'Quand Merlin arrive';
    momentInput()!.dispatchEvent(new Event('input'));
    saveNow();

    expect(draftService.staging()!.scenes['s1'].characters[0]).toMatchObject({
      entrance: 'enters',
      entranceMoment: 'Quand Merlin arrive',
    });
    // Le champ a un libellé relié.
    expect(movement().querySelector(`label[for="${momentInput()!.id}"]`)).not.toBeNull();

    entrance.value = 'onStage';
    entrance.dispatchEvent(new Event('change'));
    saveNow();

    expect(momentInput()).toBeNull();
    expect(draftService.staging()!.scenes['s1'].characters[0].entranceMoment).toBeUndefined();
  });

  it('enregistre l\'intention théâtrale', async () => {
    await setup();
    vi.useFakeTimers();
    const textarea = scenes()[1].querySelector('textarea')!;

    textarea.value = 'Le soulagement';
    textarea.dispatchEvent(new Event('input'));
    saveNow();

    expect(draftService.staging()!.scenes['s2'].intention).toBe('Le soulagement');
  });

  it('ajoute des décors avec Entrée, sans doublon, et les retire', async () => {
    await setup();
    const input = scenes()[0].querySelector<HTMLInputElement>('.prop-input input')!;
    const pressEnter = (value: string) => {
      input.value = value;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      fixture.detectChanges();
    };

    pressEnter('Une table');
    pressEnter('  une TABLE ');
    pressEnter('Un trône');

    const chips = () => Array.from(scenes()[0].querySelectorAll('.chip span')).map((chip) => chip.textContent);
    expect(chips()).toEqual(['Une table', 'Un trône']);
    expect(input.value).toBe('');

    scenes()[0].querySelector<HTMLButtonElement>('.chip__remove')!.click();
    fixture.detectChanges();

    expect(chips()).toEqual(['Un trône']);
    expect(document.activeElement).toBe(input);
  });

  it('restaure la mise en scène et retire les personnages supprimés de l\'univers', async () => {
    await setup({
      scenes: {
        s1: {
          characters: [
            { characterId: 'merlin', entrance: 'enters', exit: 'stays' },
            { characterId: 'gone', entrance: 'onStage', exit: 'stays' },
          ],
          intention: 'Mystère',
          props: ['Un chaudron'],
        },
      },
    });

    expect(checkboxes(scenes()[0]).map((box) => box.checked)).toEqual([false, true]);
    expect(scenes()[0].querySelector('textarea')!.value).toBe('Mystère');
    expect(scenes()[0].querySelector('.chip span')!.textContent).toBe('Un chaudron');
    expect(scenes()[0].querySelector<HTMLSelectElement>('fieldset.movement select')!.value).toBe('enters');
  });

  it('ajoute une danse à une scène et l\'enregistre', async () => {
    await setup();
    vi.useFakeTimers();
    const select = scenes()[1].querySelector<HTMLSelectElement>('[id$="-add-dance"]')!;

    select.value = 'farandole';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    scenes()[1].querySelector<HTMLElement>('.scene-dances__add app-button')!.click();
    saveNow();

    expect(draftService.staging()!.scenes['s2'].dances).toEqual([
      expect.objectContaining({ danceId: 'farandole', moment: null, style: 'traditional' }),
    ]);
    expect(scenes()[1].querySelectorAll('li.dance')).toHaveLength(1);
  });

  it('range les champs du ticket dans le bloc replié « Mise en scène de la scène »', async () => {
    await setup();
    const setup_ = scenes()[0].querySelector<HTMLDetailsElement>('details.scene__setup')!;

    expect(setup_.open).toBe(false);
    expect(setup_.querySelector('fieldset.field-group')).not.toBeNull();
    expect(setup_.querySelector('textarea')).not.toBeNull();
    expect(setup_.querySelector('app-scene-sounds')).not.toBeNull();
  });

  it('migre un ancien brouillon : la musique associée à une danse passe dans la danse', async () => {
    const sound = (id: string, danceId: string | null) => ({
      id,
      title: id,
      kind: 'music' as const,
      moment: 'wholeScene' as const,
      danceId,
      fileId: id,
      fileName: `${id}.mp3`,
    });
    await setup({
      scenes: {
        s1: {
          characters: [],
          intention: '',
          props: [],
          dances: [{ id: 'd1', danceId: 'festiveRound', name: 'Ronde', moment: 'beginning', style: 'traditional' }],
          sounds: [sound('luth', 'd1'), sound('orage', null)],
          placements: [{ kind: 'character', ref: 'arthur', x: 50, y: 50 }],
        } as never,
      },
    });
    vi.useFakeTimers();
    // Une modification déclenche l'enregistrement du brouillon migré.
    checkboxes(scenes()[0])[1].click();
    saveNow();

    const scene = draftService.staging()!.scenes['s1'];
    expect(scene.dances![0].sounds!.map((s) => s.title)).toEqual(['luth']);
    expect(scene.sounds!.map((s) => s.title)).toEqual(['orage']);
    // « Toute la scène » devient l'absence de moment.
    expect(scene.sounds![0].moment).toBeNull();
    expect('placements' in scene).toBe(false);
  });

  it('enregistre la saisie en attente en revenant à l\'écriture', async () => {
    await setup();
    checkboxes(scenes()[1])[0].click();

    element.querySelector<HTMLElement>('.tale-staging__actions app-button')!.click();

    expect(draftService.staging()!.scenes['s2'].characters).toHaveLength(1);
    expect(router.navigate).toHaveBeenCalledWith(['../writing'], expect.anything());
  });
});
