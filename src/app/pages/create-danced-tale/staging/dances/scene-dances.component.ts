import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Button } from '../../../../shared/components/button/button.component';
import {
  DANCE_MOMENTS,
  DANCE_STYLES,
  DanceMoment,
  DanceStyle,
  SceneDance,
} from '../../../../models/interfaces/tale-staging.interface';
import { newId } from '../../new-id';
import { SceneSounds } from '../sounds/scene-sounds.component';
import { SceneStage, StageElement } from '../stage/scene-stage.component';
import { CatalogDance, DANCE_CATALOG, findCatalogDance, isCatalogDance } from './dance-catalog';

export const DANCE_NAME_MAX_LENGTH = 60;

/**
 * Danses d'une scène (écrans 8.2 à 8.4), composées comme la maquette : chaque danse est un
 * module (moment du passage, typologie, espace scénique, ambiance musicale) qu'on ouvre pour
 * le régler, puis qu'on valide pour le replier en une ligne de résumé.
 * Dépôt depuis la bibliothèque, ajout sans glisser-déposer, réordonnancement dans la scène.
 */
@Component({
  imports: [TranslatePipe, Button, CdkDropList, CdkDrag, CdkDragHandle, SceneStage, SceneSounds],
  selector: 'app-scene-dances',
  styleUrl: './scene-dances.component.scss',
  templateUrl: './scene-dances.component.html',
})
export class SceneDances {
  private readonly translate = inject(TranslateService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly addPanel = viewChild<ElementRef<HTMLDetailsElement>>('addPanel');

  /** Identifiant de la scène, pour des identifiants de champs uniques. */
  readonly sceneId = input.required<string>();
  readonly sceneNumber = input.required<number>();
  readonly dances = input<SceneDance[]>([]);
  /** Personnages présents et décors de la scène, à placer sur le plateau de chaque danse. */
  readonly stageElements = input<StageElement[]>([]);

  readonly dancesChange = output<SceneDance[]>();

  protected readonly catalog = DANCE_CATALOG;
  protected readonly moments = DANCE_MOMENTS;
  protected readonly styles = DANCE_STYLES;
  protected readonly nameMaxLength = DANCE_NAME_MAX_LENGTH;

  protected readonly selectedDanceId = signal('');
  /** Danse dont le module est ouvert ; les autres sont repliées en une ligne. */
  protected readonly openId = signal<string | null>(null);
  /** Message lu par les lecteurs d'écran après un ajout ou une suppression. */
  protected readonly announcement = signal('');

  /** État de la danse à l'ouverture du module, rétabli par « Annuler ». */
  private snapshot: SceneDance | null = null;

  /** Une scène accepte les danses de la bibliothèque, et les siennes (réordonnancement). */
  protected readonly canEnter = (drag: CdkDrag, drop: CdkDropList): boolean =>
    isCatalogDance(drag.data) || drag.dropContainer === drop;

  protected fieldId(dance: SceneDance, field: string): string {
    return `dance-${dance.id}-${field}`;
  }

  /** Résumé d'une danse repliée : moment du passage (s'il est choisi) et musiques. */
  protected summary(dance: SceneDance): string {
    const music = dance.sounds?.length
      ? dance.sounds.map((sound) => sound.title).join(', ')
      : this.translate.instant('createDancedTale.dances.scene.noMusic');
    if (!dance.moment) {
      return music;
    }
    return `${this.translate.instant(`createDancedTale.dances.moments.${dance.moment}`)} · ${music}`;
  }

  protected onDrop(event: CdkDragDrop<SceneDance[]>): void {
    if (event.previousContainer === event.container) {
      const dances = [...this.dances()];
      moveItemInArray(dances, event.previousIndex, event.currentIndex);
      this.dancesChange.emit(dances);
      return;
    }

    if (isCatalogDance(event.item.data)) {
      this.add(event.item.data, event.currentIndex);
    }
  }

  /** Alternative au glisser-déposer, au clavier et au tactile. */
  protected addSelected(): void {
    const dance = findCatalogDance(this.selectedDanceId());

    if (dance) {
      this.add(dance, this.dances().length);
      this.selectedDanceId.set('');
    }
  }

  protected open(dance: SceneDance): void {
    this.snapshot = structuredClone(dance);
    this.openId.set(dance.id);
    this.focus(`#${this.fieldId(dance, 'name')}`);
  }

  /** « Valider ce module » : les réglages sont déjà enregistrés, le module se replie. */
  protected validate(dance: SceneDance): void {
    this.close(dance);
  }

  /** « Annuler » : rétablit la danse telle qu'à l'ouverture du module. */
  protected cancel(dance: SceneDance): void {
    const snapshot = this.snapshot;

    if (snapshot) {
      this.dancesChange.emit(this.dances().map((d) => (d.id === dance.id ? snapshot : d)));
    }

    this.close(dance);
  }

  protected remove(index: number): void {
    const removed = this.dances()[index];
    this.dancesChange.emit(this.dances().filter((_, i) => i !== index));
    this.announce('createDancedTale.dances.scene.announce.removed', { name: removed.name });

    if (this.openId() === removed.id) {
      this.openId.set(null);
      this.snapshot = null;
    }

    // Le bouton supprimé disparaît : le focus revient sur la liste d'ajout si elle est dépliée,
    // sinon sur le titre du bloc d'ajout.
    this.focus(
      this.addPanel()?.nativeElement.open
        ? `#scene-${this.sceneId()}-add-dance`
        : `#scene-${this.sceneId()}-add-summary`,
    );
  }

  protected setName(index: number, name: string): void {
    this.update(index, { name });
  }

  /** Choisit le moment, ou le retire s'il était déjà choisi (la danse dure alors toute la scène). */
  protected toggleMoment(index: number, dance: SceneDance, moment: DanceMoment): void {
    this.update(index, { moment: dance.moment === moment ? null : moment });
  }

  protected setStyle(index: number, style: string): void {
    this.update(index, { style: style as DanceStyle });
  }

  protected update(index: number, changes: Partial<SceneDance>): void {
    this.dancesChange.emit(this.dances().map((dance, i) => (i === index ? { ...dance, ...changes } : dance)));
  }

  private add(catalogDance: CatalogDance, index: number): void {
    const name = this.translate.instant(`createDancedTale.dances.catalog.${catalogDance.id}.name`);
    const dance: SceneDance = {
      id: newId(),
      danceId: catalogDance.id,
      name,
      moment: null,
      style: catalogDance.style,
    };

    const dances = [...this.dances()];
    dances.splice(index, 0, dance);
    this.dancesChange.emit(dances);
    this.announce('createDancedTale.dances.scene.announce.added', { name, scene: this.sceneNumber() });
    // Une danse ajoutée s'ouvre directement, pour la régler.
    this.open(dance);
  }

  private close(dance: SceneDance): void {
    this.openId.set(null);
    this.snapshot = null;
    this.focus(`#${this.fieldId(dance, 'edit')}`);
  }

  private announce(key: string, params: Record<string, unknown>): void {
    this.announcement.set(this.translate.instant(key, params));
  }

  private focus(selector: string): void {
    // Après le rendu (module ouvert ou replié).
    setTimeout(() => this.host.nativeElement.querySelector<HTMLElement>(selector)?.focus());
  }
}
