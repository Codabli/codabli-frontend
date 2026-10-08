import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, inject, input, output, signal } from '@angular/core';
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
import { CatalogDance, DANCE_CATALOG, findCatalogDance, isCatalogDance } from './dance-catalog';

export const DANCE_NAME_MAX_LENGTH = 60;

/**
 * Danses d'une scène (écran 8.2, SCRUM-101) : dépôt depuis la bibliothèque, ajout au clavier,
 * réordonnancement dans la scène et réglages de chaque danse (nom, moment, style).
 */
@Component({
  imports: [TranslatePipe, Button, CdkDropList, CdkDrag, CdkDragHandle],
  selector: 'app-scene-dances',
  styleUrl: './scene-dances.component.scss',
  templateUrl: './scene-dances.component.html',
})
export class SceneDances {
  private readonly translate = inject(TranslateService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Identifiant de la scène, pour des identifiants de champs uniques. */
  readonly sceneId = input.required<string>();
  readonly sceneNumber = input.required<number>();
  readonly dances = input<SceneDance[]>([]);

  readonly dancesChange = output<SceneDance[]>();

  protected readonly catalog = DANCE_CATALOG;
  protected readonly moments = DANCE_MOMENTS;
  protected readonly styles = DANCE_STYLES;
  protected readonly nameMaxLength = DANCE_NAME_MAX_LENGTH;

  protected readonly selectedDanceId = signal('');
  /** Message lu par les lecteurs d'écran après un ajout ou une suppression. */
  protected readonly announcement = signal('');

  /** Une scène accepte les danses de la bibliothèque, et les siennes (réordonnancement). */
  protected readonly canEnter = (drag: CdkDrag, drop: CdkDropList): boolean =>
    isCatalogDance(drag.data) || drag.dropContainer === drop;

  protected fieldId(dance: SceneDance, field: string): string {
    return `dance-${dance.id}-${field}`;
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

  protected remove(index: number): void {
    const removed = this.dances()[index];
    this.dancesChange.emit(this.dances().filter((_, i) => i !== index));
    this.announce('createDancedTale.dances.scene.announce.removed', { name: removed.name });

    // Le bouton supprimé disparaît : le focus revient sur la liste d'ajout.
    this.focus(`#scene-${this.sceneId()}-add-dance`);
  }

  protected setName(index: number, name: string): void {
    this.update(index, { name });
  }

  protected setMoment(index: number, moment: DanceMoment): void {
    this.update(index, { moment });
  }

  protected setStyle(index: number, style: string): void {
    this.update(index, { style: style as DanceStyle });
  }

  private add(catalogDance: CatalogDance, index: number): void {
    const name = this.translate.instant(`createDancedTale.dances.catalog.${catalogDance.id}.name`);
    const dance: SceneDance = {
      id: newId(),
      danceId: catalogDance.id,
      name,
      moment: 'beginning',
      style: catalogDance.style,
    };

    const dances = [...this.dances()];
    dances.splice(index, 0, dance);
    this.dancesChange.emit(dances);
    this.announce('createDancedTale.dances.scene.announce.added', { name, scene: this.sceneNumber() });
    this.focus(`#${this.fieldId(dance, 'name')}`);
  }

  private update(index: number, changes: Partial<SceneDance>): void {
    this.dancesChange.emit(this.dances().map((dance, i) => (i === index ? { ...dance, ...changes } : dance)));
  }

  private announce(key: string, params: Record<string, unknown>): void {
    this.announcement.set(this.translate.instant(key, params));
  }

  private focus(selector: string): void {
    // Après le rendu de la nouvelle danse.
    setTimeout(() => this.host.nativeElement.querySelector<HTMLElement>(selector)?.focus());
  }
}
