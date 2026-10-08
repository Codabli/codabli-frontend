/** Le personnage est sur scène au début de la scène, ou y entre en cours de scène. */
export type CharacterEntrance = 'onStage' | 'enters';

/** Le personnage reste jusqu'à la fin de la scène, ou en sort en cours de scène. */
export type CharacterExit = 'stays' | 'exits';

export const CHARACTER_ENTRANCES: CharacterEntrance[] = ['onStage', 'enters'];
export const CHARACTER_EXITS: CharacterExit[] = ['stays', 'exits'];

/** Moment du passage dansé dans la scène (écran 8.2, SCRUM-101). */
export type DanceMoment = 'beginning' | 'middle' | 'end';
export const DANCE_MOMENTS: DanceMoment[] = ['beginning', 'middle', 'end'];

export type DanceFormat = 'solo' | 'duo' | 'group';
export type DanceIntensity = 'gentle' | 'moderate' | 'intense';
export type DanceStyle = 'traditional' | 'classical' | 'contemporary';
export const DANCE_STYLES: DanceStyle[] = ['traditional', 'classical', 'contemporary'];

/** Danse placée dans une scène, à partir d'une danse de la bibliothèque. */
export interface SceneDance {
  id: string;
  /** Identifiant de la danse dans la bibliothèque. */
  danceId: string;
  name: string;
  moment: DanceMoment;
  style: DanceStyle;
}

export interface SceneCharacter {
  characterId: string;
  entrance: CharacterEntrance;
  /** Moment précis de l'entrée, en texte libre, si le personnage entre pendant la scène. */
  entranceMoment?: string;
  exit: CharacterExit;
  /** Moment précis de la sortie, en texte libre, si le personnage sort pendant la scène. */
  exitMoment?: string;
}

/** Élément placé sur le plateau : un personnage présent ou un décor de la scène (écran 8.3). */
export type StageElementKind = 'character' | 'prop';

/**
 * Position d'un élément au début de la scène, en pourcentage du plateau
 * (x : de gauche à droite vu du public, y : du fond de scène vers le public).
 */
export interface StagePlacement {
  kind: StageElementKind;
  /** Identifiant du personnage, ou libellé du décor. */
  ref: string;
  x: number;
  y: number;
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
  /** Absent des brouillons enregistrés avant l'écran 8.2. */
  dances?: SceneDance[];
  /** Placement initial sur le plateau ; absent des brouillons enregistrés avant l'écran 8.3. */
  placements?: StagePlacement[];
}

export interface TaleStaging {
  /** Mise en scène par identifiant d'étape de la trame. */
  scenes: Record<string, SceneStaging>;
}
