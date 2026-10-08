import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { AUTOSAVE_DELAY_MS, TaleWritingComponent } from './tale-writing.component';
import { RichTextEditor } from '../../../shared/components/rich-text-editor/rich-text-editor.component';
import { CreateDancedTaleDraftService } from '../../../core/services/create-danced-tale-draft.service';
import { TaleWriting } from '../../../models/interfaces/tale-writing.interface';

describe('TaleWritingComponent', () => {
  let fixture: ComponentFixture<TaleWritingComponent>;
  let element: HTMLElement;
  let router: Router;
  let draftService: CreateDancedTaleDraftService;

  async function setup(writing?: TaleWriting): Promise<void> {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [TaleWritingComponent],
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
        { id: 'arthur', name: 'Arthur', role: 'Héros', description: 'Un écuyer', goal: 'Régner', image: null },
      ],
      periods: [],
      objects: [],
    });
    draftService.saveStructure({
      steps: [
        { id: 's1', kind: 'initialSituation', title: 'Le départ', summary: 'Arthur part', characterIds: ['arthur'] },
        { id: 's2', kind: 'finalSituation', title: 'Le retour', summary: '', characterIds: [] },
      ],
    });
    if (writing) {
      draftService.saveWriting(writing);
    }

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(TaleWritingComponent);
    element = fixture.nativeElement;
    await fixture.whenStable();
  }

  afterEach(() => {
    vi.useRealTimers();
  });

  function stepButtons(): HTMLButtonElement[] {
    return Array.from(element.querySelectorAll<HTMLButtonElement>('.steps-panel__step'));
  }

  function editor(): RichTextEditor {
    return fixture.debugElement.query(By.directive(RichTextEditor)).componentInstance;
  }

  function write(html: string): void {
    editor().contentChange.emit(html);
    fixture.detectChanges();
  }

  it('liste les étapes de la trame et ouvre la première', async () => {
    await setup();

    expect(stepButtons().map((button) => button.querySelector('.steps-panel__name')!.textContent!.trim())).toEqual([
      '1. Le départ',
      '2. Le retour',
    ]);
    expect(stepButtons()[0].getAttribute('aria-current')).toBe('step');
    expect(element.querySelector('#current-step-title')!.textContent!.trim()).toBe('Le départ');
    expect(element.querySelector('#step-reminder')!.textContent).toContain('Arthur part');
    expect(element.querySelector('#step-reminder')!.textContent).toContain('Arthur');
  });

  it('change d\'étape et recrée l\'éditeur avec le texte de cette étape', async () => {
    await setup({ title: '', texts: { s2: '<p>Fin</p>' } });
    const firstEditor = editor();

    stepButtons()[1].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(stepButtons()[1].getAttribute('aria-current')).toBe('step');
    expect(editor()).not.toBe(firstEditor);
    expect(element.querySelector('[contenteditable]')!.textContent).toBe('Fin');
  });

  it('sauvegarde automatiquement après une pause dans la frappe (RG-CMC-12)', async () => {
    await setup();
    vi.useFakeTimers();

    write('<p>Il était une fois</p>');
    expect(draftService.writing()).toBeNull();

    vi.advanceTimersByTime(AUTOSAVE_DELAY_MS);
    fixture.detectChanges();

    expect(draftService.writing()).toEqual({ title: '', texts: { s1: '<p>Il était une fois</p>' } });
    expect(element.querySelector('.autosave')!.textContent).toContain('createDancedTale.writing.autosave.saved');
    expect(stepButtons()[0].querySelector('.steps-panel__status--done')).not.toBeNull();
  });

  it('sauvegarde aussi le titre du conte', async () => {
    await setup();
    vi.useFakeTimers();
    const title = element.querySelector<HTMLInputElement>('#tale-title')!;

    title.value = '  Arthur et l\'épée  ';
    title.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(AUTOSAVE_DELAY_MS);

    expect(draftService.writing()!.title).toBe('Arthur et l\'épée');
  });

  it('enregistre la saisie en attente avant de changer d\'écran', async () => {
    await setup();
    write('<p>Brouillon</p>');

    element.querySelector<HTMLElement>('.tale-writing__actions app-button:last-child')!.click();

    expect(draftService.writing()!.texts['s1']).toBe('<p>Brouillon</p>');
    expect(router.navigate).toHaveBeenCalledWith(['../staging'], expect.anything());
  });

  it('signale une sauvegarde impossible', async () => {
    await setup();
    vi.useFakeTimers();
    vi.spyOn(draftService, 'saveWriting').mockReturnValue(false);

    write('<p>Texte</p>');
    vi.advanceTimersByTime(AUTOSAVE_DELAY_MS);
    fixture.detectChanges();

    expect(element.querySelector('.autosave--error')).not.toBeNull();
  });

  it('affiche l\'avertissement éthique et les actions de l\'assistant, désactivées pour l\'instant', async () => {
    await setup();

    expect(element.querySelector('.assistant__warning')!.textContent).toContain(
      'createDancedTale.writing.assistant.warning',
    );
    const actions = element.querySelectorAll<HTMLButtonElement>('.assistant button');
    expect(actions).toHaveLength(4);
    actions.forEach((button) => expect(button.disabled).toBe(true));
  });
});
