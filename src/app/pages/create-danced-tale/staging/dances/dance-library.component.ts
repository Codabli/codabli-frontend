import { CdkDrag, CdkDragPlaceholder, CdkDropList } from '@angular/cdk/drag-drop';
import { Component, computed, inject, model, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DanceFormat, DanceIntensity } from '@models/interfaces/tale-staging.interface';
import { CreateDancedTaleDraftService } from '@core/services/create-danced-tale-draft.service';
import { normalizeText } from '../../normalize-text';
import {
  CatalogDance,
  DANCE_CATALOG,
  danceDescriptionKey,
  danceNameKey,
  discoveryDances,
} from './dance-catalog';

const FORMATS: DanceFormat[] = ['solo', 'duo', 'group'];
const INTENSITIES: DanceIntensity[] = ['gentle', 'moderate', 'intense'];

/**
 * Bibliothèque de danses (écran 8.2, SCRUM-101), filtrable. Les danses se glissent dans
 * les scènes (listes reliées par le cdkDropListGroup de l'écran) ; on ne peut rien y déposer.
 * Les ressources de danse ajoutées au projet à l'écran 2 sont proposées en tête de liste.
 *
 * TODO(SCRUM-87) : l'indicateur « Éléments de danse explorés » de la maquette porte sur la phase
 * de découverte (écran 2) ; il viendra avec cet écran et la base de ressources.
 */
@Component({
  imports: [TranslatePipe, CdkDropList, CdkDrag, CdkDragPlaceholder],
  selector: 'app-dance-library',
  styleUrl: './dance-library.component.scss',
  templateUrl: './dance-library.component.html',
})
export class DanceLibrary {
  private readonly translate = inject(TranslateService);

  /** Danses retenues à la découverte (écran 2), puis le catalogue. */
  private readonly catalog = [
    ...discoveryDances(inject(CreateDancedTaleDraftService).discovery()?.added ?? []),
    ...DANCE_CATALOG,
  ];

  /** Bibliothèque repliée : l'écran donne alors la place aux scènes. */
  readonly collapsed = model(false);

  protected readonly formats = FORMATS;
  protected readonly intensities = INTENSITIES;

  protected readonly search = signal('');
  protected readonly format = signal<DanceFormat | null>(null);
  protected readonly intensity = signal<DanceIntensity | null>(null);

  protected readonly dances = computed(() => {
    const search = normalizeText(this.search());

    return this.catalog.filter(
      (dance) =>
        (!this.format() || dance.format === this.format()) &&
        (!this.intensity() || dance.intensity === this.intensity()) &&
        (!search ||
          normalizeText(this.translate.instant(danceNameKey(dance))).includes(search) ||
          normalizeText(this.translate.instant(danceDescriptionKey(dance))).includes(search)),
    );
  });

  /** On ne dépose rien dans la bibliothèque. */
  protected readonly noEnter = () => false;

  protected setFormat(value: string): void {
    this.format.set((value || null) as DanceFormat | null);
  }

  protected setIntensity(value: string): void {
    this.intensity.set((value || null) as DanceIntensity | null);
  }

  protected readonly nameKey = danceNameKey;
  protected readonly descriptionKey = danceDescriptionKey;

  protected trackDance(dance: CatalogDance): string {
    return dance.id;
  }
}
