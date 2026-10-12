/**
 * Découverte artistique (écran 2 du parcours « Créer mon conte dansé », SCRUM-87).
 * Identifiants des ressources du catalogue, par usage.
 */
export interface TaleDiscovery {
  /** Ressources conservées pour le projet (« Ajouter au projet »). */
  added: string[];
  /** RG-CMC-04 : ressources marquées « Réalisée »... */
  done: string[];
  /** ... ou « Ajoutée aux favoris ». */
  favorites: string[];
}

export type DiscoveryList = keyof TaleDiscovery;

export const DISCOVERY_DISCIPLINES = ['dance', 'theatre', 'music', 'scenography'] as const;
export type DiscoveryDiscipline = (typeof DISCOVERY_DISCIPLINES)[number];

export const DISCOVERY_FORMATS = ['video', 'audio', 'pdf', 'image'] as const;
export type DiscoveryFormat = (typeof DISCOVERY_FORMATS)[number];
