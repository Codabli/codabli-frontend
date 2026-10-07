import { Injectable, computed, signal } from '@angular/core';
import { ProjectContext } from '../../models/interfaces/project-context.interface';

export interface CreateDancedTaleDraft {
  context: ProjectContext | null;
}

export const CREATE_DANCED_TALE_DRAFT_KEY = 'codabli.createDancedTale.draft';

/**
 * Brouillon du parcours « Créer mon conte dansé », partagé entre les écrans.
 *
 * L'API projet (SCRUM-96) est en pause : le brouillon est conservé dans le localStorage.
 * Le branchement sur `/api/projets-contes` est prêt sur la branche wip/SCRUM-84-branchement-api.
 */
@Injectable({ providedIn: 'root' })
export class CreateDancedTaleDraftService {
  private readonly draft = signal<CreateDancedTaleDraft>(this.restore());

  readonly context = computed(() => this.draft().context);

  saveContext(context: ProjectContext): void {
    this.draft.update((draft) => ({ ...draft, context }));
    this.persist();
  }

  clear(): void {
    this.draft.set({ context: null });

    try {
      localStorage.removeItem(CREATE_DANCED_TALE_DRAFT_KEY);
    } catch {
      // Stockage indisponible (navigation privée...) : le brouillon reste en mémoire.
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(CREATE_DANCED_TALE_DRAFT_KEY, JSON.stringify(this.draft()));
    } catch {
      // Stockage indisponible : le brouillon reste en mémoire pour la session.
    }
  }

  private restore(): CreateDancedTaleDraft {
    try {
      const stored = localStorage.getItem(CREATE_DANCED_TALE_DRAFT_KEY);

      if (stored) {
        const parsed = JSON.parse(stored) as Partial<CreateDancedTaleDraft>;
        return { context: parsed.context ?? null };
      }
    } catch {
      // Brouillon illisible ou stockage indisponible : on repart d'un brouillon vide.
    }

    return { context: null };
  }
}
