import { Injectable, computed, signal } from '@angular/core';
import { ProjectContext } from '../../models/interfaces/project-context.interface';
import { TaleStaging } from '../../models/interfaces/tale-staging.interface';
import { TaleStructure } from '../../models/interfaces/tale-structure.interface';
import { TaleUniverse } from '../../models/interfaces/tale-universe.interface';
import { TaleWriting } from '../../models/interfaces/tale-writing.interface';

export interface CreateDancedTaleDraft {
  context: ProjectContext | null;
  universe: TaleUniverse | null;
  structure: TaleStructure | null;
  writing: TaleWriting | null;
  staging: TaleStaging | null;
}

export const CREATE_DANCED_TALE_DRAFT_KEY = 'codabli.createDancedTale.draft';

const EMPTY_DRAFT: CreateDancedTaleDraft = {
  context: null,
  universe: null,
  structure: null,
  writing: null,
  staging: null,
};

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
  readonly universe = computed(() => this.draft().universe);
  readonly structure = computed(() => this.draft().structure);
  readonly writing = computed(() => this.draft().writing);
  readonly staging = computed(() => this.draft().staging);

  saveContext(context: ProjectContext): void {
    this.draft.update((draft) => ({ ...draft, context }));
    this.persist();
  }

  /**
   * Retourne false si le brouillon n'a pas pu être écrit dans le localStorage
   * (quota dépassé à cause des images, par exemple). Il reste alors en mémoire.
   */
  saveUniverse(universe: TaleUniverse): boolean {
    this.draft.update((draft) => ({ ...draft, universe }));
    return this.persist();
  }

  saveStructure(structure: TaleStructure): boolean {
    this.draft.update((draft) => ({ ...draft, structure }));
    return this.persist();
  }

  saveWriting(writing: TaleWriting): boolean {
    this.draft.update((draft) => ({ ...draft, writing }));
    return this.persist();
  }

  saveStaging(staging: TaleStaging): boolean {
    this.draft.update((draft) => ({ ...draft, staging }));
    return this.persist();
  }

  clear(): void {
    this.draft.set(EMPTY_DRAFT);

    try {
      localStorage.removeItem(CREATE_DANCED_TALE_DRAFT_KEY);
    } catch {
      // Stockage indisponible (navigation privée...) : le brouillon reste en mémoire.
    }
  }

  private persist(): boolean {
    try {
      localStorage.setItem(CREATE_DANCED_TALE_DRAFT_KEY, JSON.stringify(this.draft()));
      return true;
    } catch {
      // Stockage indisponible ou plein : le brouillon reste en mémoire pour la session.
      return false;
    }
  }

  private restore(): CreateDancedTaleDraft {
    try {
      const stored = localStorage.getItem(CREATE_DANCED_TALE_DRAFT_KEY);

      if (stored) {
        // Les brouillons enregistrés avant les écrans 5 à 8 n'ont pas tous les champs.
        const parsed = JSON.parse(stored) as Partial<CreateDancedTaleDraft>;
        return {
          context: parsed.context ?? null,
          universe: parsed.universe ?? null,
          structure: parsed.structure ?? null,
          writing: parsed.writing ?? null,
          staging: parsed.staging ?? null,
        };
      }
    } catch {
      // Brouillon illisible ou stockage indisponible : on repart d'un brouillon vide.
    }

    return EMPTY_DRAFT;
  }
}
