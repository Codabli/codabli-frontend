import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Button } from '../../../shared/components/button/button.component';
import { RichTextEditor } from '../../../shared/components/rich-text-editor/rich-text-editor.component';
import { CreateDancedTaleDraftService } from '../../../core/services/create-danced-tale-draft.service';
import { StoryStep } from '../../../models/interfaces/tale-structure.interface';

/** Délai sans frappe avant la sauvegarde automatique (RG-CMC-12). */
export const AUTOSAVE_DELAY_MS = 1000;
export const TALE_TITLE_MAX_LENGTH = 100;

// Actions guidées de l'assistant pédagogique (SCRUM-94), pas encore branchées.
const ASSISTANT_ACTION_KEYS = ['vocabulary', 'checkSentence', 'askQuestion', 'dialogueIdeas'] as const;

type SaveStatus = 'idle' | 'saved' | 'error';

/** Une étape est rédigée si son texte contient autre chose que des balises vides. */
function hasText(html: string | undefined): boolean {
  return !!html && html.replace(/<[^>]*>/g, '').trim().length > 0;
}

@Component({
  imports: [ReactiveFormsModule, TranslatePipe, Button, RichTextEditor],
  selector: 'app-tale-writing',
  styleUrl: './tale-writing.component.scss',
  templateUrl: './tale-writing.component.html',
})
export class TaleWritingComponent {
  private readonly draftService = inject(CreateDancedTaleDraftService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly assistantActionKeys = ASSISTANT_ACTION_KEYS;
  protected readonly titleMaxLength = TALE_TITLE_MAX_LENGTH;

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

  protected readonly saveStatus = signal<SaveStatus>('idle');
  protected readonly savedAt = signal<Date | null>(null);
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.title.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.scheduleSave());

    // Une saisie en attente n'est jamais perdue, même si on quitte l'écran par le menu.
    inject(DestroyRef).onDestroy(() => this.flushSave());
  }

  protected isWritten(step: StoryStep): boolean {
    return hasText(this.texts()[step.id]);
  }

  protected characterNamesOf(step: StoryStep): string[] {
    return step.characterIds
      .map((id) => this.characterNames.get(id))
      .filter((name): name is string => !!name);
  }

  protected selectStep(index: number): void {
    this.currentIndex.set(index);
  }

  protected onTextChange(stepId: string, html: string): void {
    this.texts.update((texts) => ({ ...texts, [stepId]: html }));
    this.scheduleSave();
  }

  /** Heure de la dernière sauvegarde, au format de la langue (« 14h32 » en français). */
  protected savedAtLabel(): string {
    const date = this.savedAt();

    if (!date) {
      return '';
    }

    return this.translate.instant('createDancedTale.writing.autosave.saved', {
      hours: String(date.getHours()).padStart(2, '0'),
      minutes: String(date.getMinutes()).padStart(2, '0'),
    });
  }

  protected onPrevious(): void {
    this.flushSave();
    this.router.navigate(['../structure'], { relativeTo: this.route });
  }

  protected onNext(): void {
    this.flushSave();
    this.router.navigate(['../staging'], { relativeTo: this.route });
  }

  private scheduleSave(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    this.saveTimer = setTimeout(() => this.save(), AUTOSAVE_DELAY_MS);
  }

  private flushSave(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.save();
    }
  }

  private save(): void {
    this.saveTimer = null;

    const saved = this.draftService.saveWriting({
      title: this.title.value.trim(),
      texts: this.texts(),
    });

    this.saveStatus.set(saved ? 'saved' : 'error');
    if (saved) {
      this.savedAt.set(new Date());
    }
  }
}
