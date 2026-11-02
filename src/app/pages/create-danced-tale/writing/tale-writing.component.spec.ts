import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { TaleWritingComponent } from './tale-writing.component';
import { AUTOSAVE_DELAY_MS } from '../autosave/autosave';
import { RichTextEditor } from '@shared/components/rich-text-editor/rich-text-editor.component';
import { CreateDancedTaleDraftService } from '@core/services/create-danced-tale-draft.service';
import { TaleWriting } from '@models/interfaces/tale-writing.interface';
import { AssistantIaService } from '@core/services/assistant-ia.service';
import { MessageIa } from '@models/interfaces/assistant-ia.interface';
import { Observable, Subject, of, throwError } from 'rxjs';

describe('TaleWritingComponent', () => {
  let fixture: ComponentFixture<TaleWritingComponent>;
  let element: HTMLElement;
  let router: Router;
  let draftService: CreateDancedTaleDraftService;
  let assistant: { historique: ReturnType<typeof vi.fn>; envoyer: ReturnType<typeof vi.fn> };

  async function setup(
    writing?: TaleWriting,
    history: Observable<MessageIa[]> = of([]),
    taleId: string | null = null,
  ): Promise<void> {
    assistant = { historique: vi.fn(() => history), envoyer: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TaleWritingComponent],
      providers: [provideRouter([]), provideTranslateService(), { provide: AssistantIaService, useValue: assistant }],
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
        { id: 'arthur', name: 'Arthur', role: 'Héros', description: 'Un écuyer', goal: 'Régner', imageId: null },
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

    vi.spyOn(draftService, 'taleId').mockReturnValue(taleId);

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

    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS);
    fixture.detectChanges();

    expect(draftService.writing()).toEqual({ title: '', texts: { s1: '<p>Il était une fois</p>' } });
    expect(element.querySelector('.autosave')!.textContent).toContain('createDancedTale.autosave.saved');
    expect(stepButtons()[0].querySelector('.steps-panel__status--done')).not.toBeNull();
  });

  it('sauvegarde aussi le titre du conte', async () => {
    await setup();
    vi.useFakeTimers();
    const title = element.querySelector<HTMLInputElement>('#tale-title')!;

    title.value = '  Arthur et l\'épée  ';
    title.dispatchEvent(new Event('input'));
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS);

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
    vi.spyOn(draftService, 'saveWriting').mockResolvedValue(false);

    write('<p>Texte</p>');
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS);
    fixture.detectChanges();

    expect(element.querySelector('.autosave--error')).not.toBeNull();
  });

  function ask(question: string): void {
    const prompt = element.querySelector<HTMLTextAreaElement>('#assistant-prompt')!;
    prompt.value = question;
    prompt.dispatchEvent(new Event('input'));
    prompt.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
  }

  function messages(): string[] {
    return Array.from(element.querySelectorAll('.assistant__message')).map((item) =>
      item.textContent!.replace(/\s+/g, ' ').trim(),
    );
  }

  it('affiche l\'avertissement éthique et une zone de question, sans les actions guidées pour l\'instant', async () => {
    await setup();

    expect(element.querySelector('.assistant__warning')!.textContent).toContain(
      'createDancedTale.writing.assistant.warning',
    );
    expect(element.querySelector('#assistant-prompt')).not.toBeNull();
    expect(element.querySelector('.ai-button:not(.ai-button--wide)')).toBeNull();
  });

  it('reprend la conversation enregistrée du conte', async () => {
    await setup(
      undefined,
      of([
        { id: 'm1', conteDanseId: 't1', role: 'user', contenu: 'Une question', dateCreation: '' },
        { id: 'm2', conteDanseId: 't1', role: 'assistant', contenu: 'Une piste', dateCreation: '' },
      ]),
      't1',
    );
    fixture.detectChanges();

    expect(assistant.historique).toHaveBeenCalledWith('t1');
    expect(messages()).toEqual([
      'createDancedTale.writing.assistant.authors.user Une question',
      'createDancedTale.writing.assistant.authors.assistant Une piste',
    ]);
  });

  it('pose une question et affiche la réponse au fil de l\'eau', async () => {
    await setup(undefined, of([]), 't1');
    const stream = new Subject<string>();
    assistant.envoyer.mockReturnValue(stream);

    ask('  Des mots pour la nuit ?  ');

    expect(assistant.envoyer).toHaveBeenCalledWith('t1', 'Des mots pour la nuit ?');
    expect(element.querySelector<HTMLTextAreaElement>('#assistant-prompt')!.value).toBe('');
    expect(element.querySelector('[role="log"]')!.getAttribute('aria-busy')).toBe('true');

    stream.next('Sombre');
    fixture.detectChanges();
    expect(messages().at(-1)).toBe('Sombre');

    stream.next('Sombre, calme');
    stream.complete();
    fixture.detectChanges();

    expect(messages()).toEqual([
      'createDancedTale.writing.assistant.authors.user Des mots pour la nuit ?',
      'createDancedTale.writing.assistant.authors.assistant Sombre, calme',
    ]);
    expect(element.querySelector('[role="log"]')!.getAttribute('aria-busy')).toBe('false');
  });

  it('signale une réponse impossible et remet la question dans la zone de saisie', async () => {
    await setup(undefined, of([]), 't1');
    assistant.envoyer.mockReturnValue(throwError(() => ({ kind: 'network', status: 0, message: '' })));

    ask('Une question');

    expect(element.querySelector('#assistant-error')!.textContent).toContain('createDancedTale.writing.assistant.error');
    expect(element.querySelector<HTMLTextAreaElement>('#assistant-prompt')!.value).toBe('Une question');
    expect(messages()).toEqual([]);
  });

  it('signale un historique qui n\'a pas pu être chargé', async () => {
    await setup(undefined, throwError(() => ({ kind: 'server' })), 't1');
    fixture.detectChanges();

    expect(element.querySelector('.assistant__error')!.textContent).toContain(
      'createDancedTale.writing.assistant.historyError',
    );
  });
});
