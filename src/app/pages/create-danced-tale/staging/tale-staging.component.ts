import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '../../../shared/components/button/button.component';
import { CreateDancedTaleDraftService } from '../../../core/services/create-danced-tale-draft.service';
import {
  CHARACTER_ENTRANCES,
  CHARACTER_EXITS,
  CharacterEntrance,
  CharacterExit,
  SceneCharacter,
  SceneStaging,
} from '../../../models/interfaces/tale-staging.interface';
import { StoryStep } from '../../../models/interfaces/tale-structure.interface';
import { Autosave } from '../autosave/autosave';
import { AutosaveStatus } from '../autosave/autosave-status.component';

export const PROP_MAX_LENGTH = 40;
export const INTENTION_MAX_LENGTH = 400;
export const MOMENT_MAX_LENGTH = 150;

/** Un texte est rédigé s'il contient autre chose que des balises vides. */
function hasText(html: string | undefined): boolean {
  return !!html && html.replace(/<[^>]*>/g, '').trim().length > 0;
}

/**
 * Écran 8.1 — découpage en scènes (SCRUM-100) : une scène par étape de la trame (écran 6),
 * avec ses personnages, leurs entrées et sorties, l'intention théâtrale et les décors.
 */
@Component({
  imports: [RouterLink, TranslatePipe, Button, AutosaveStatus],
  selector: 'app-tale-staging',
  styleUrl: './tale-staging.component.scss',
  templateUrl: './tale-staging.component.html',
})
export class TaleStagingComponent {
  private readonly draftService = inject(CreateDancedTaleDraftService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly entrances = CHARACTER_ENTRANCES;
  protected readonly exits = CHARACTER_EXITS;
  protected readonly propMaxLength = PROP_MAX_LENGTH;
  protected readonly intentionMaxLength = INTENTION_MAX_LENGTH;
  protected readonly momentMaxLength = MOMENT_MAX_LENGTH;

  protected readonly theme = this.draftService.context()?.theme ?? '';
  // La garde de route garantit une trame avec au moins une étape.
  protected readonly steps: StoryStep[] = this.draftService.structure()?.steps ?? [];
  protected readonly characters = this.draftService.universe()?.characters ?? [];
  private readonly texts = this.draftService.writing()?.texts ?? {};

  protected readonly scenes = signal<Record<string, SceneStaging>>(this.initialScenes());

  protected readonly autosave = new Autosave(() =>
    this.draftService.saveStaging({ scenes: this.scenes() }),
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => this.autosave.flush());
  }

  protected scene(step: StoryStep): SceneStaging {
    return this.scenes()[step.id];
  }

  protected characterName(characterId: string): string {
    return this.characters.find((character) => character.id === characterId)?.name ?? '';
  }

  protected writtenText(step: StoryStep): string | null {
    const text = this.texts[step.id];
    return hasText(text) ? text : null;
  }

  protected isPresent(step: StoryStep, characterId: string): boolean {
    return this.scene(step).characters.some((character) => character.characterId === characterId);
  }

  protected toggleCharacter(step: StoryStep, characterId: string): void {
    this.updateScene(step, (scene) => ({
      ...scene,
      characters: this.isPresent(step, characterId)
        ? scene.characters.filter((character) => character.characterId !== characterId)
        : [...scene.characters, { characterId, entrance: 'onStage', exit: 'stays' }],
    }));
  }

  /** Le moment précis n'a de sens que si le personnage entre pendant la scène : sinon il est effacé. */
  protected setEntrance(step: StoryStep, characterId: string, entrance: string): void {
    this.updateCharacter(step, characterId, {
      entrance: entrance as CharacterEntrance,
      ...(entrance === 'enters' ? {} : { entranceMoment: undefined }),
    });
  }

  protected setExit(step: StoryStep, characterId: string, exit: string): void {
    this.updateCharacter(step, characterId, {
      exit: exit as CharacterExit,
      ...(exit === 'exits' ? {} : { exitMoment: undefined }),
    });
  }

  protected setEntranceMoment(step: StoryStep, characterId: string, moment: string): void {
    this.updateCharacter(step, characterId, { entranceMoment: moment });
  }

  protected setExitMoment(step: StoryStep, characterId: string, moment: string): void {
    this.updateCharacter(step, characterId, { exitMoment: moment });
  }

  protected setIntention(step: StoryStep, intention: string): void {
    this.updateScene(step, (scene) => ({ ...scene, intention }));
  }

  protected onPropKeydown(step: StoryStep, event: KeyboardEvent, input: HTMLInputElement): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addProp(step, input);
    }
  }

  /** Ajoute un décor ou accessoire, sans doublon (comparaison insensible à la casse). */
  protected addProp(step: StoryStep, input: HTMLInputElement): void {
    const prop = input.value.trim().slice(0, PROP_MAX_LENGTH);
    const props = this.scene(step).props;

    if (prop && !props.some((existing) => existing.toLowerCase() === prop.toLowerCase())) {
      this.updateScene(step, (scene) => ({ ...scene, props: [...scene.props, prop] }));
    }

    input.value = '';
    input.focus();
  }

  protected removeProp(step: StoryStep, index: number, input: HTMLInputElement): void {
    this.updateScene(step, (scene) => ({ ...scene, props: scene.props.filter((_, i) => i !== index) }));
    // Le bouton supprimé disparaît : le focus revient sur le champ d'ajout.
    input.focus();
  }

  protected onPrevious(): void {
    this.autosave.flush();
    this.router.navigate(['../writing'], { relativeTo: this.route });
  }

  private updateCharacter(step: StoryStep, characterId: string, changes: Partial<SceneCharacter>): void {
    this.updateScene(step, (scene) => ({
      ...scene,
      characters: scene.characters.map((character) =>
        character.characterId === characterId ? { ...character, ...changes } : character,
      ),
    }));
  }

  private updateScene(step: StoryStep, update: (scene: SceneStaging) => SceneStaging): void {
    this.scenes.update((scenes) => ({ ...scenes, [step.id]: update(scenes[step.id]) }));
    this.autosave.schedule();
  }

  /**
   * Reprend la mise en scène du brouillon ; une scène encore jamais mise en scène part
   * des personnages associés à l'étape dans la trame. Les personnages supprimés
   * depuis à l'écran 5 sont retirés.
   */
  private initialScenes(): Record<string, SceneStaging> {
    const saved = this.draftService.staging()?.scenes ?? {};
    const knownIds = new Set(this.characters.map((character) => character.id));

    return Object.fromEntries(
      this.steps.map((step) => {
        const scene: SceneStaging = saved[step.id] ?? {
          characters: step.characterIds.map((characterId) => ({
            characterId,
            entrance: 'onStage',
            exit: 'stays',
          })),
          intention: '',
          props: [],
        };

        return [
          step.id,
          { ...scene, characters: scene.characters.filter((character) => knownIds.has(character.characterId)) },
        ];
      }),
    );
  }
}
