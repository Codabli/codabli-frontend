import { FormArray, FormControl, FormGroup } from '@angular/forms';
import {
  StoryStep,
  StoryStepKind,
  TaleStructure,
} from '../../../models/interfaces/tale-structure.interface';
import { requiredText } from '../context/project-context.form';
import { newId } from '../new-id';

export const STEP_TITLE_MAX_LENGTH = 60;
export const STEP_SUMMARY_MAX_LENGTH = 400;

export class StoryStepForm extends FormGroup<{
  id: FormControl<string>;
  kind: FormControl<StoryStepKind | null>;
  title: FormControl<string>;
  summary: FormControl<string>;
  characterIds: FormControl<string[]>;
}> {
  constructor(step?: Partial<StoryStep>) {
    super({
      id: new FormControl(step?.id ?? newId(), { nonNullable: true }),
      kind: new FormControl<StoryStepKind | null>(step?.kind ?? null),
      title: new FormControl(step?.title ?? '', { nonNullable: true, validators: requiredText }),
      summary: new FormControl(step?.summary ?? '', { nonNullable: true }),
      characterIds: new FormControl<string[]>(step?.characterIds ?? [], { nonNullable: true }),
    });
  }

  /** Les étapes proposées par défaut sont essentielles au récit. */
  get isEssential(): boolean {
    return this.controls.kind.value !== null;
  }

  /** Étape essentielle sans résumé : signalée par une alerte (non bloquante). */
  get isEmptyEssential(): boolean {
    return this.isEssential && !this.controls.summary.value.trim();
  }

  hasCharacter(characterId: string): boolean {
    return this.controls.characterIds.value.includes(characterId);
  }

  toggleCharacter(characterId: string): void {
    const ids = this.controls.characterIds.value;

    this.controls.characterIds.setValue(
      ids.includes(characterId) ? ids.filter((id) => id !== characterId) : [...ids, characterId],
    );
    this.controls.characterIds.markAsDirty();
  }

  toStoryStep(): StoryStep {
    const value = this.getRawValue();

    return {
      id: value.id,
      kind: value.kind,
      title: value.title.trim(),
      summary: value.summary.trim(),
      characterIds: value.characterIds,
    };
  }
}

export class TaleStructureForm extends FormGroup<{ steps: FormArray<StoryStepForm> }> {
  constructor() {
    super({ steps: new FormArray<StoryStepForm>([]) });
  }

  get steps(): StoryStepForm[] {
    return this.controls.steps.controls;
  }

  /** Structure par défaut (RG-CMC-09), avec les titres déjà traduits. */
  fromDefaults(kinds: StoryStepKind[], titles: Record<string, string>): void {
    this.controls.steps.clear();
    kinds.forEach((kind) => this.controls.steps.push(new StoryStepForm({ kind, title: titles[kind] })));
  }

  /** Les personnages supprimés depuis à l'écran 5 sont retirés des étapes. */
  fromTaleStructure(structure: TaleStructure, knownCharacterIds: string[]): void {
    this.controls.steps.clear();
    structure.steps.forEach((step) =>
      this.controls.steps.push(
        new StoryStepForm({
          ...step,
          characterIds: step.characterIds.filter((id) => knownCharacterIds.includes(id)),
        }),
      ),
    );
  }

  addStep(): StoryStepForm {
    const step = new StoryStepForm();
    this.controls.steps.push(step);
    return step;
  }

  /** Il reste toujours au moins une étape. */
  removeStep(index: number): void {
    if (this.steps.length > 1) {
      this.controls.steps.removeAt(index);
    }
  }

  /** RG-CMC-10 : réordonnancement (glisser-déposer ou boutons monter / descendre). */
  moveStep(from: number, to: number): void {
    const steps = this.controls.steps;

    if (from === to || to < 0 || to >= steps.length) {
      return;
    }

    const step = steps.at(from);
    steps.removeAt(from, { emitEvent: false });
    steps.insert(to, step);
    steps.markAsDirty();
  }

  emptyEssentialSteps(): StoryStepForm[] {
    return this.steps.filter((step) => step.isEmptyEssential);
  }

  toTaleStructure(): TaleStructure {
    return { steps: this.steps.map((step) => step.toStoryStep()) };
  }
}
