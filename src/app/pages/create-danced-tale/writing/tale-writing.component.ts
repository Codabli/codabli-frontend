import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '@shared/components/button/button.component';
import { RichTextEditor } from '@shared/components/rich-text-editor/rich-text-editor.component';
import { AssistantIaService } from '@core/services/assistant-ia.service';
import { CreateDancedTaleDraftService } from '@core/services/create-danced-tale-draft.service';
import { ApiError } from '@models/interfaces/api-error.interface';
import { MessageIa } from '@models/interfaces/assistant-ia.interface';
import { StoryStep } from '@models/interfaces/tale-structure.interface';
import { Autosave } from '../autosave/autosave';
import { AutosaveStatus } from '../autosave/autosave-status.component';
import { Subscription } from 'rxjs';

export const TALE_TITLE_MAX_LENGTH = 100;
export const ASSISTANT_PROMPT_MAX_LENGTH = 2000;

/** Message affiché dans la conversation avec l'assistant. */
type AssistantMessage = Pick<MessageIa, 'role' | 'contenu'>;

/** Une étape est rédigée si son texte contient autre chose que des balises vides. */
function hasText(html: string | undefined): boolean {
  return !!html && html.replace(/<[^>]*>/g, '').trim().length > 0;
}

@Component({
  imports: [ReactiveFormsModule, TranslatePipe, ButtonComponent, RichTextEditor, AutosaveStatus],
  selector: 'app-tale-writing',
  styleUrl: './tale-writing.component.scss',
  templateUrl: './tale-writing.component.html',
})
export class TaleWritingComponent {
  private readonly draftService = inject(CreateDancedTaleDraftService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly assistant = inject(AssistantIaService);

  protected readonly titleMaxLength = TALE_TITLE_MAX_LENGTH;
  protected readonly promptMaxLength = ASSISTANT_PROMPT_MAX_LENGTH;

  protected readonly theme = this.draftService.context()?.theme ?? '';
  // La garde de route garantit une trame avec au moins une étape.
  protected readonly steps: StoryStep[] = this.draftService.structure()?.steps ?? [];
  private readonly characterNames = new Map(
    (this.draftService.universe()?.characters ?? []).map((character) => [character.id, character.name]),
  );

  protected readonly title = new FormControl(this.draftService.writing()?.title ?? '', { nonNullable: true });
  protected readonly texts = signal<Record<string, string>>({ ...this.draftService.writing()?.texts });
  protected readonly currentIndex = signal(0);
  protected readonly currentStep = computed(() => this.steps[this.currentIndex()]);

  // RG-CMC-12 : sauvegarde automatique pendant l'écriture.
  protected readonly autosave = new Autosave(() =>
    this.draftService.saveWriting({ title: this.title.value.trim(), texts: this.texts() }),
  );

  // Assistant pédagogique (SCRUM-131) : conversation gardée par le back pour ce conte.
  protected readonly prompt = new FormControl('', { nonNullable: true });
  protected readonly messages = signal<AssistantMessage[]>([]);
  /** Réponse en cours de réception, null hors envoi. */
  protected readonly answer = signal<string | null>(null);
  protected readonly assistantError = signal<ApiError | null>(null);
  protected readonly historyError = signal(false);
  private sending: Subscription | null = null;

  constructor() {
    this.title.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.autosave.schedule());

    const taleId = this.draftService.taleId();

    if (taleId) {
      this.assistant
        .historique(taleId)
        .pipe(takeUntilDestroyed())
        .subscribe({
          next: (messages) => this.messages.set(messages.filter((message) => message.role !== 'system')),
          error: () => this.historyError.set(true),
        });
    }

    // Une saisie en attente n'est jamais perdue, même si on quitte l'écran par le menu.
    inject(DestroyRef).onDestroy(() => {
      this.autosave.flush();
      this.sending?.unsubscribe();
    });
  }

  protected askAssistant(): void {
    const taleId = this.draftService.taleId();
    const contenu = this.prompt.value.trim();

    if (!taleId || !contenu || this.answer() !== null) {
      return;
    }

    this.messages.update((messages) => [...messages, { role: 'user', contenu }]);
    this.prompt.setValue('');
    this.assistantError.set(null);
    this.answer.set('');

    let received = '';
    this.sending = this.assistant.envoyer(taleId, contenu).subscribe({
      next: (text) => {
        received = text;
        this.answer.set(text);
      },
      complete: () => {
        if (received.trim()) {
          this.messages.update((messages) => [...messages, { role: 'assistant', contenu: received }]);
          this.answer.set(null);
        } else {
          this.failAssistant(contenu, null);
        }
      },
      error: (error: ApiError) => this.failAssistant(contenu, error),
    });
  }

  /** Entrée envoie la question, Maj + Entrée passe à la ligne. */
  protected onPromptKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      this.askAssistant();
    }
  }

  /** La question non traitée revient dans la zone de saisie, pour la renvoyer telle quelle. */
  private failAssistant(contenu: string, error: ApiError | null): void {
    this.messages.update((messages) => messages.slice(0, -1));
    this.answer.set(null);
    this.assistantError.set(error ?? { kind: 'unknown', status: 0, message: '' });

    if (!this.prompt.value) {
      this.prompt.setValue(contenu);
    }
  }

  protected isWritten(step: StoryStep): boolean {
    return hasText(this.texts()[step.id]);
  }

  protected characterNamesOf(step: StoryStep): string[] {
    return (step.characterIds ?? [])
      .map((id) => this.characterNames.get(id))
      .filter((name): name is string => !!name);
  }

  protected selectStep(index: number): void {
    this.currentIndex.set(index);
  }

  protected onTextChange(stepId: string, html: string): void {
    this.texts.update((texts) => ({ ...texts, [stepId]: html }));
    this.autosave.schedule();
  }

  protected onPrevious(): void {
    this.autosave.flush();
    this.router.navigate(['../structure'], { relativeTo: this.route });
  }

  protected onNext(): void {
    this.autosave.flush();
    this.router.navigate(['../staging'], { relativeTo: this.route });
  }
}
