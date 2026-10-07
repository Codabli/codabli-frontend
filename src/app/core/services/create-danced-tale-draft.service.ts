import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { ProjetConteService } from './projet-conte.service';
import { ProjectContext } from '../../models/interfaces/project-context.interface';
import type { ProjetConte, ProjetConteRequest } from '../../models/interfaces/projet-conte.interface';

export interface CreateDancedTaleDraft {
  projectId: string | null;
  context: ProjectContext | null;
}

export const CREATE_DANCED_TALE_DRAFT_KEY = 'codabli.createDancedTale.draft';

const EMPTY_DRAFT: CreateDancedTaleDraft = { projectId: null, context: null };

/**
 * Projet en cours du parcours « Créer mon conte dansé », partagé entre les écrans.
 *
 * Le projet est enregistré côté backend (`/api/projets-contes`). Le localStorage ne sert
 * que de cache : il retient l'id du projet en cours pour le mettre à jour au lieu d'en
 * recréer un quand l'enseignant revient sur un écran.
 */
@Injectable({ providedIn: 'root' })
export class CreateDancedTaleDraftService {
  private readonly projetConteService = inject(ProjetConteService);

  private readonly draft = signal<CreateDancedTaleDraft>(this.restore());

  readonly projectId = computed(() => this.draft().projectId);
  readonly context = computed(() => this.draft().context);

  /** Crée le projet au premier passage, puis met à jour son contexte. */
  saveContext(context: ProjectContext): Observable<void> {
    const projectId = this.draft().projectId;
    const request = toRequest(context);
    const save$ = projectId
      ? this.projetConteService.modifierContexte(projectId, request)
      : this.projetConteService.creer(request);

    return save$.pipe(
      tap((projet) => {
        this.draft.set({ projectId: projet.id, context: toProjectContext(projet) });
        this.persist();
      }),
      map(() => undefined),
    );
  }

  clear(): void {
    this.draft.set(EMPTY_DRAFT);

    try {
      localStorage.removeItem(CREATE_DANCED_TALE_DRAFT_KEY);
    } catch {
      // Stockage indisponible (navigation privée...) : rien à effacer.
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(CREATE_DANCED_TALE_DRAFT_KEY, JSON.stringify(this.draft()));
    } catch {
      // Stockage indisponible : le projet reste connu pour la session en cours.
    }
  }

  private restore(): CreateDancedTaleDraft {
    try {
      const stored = localStorage.getItem(CREATE_DANCED_TALE_DRAFT_KEY);

      if (stored) {
        const parsed = JSON.parse(stored) as Partial<CreateDancedTaleDraft>;
        return { projectId: parsed.projectId ?? null, context: parsed.context ?? null };
      }
    } catch {
      // Cache illisible ou stockage indisponible : on repart d'un projet vide.
    }

    return EMPTY_DRAFT;
  }
}

function toRequest(context: ProjectContext): ProjetConteRequest {
  return {
    trancheAge: context.ageRange,
    pays: context.country,
    region: context.region,
    ville: context.city || null,
    theme: context.theme,
    ingredientsSecrets: context.secretIngredients,
    espaceRepresentation: context.performanceSpace,
  };
}

function toProjectContext(projet: ProjetConte): ProjectContext {
  return {
    ageRange: projet.trancheAge,
    country: projet.pays,
    region: projet.region,
    city: projet.ville ?? '',
    theme: projet.theme,
    secretIngredients: projet.ingredientsSecrets,
    performanceSpace: projet.espaceRepresentation,
  };
}
