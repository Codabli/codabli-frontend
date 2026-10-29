/**
 * Ressources culturelles recommandées (écran 3 du parcours « Créer mon conte dansé », SCRUM-88).
 */
export interface TaleResources {
  /** Identifiants des ressources ajoutées au corpus du projet. */
  added: string[];
}

export const RESOURCE_CATEGORIES = ['places', 'characters', 'events', 'artworks', 'tales'] as const;
export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];

/** RG-CMC-05 : origine de chaque ressource, affichée par un badge obligatoire. */
export const RESOURCE_PROVENANCES = ['codabli', 'localHeritage', 'ai'] as const;
export type ResourceProvenance = (typeof RESOURCE_PROVENANCES)[number];
