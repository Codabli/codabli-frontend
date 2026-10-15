import { DanceFormat, DanceIntensity, DanceStyle } from '../../../../models/interfaces/tale-staging.interface';

/**
 * Danse de la bibliothèque. Nom et description sont traduits :
 * `createDancedTale.dances.catalog.<id>.name` et `.description`.
 */
export interface CatalogDance {
  id: string;
  format: DanceFormat;
  intensity: DanceIntensity;
  style: DanceStyle;
  /** Icône Font Awesome (sans le préfixe fa-solid). */
  icon: string;
}

/**
 * Catalogue provisoire (SCRUM-101) : pas encore de référentiel de danses côté back.
 * À remplacer par un appel API quand il existera.
 */
export const DANCE_CATALOG: CatalogDance[] = [
  { id: 'festiveRound', format: 'group', intensity: 'moderate', style: 'traditional', icon: 'fa-people-group' },
  { id: 'farandole', format: 'group', intensity: 'moderate', style: 'traditional', icon: 'fa-people-line' },
  { id: 'royalMarch', format: 'group', intensity: 'gentle', style: 'traditional', icon: 'fa-crown' },
  { id: 'courtBallet', format: 'group', intensity: 'gentle', style: 'classical', icon: 'fa-masks-theater' },
  { id: 'storm', format: 'group', intensity: 'intense', style: 'contemporary', icon: 'fa-wind' },
  { id: 'musicalStatues', format: 'group', intensity: 'moderate', style: 'contemporary', icon: 'fa-pause' },
  { id: 'animals', format: 'group', intensity: 'moderate', style: 'contemporary', icon: 'fa-paw' },
  { id: 'mirror', format: 'duo', intensity: 'gentle', style: 'contemporary', icon: 'fa-clone' },
  { id: 'rhythmicDuel', format: 'duo', intensity: 'intense', style: 'contemporary', icon: 'fa-drum' },
  { id: 'stageFight', format: 'duo', intensity: 'intense', style: 'contemporary', icon: 'fa-hand-fist' },
  { id: 'heroSolo', format: 'solo', intensity: 'moderate', style: 'contemporary', icon: 'fa-person' },
  { id: 'dream', format: 'solo', intensity: 'gentle', style: 'contemporary', icon: 'fa-cloud-moon' },
];

export function findCatalogDance(id: string): CatalogDance | undefined {
  return DANCE_CATALOG.find((dance) => dance.id === id);
}

/** Les éléments glissés depuis la bibliothèque portent la danse du catalogue. */
export function isCatalogDance(data: unknown): data is CatalogDance {
  return !!data && typeof data === 'object' && 'format' in data && 'intensity' in data;
}
