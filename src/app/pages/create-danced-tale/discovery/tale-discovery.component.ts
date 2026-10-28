import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonComponent } from '@shared/components/button/button.component';
import { Modal } from '@shared/components/modal/modal.component';
import { CreateDancedTaleDraftService } from '@core/services/create-danced-tale-draft.service';
import { LanguageService } from '@core/services/language.service';
import {
  DISCOVERY_DISCIPLINES,
  DISCOVERY_FORMATS,
  DiscoveryDiscipline,
  DiscoveryFormat,
  DiscoveryList,
  TaleDiscovery,
} from '@models/interfaces/tale-discovery.interface';
import { normalizeText } from '../normalize-text';
import {
  DISCOVERY_CATALOG,
  DURATION_RANGES,
  DiscoveryResource,
  DurationRange,
  durationRangeOf,
} from './discovery-catalog';

const EMPTY_DISCOVERY: TaleDiscovery = { added: [], done: [], favorites: [] };

/** Icône de la vignette quand la ressource n'a pas d'image (audio, PDF). */
const FORMAT_ICONS: Record<DiscoveryFormat, string> = {
  video: 'fa-film',
  audio: 'fa-headphones',
  pdf: 'fa-file-pdf',
  image: 'fa-image',
};

const DISCIPLINE_ICONS: Record<DiscoveryDiscipline, string> = {
  dance: 'fa-person-running',
  theatre: 'fa-masks-theater',
  music: 'fa-music',
  scenography: 'fa-panorama',
};

/**
 * Écran 2 du parcours « Créer mon conte dansé » (SCRUM-87) : découverte artistique.
 * Ressources d'initiation (danse, théâtre, musique, scénographie) adaptées à la tranche d'âge
 * de l'écran 1 (RG-CMC-03), à ajouter au projet, marquer comme réalisées ou en favoris (RG-CMC-04).
 */
@Component({
  imports: [TranslatePipe, ButtonComponent, Modal],
  selector: 'app-tale-discovery',
  styleUrl: './tale-discovery.component.scss',
  templateUrl: './tale-discovery.component.html',
})
export class TaleDiscoveryComponent {
  private readonly draftService = inject(CreateDancedTaleDraftService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly disciplines = DISCOVERY_DISCIPLINES;
  protected readonly formats = DISCOVERY_FORMATS;
  protected readonly durations = DURATION_RANGES;
  protected readonly formatIcons = FORMAT_ICONS;
  protected readonly disciplineIcons = DISCIPLINE_ICONS;
  protected readonly benefitKeys = ['emotions', 'group', 'imagination'];

  // La garde de route garantit un contexte enregistré.
  protected readonly ageRange = this.draftService.context()?.ageRange;

  /** RG-CMC-03 : seules les ressources de la tranche d'âge choisie à l'étape 1 sont proposées. */
  private readonly ageResources = DISCOVERY_CATALOG.filter(
    (resource) => !!this.ageRange && resource.ageRanges.includes(this.ageRange),
  );

  protected readonly discipline = signal<DiscoveryDiscipline | null>(null);
  protected readonly format = signal<DiscoveryFormat | null>(null);
  protected readonly duration = signal<DurationRange | null>(null);
  protected readonly search = signal('');

  protected readonly resources = computed(() => {
    const search = normalizeText(this.search());

    return this.ageResources.filter(
      (resource) =>
        (!this.discipline() || resource.discipline === this.discipline()) &&
        (!this.format() || resource.format === this.format()) &&
        (!this.duration() || durationRangeOf(resource.durationMinutes) === this.duration()) &&
        (!search ||
          normalizeText(this.text(resource, 'title')).includes(search) ||
          normalizeText(this.text(resource, 'description')).includes(search)),
    );
  });

  protected readonly state = signal<TaleDiscovery>({ ...EMPTY_DISCOVERY, ...this.draftService.discovery() });
  protected readonly selected = signal<DiscoveryResource | null>(null);
  protected readonly announcement = signal('');

  protected readonly addedCount = computed(
    () => this.state().added.filter((id) => this.ageResources.some((resource) => resource.id === id)).length,
  );

  /** Langue des sous-titres affichés par défaut : celle de l'interface. */
  protected readonly language = inject(LanguageService).currentLanguage;

  protected countOf(discipline: DiscoveryDiscipline | null): number {
    return discipline
      ? this.ageResources.filter((resource) => resource.discipline === discipline).length
      : this.ageResources.length;
  }

  protected setFormat(value: string): void {
    this.format.set((value || null) as DiscoveryFormat | null);
  }

  protected setDuration(value: string): void {
    this.duration.set((value || null) as DurationRange | null);
  }

  protected resetFilters(): void {
    this.discipline.set(null);
    this.format.set(null);
    this.duration.set(null);
    this.search.set('');
  }

  protected isIn(list: DiscoveryList, resource: DiscoveryResource): boolean {
    return this.state()[list].includes(resource.id);
  }

  /** Ajoute la ressource à la liste (projet, réalisées, favoris) ou l'en retire. */
  protected toggle(list: DiscoveryList, resource: DiscoveryResource): void {
    const wasIn = this.isIn(list, resource);

    this.state.update((state) => ({
      ...state,
      [list]: wasIn ? state[list].filter((id) => id !== resource.id) : [...state[list], resource.id],
    }));
    this.draftService.saveDiscovery(this.state());

    this.announcement.set(
      this.translate.instant(`createDancedTale.discovery.announce.${list}.${wasIn ? 'off' : 'on'}`, {
        title: this.text(resource, 'title'),
      }),
    );
  }

  protected text(resource: DiscoveryResource, field: 'title' | 'description' | 'activity'): string {
    return this.translate.instant(`createDancedTale.discovery.catalog.${resource.id}.${field}`);
  }

  protected onPrevious(): void {
    this.router.navigate(['../context'], { relativeTo: this.route });
  }

  protected onNext(): void {
    this.router.navigate(['../resources'], { relativeTo: this.route });
  }
}
