/** Le personnage est sur scène au début de la scène, ou y entre en cours de scène. */
export type CharacterEntrance = 'onStage' | 'enters';

/** Le personnage reste jusqu'à la fin de la scène, ou en sort en cours de scène. */
export type CharacterExit = 'stays' | 'exits';

export const CHARACTER_ENTRANCES: CharacterEntrance[] = ['onStage', 'enters'];
export const CHARACTER_EXITS: CharacterExit[] = ['stays', 'exits'];

export interface SceneCharacter {
  characterId: string;
  entrance: CharacterEntrance;
  /** Moment précis de l'entrée, en texte libre, si le personnage entre pendant la scène. */
  entranceMoment?: string;
  exit: CharacterExit;
  /** Moment précis de la sortie, en texte libre, si le personnage sort pendant la scène. */
  exitMoment?: string;
}

/**
 * Mise en scène d'une scène (écran 8.1 du parcours « Créer mon conte dansé », SCRUM-100).
 * Une scène correspond à une étape de la trame (écran 6).
 */
export interface SceneStaging {
  characters: SceneCharacter[];
  intention: string;
  /** Décors et accessoires, en mots-clés. */
  props: string[];
}

export interface TaleStaging {
  /** Mise en scène par identifiant d'étape de la trame. */
  scenes: Record<string, SceneStaging>;
}
