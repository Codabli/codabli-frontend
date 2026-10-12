import { Component, ElementRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { Modal } from '../../../shared/components/modal/modal.component';
import { CreateDancedTaleDraftService } from '../../../core/services/create-danced-tale-draft.service';
import {
  RESOURCE_CATEGORIES,
  ResourceCategory,
  ResourceProvenance,
} from '../../../models/interfaces/tale-resources.interface';
import { CULTURAL_RESOURCE_CATALOG, CulturalResource, isNearSchool, matchedKeywords } from './resource-catalog';

/** Onglets : une catégorie, ou les ressources proches de l'école. */
export type ResourceTab = ResourceCategory | 'nearby';

const TABS: ResourceTab[] = [...RESOURCE_CATEGORIES, 'nearby'];

const PROVENANCE_ICONS: Record<ResourceProvenance, string> = {
  codabli: 'fa-star',
  localHeritage: 'fa-landmark',
  ai: 'fa-wand-magic-sparkles',
};

/**
 * Écran 3 du parcours « Créer mon conte dansé » (SCRUM-88) : ressources culturelles recommandées
 * (lieux, personnages, événements, œuvres d'art, contes) en lien avec le thème du projet.
 * Chaque ressource affiche son origine (RG-CMC-05) et explique pourquoi elle est recommandée (RG-CMC-06).
 */
@Component({
  imports: [TranslatePipe, ButtonComponent, Modal],
  selector: 'app-tale-resources',
  styleUrl: './tale-resources.component.scss',
  templateUrl: './tale-resources.component.html',
})
export class TaleResourcesComponent {
  private readonly draftService = inject(CreateDancedTaleDraftService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly tabs = TABS;
  protected readonly provenanceIcons = PROVENANCE_ICONS;

  // La garde de route garantit un contexte enregistré.
  protected readonly context = this.draftService.context();
  /** Ville et région de l'école : les ressources « près de l'école » sont dans l'une ou l'autre. */
  protected readonly place = [this.context?.city, this.context?.region].filter(Boolean).join(', ');

  /** Ressources les plus proches du thème d'abord, puis dans l'ordre du catalogue. */
  private readonly ranked = CULTURAL_RESOURCE_CATALOG.map((resource) => ({
    resource,
    matches: matchedKeywords(resource, this.context),
    nearby: isNearSchool(resource, this.context),
  })).sort((a, b) => b.matches.length - a.matches.length);

  protected readonly tab = signal<ResourceTab>('places');
  protected readonly resources = computed(() => this.resourcesOf(this.tab()));

  protected readonly added = signal<string[]>(this.draftService.resources()?.added ?? []);
  protected readonly selected = signal<CulturalResource | null>(null);
  protected readonly announcement = signal('');

  protected resourcesOf(tab: ResourceTab): CulturalResource[] {
    return this.ranked
      .filter((item) => (tab === 'nearby' ? item.nearby : item.resource.category === tab))
      .map((item) => item.resource);
  }

  protected tabId(tab: ResourceTab): string {
    return `resources-tab-${tab}`;
  }

  protected selectTab(tab: ResourceTab): void {
    this.tab.set(tab);
  }

  /** Onglets ARIA : flèches, Début et Fin déplacent le focus et affichent l'onglet. */
  protected onTabKeydown(event: KeyboardEvent): void {
    const index = TABS.indexOf(this.tab());
    const next: Record<string, number> = {
      ArrowRight: (index + 1) % TABS.length,
      ArrowLeft: (index - 1 + TABS.length) % TABS.length,
      Home: 0,
      End: TABS.length - 1,
    };

    if (!(event.key in next)) {
      return;
    }

    event.preventDefault();
    const tab = TABS[next[event.key]];
    this.tab.set(tab);
    this.host.nativeElement.querySelector<HTMLElement>(`#${this.tabId(tab)}`)?.focus();
  }

  protected isAdded(resource: CulturalResource): boolean {
    return this.added().includes(resource.id);
  }

  protected toggleAdded(resource: CulturalResource): void {
    const wasAdded = this.isAdded(resource);

    this.added.update((added) => (wasAdded ? added.filter((id) => id !== resource.id) : [...added, resource.id]));
    this.draftService.saveResources({ added: this.added() });

    this.announcement.set(
      this.translate.instant(`createDancedTale.resources.announce.${wasAdded ? 'removed' : 'added'}`, {
        title: this.text(resource, 'title'),
      }),
    );
  }

  protected matchesOf(resource: CulturalResource): string[] {
    return this.ranked.find((item) => item.resource === resource)?.matches ?? [];
  }

  protected isNearby(resource: CulturalResource): boolean {
    return !!this.ranked.find((item) => item.resource === resource)?.nearby;
  }

  protected text(resource: CulturalResource, field: 'title' | 'description' | 'reason'): string {
    return this.translate.instant(`createDancedTale.resources.catalog.${resource.id}.${field}`);
  }

  protected onPrevious(): void {
    this.router.navigate(['../discovery'], { relativeTo: this.route });
  }

  protected onNext(): void {
    this.router.navigate(['../class-resources'], { relativeTo: this.route });
  }
}
