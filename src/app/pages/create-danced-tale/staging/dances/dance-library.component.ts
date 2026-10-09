import { CdkDrag, CdkDragPlaceholder, CdkDropList } from '@angular/cdk/drag-drop';
import { Component, computed, inject, model, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DanceFormat, DanceIntensity } from '../../../../models/interfaces/tale-staging.interface';
import { CatalogDance, DANCE_CATALOG } from './dance-catalog';

const FORMATS: DanceFormat[] = ['solo', 'duo', 'group'];
const INTENSITIES: DanceIntensity[] = ['gentle', 'moderate', 'intense'];

/**
 * Bibliothèque de danses (écran 8.2, SCRUM-101), filtrable. Les danses se glissent dans
 * les scènes (listes reliées par le cdkDropListGroup de l'écran) ; on ne peut rien y déposer.
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

  /** Bibliothèque repliée : l'écran donne alors la place aux scènes. */
  readonly collapsed = model(false);

  protected readonly formats = FORMATS;
  protected readonly intensities = INTENSITIES;

  protected readonly search = signal('');
  protected readonly format = signal<DanceFormat | null>(null);
  protected readonly intensity = signal<DanceIntensity | null>(null);

  protected readonly dances = computed(() => {
    const search = normalize(this.search());

    return DANCE_CATALOG.filter(
      (dance) =>
        (!this.format() || dance.format === this.format()) &&
        (!this.intensity() || dance.intensity === this.intensity()) &&
        (!search ||
          normalize(this.translate.instant(`createDancedTale.dances.catalog.${dance.id}.name`)).includes(search) ||
          normalize(this.translate.instant(`createDancedTale.dances.catalog.${dance.id}.description`)).includes(search)),
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

  protected trackDance(dance: CatalogDance): string {
    return dance.id;
  }
}

/** Recherche insensible à la casse et aux accents. */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}
