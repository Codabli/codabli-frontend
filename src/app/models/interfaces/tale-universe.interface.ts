/**
 * Carte de l'univers du conte (écran 5 du parcours « Créer mon conte dansé », SCRUM-90).
 * `image` est une data URL compressée tant que l'API projet (SCRUM-96) est en pause.
 */
export interface UniverseCard {
  id: string;
  name: string;
  description: string;
  image: string | null;
}

/** RG-CMC-08 : chaque personnage a un rôle, une description et un objectif. */
export interface TaleCharacter extends UniverseCard {
  role: string;
  goal: string;
}

export interface TaleUniverse {
  places: UniverseCard[];
  characters: TaleCharacter[];
  periods: UniverseCard[];
  objects: UniverseCard[];
}

export type UniverseSection = keyof TaleUniverse;

export const UNIVERSE_SECTIONS: UniverseSection[] = ['places', 'characters', 'periods', 'objects'];
