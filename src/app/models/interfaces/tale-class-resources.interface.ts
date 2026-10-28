/**
 * Ressources propres à la classe (écran 4 du parcours « Créer mon conte dansé », SCRUM-89) :
 * documents déposés (PDF, images, audio, vidéo) et liens externes.
 */
export const CLASS_RESOURCE_KINDS = ['pdf', 'image', 'audio', 'video', 'link'] as const;
export type ClassResourceKind = (typeof CLASS_RESOURCE_KINDS)[number];

export interface ClassResource {
  id: string;
  kind: ClassResourceKind;
  /** Nom affiché, modifiable (par défaut : nom du fichier ou domaine du lien). */
  name: string;
  /** Date d'ajout (ISO 8601). */
  addedAt: string;
  /** Les créations importées sont privées par défaut : visibles du seul enseignant. */
  visibility: 'private';
  /** Fichier : identifiant dans le navigateur (IndexedDB) tant que le back n'existe pas. */
  fileId?: string;
  fileName?: string;
  mimeType?: string;
  /** Taille en octets. */
  size?: number;
  /** Fichier : droits d'utilisation pédagogiques attestés au téléversement. */
  rightsConfirmed?: boolean;
  /** Lien externe (vidéo éducative, site...). */
  url?: string;
}

export interface TaleClassResources {
  items: ClassResource[];
}
