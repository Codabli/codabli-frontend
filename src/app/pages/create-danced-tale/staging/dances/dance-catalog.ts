import { DanceFormat, DanceIntensity, DanceStyle } from '@models/interfaces/tale-staging.interface';
import { DISCOVERY_CATALOG } from '../../discovery/discovery-catalog';

/**
 * Danse de la bibliothèque. Nom et description sont traduits (voir `danceNameKey`) :
 * `createDancedTale.dances.catalog.<id>.name` et `.description` pour une danse du catalogue.
 */
export interface CatalogDance {
  id: string;
  format: DanceFormat;
  intensity: DanceIntensity;
  style: DanceStyle;
  /** Icône Font Awesome (sans le préfixe fa-solid). */
  icon: string;
  /** Ressource de danse ajoutée au projet à l'écran 2 (découverte artistique), et non danse du catalogue. */
  discoveryId?: string;
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

/**
 * Ressources de danse ajoutées au projet à l'écran 2 : elles rejoignent la bibliothèque de l'écran 8.2.
 * Leur identifiant est préfixé pour ne jamais se confondre avec une danse du catalogue.
 */
export function discoveryDances(addedIds: readonly string[]): CatalogDance[] {
  return DISCOVERY_CATALOG.filter((resource) => resource.dance && addedIds.includes(resource.id)).map(
    (resource) => ({ id: `discovery-${resource.id}`, discoveryId: resource.id, ...resource.dance! }),
  );
}

export function danceNameKey(dance: CatalogDance): string {
  return dance.discoveryId
    ? `createDancedTale.discovery.catalog.${dance.discoveryId}.title`
    : `createDancedTale.dances.catalog.${dance.id}.name`;
}

export function danceDescriptionKey(dance: CatalogDance): string {
  return dance.discoveryId
    ? `createDancedTale.discovery.catalog.${dance.discoveryId}.description`
    : `createDancedTale.dances.catalog.${dance.id}.description`;
}

export function findCatalogDance(id: string, dances: readonly CatalogDance[] = DANCE_CATALOG): CatalogDance | undefined {
  return dances.find((dance) => dance.id === id);
}

/** Les éléments glissés depuis la bibliothèque portent la danse du catalogue. */
export function isCatalogDance(data: unknown): data is CatalogDance {
  return !!data && typeof data === 'object' && 'format' in data && 'intensity' in data;
}
