/** Le personnage est sur scène au début de la scène, ou y entre en cours de scène. */
export type CharacterEntrance = 'onStage' | 'enters';

/** Le personnage reste jusqu'à la fin de la scène, ou en sort en cours de scène. */
export type CharacterExit = 'stays' | 'exits';

export const CHARACTER_ENTRANCES: CharacterEntrance[] = ['onStage', 'enters'];
export const CHARACTER_EXITS: CharacterExit[] = ['stays', 'exits'];

/**
 * Moment d'une danse ou d'un son dans la scène (écrans 8.2 et 8.4) : au début, au milieu, à la fin.
 * Facultatif : sans moment (null), la danse ou le son dure toute la scène.
 */
export type DanceMoment = 'beginning' | 'middle' | 'end';
export const DANCE_MOMENTS: DanceMoment[] = ['beginning', 'middle', 'end'];

export type DanceFormat = 'solo' | 'duo' | 'group';
export type DanceIntensity = 'gentle' | 'moderate' | 'intense';
export type DanceStyle = 'traditional' | 'classical' | 'contemporary';
export const DANCE_STYLES: DanceStyle[] = ['traditional', 'classical', 'contemporary'];

export interface SceneCharacter {
  characterId: string;
  entrance: CharacterEntrance;
  /** Moment précis de l'entrée, en texte libre, si le personnage entre pendant la scène. */
  entranceMoment?: string;
  exit: CharacterExit;
  /** Moment précis de la sortie, en texte libre, si le personnage sort pendant la scène. */
  exitMoment?: string;
}

/** Musique ou bruitage d'une scène (écran 8.4, SCRUM-103). */
export type SoundKind = 'music' | 'effect';
export const SOUND_KINDS: SoundKind[] = ['music', 'effect'];

export interface SceneSound {
  id: string;
  title: string;
  kind: SoundKind;
  moment: DanceMoment | null;
  /** Danse de la scène que le son accompagne (identifiant de SceneDance), facultatif. */
  danceId: string | null;
  /** Identifiant du fichier : dans le navigateur (IndexedDB) tant que le back n'existe pas. */
  fileId: string;
  fileName: string;
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
 * Danse placée dans une scène, à partir d'une danse de la bibliothèque (écran 8.2).
 * Comme dans la maquette, chaque danse a son espace scénique et son ambiance musicale.
 */
export interface SceneDance {
  id: string;
  /** Identifiant de la danse dans la bibliothèque. */
  danceId: string;
  name: string;
  moment: DanceMoment | null;
  style: DanceStyle;
  /** Placement des personnages et décors pour cette danse (écran 8.3). */
  placements?: StagePlacement[];
  /** Ambiance musicale de la danse (écran 8.4). */
  sounds?: SceneSound[];
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
  /** Bruitages et ambiance de la scène, hors danses (ex. une scène sans danse). */
  sounds?: SceneSound[];
}

export interface TaleStaging {
  /** Mise en scène par identifiant d'étape de la trame. */
  scenes: Record<string, SceneStaging>;
}
