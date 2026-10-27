import { AGE_RANGES, AgeRange } from '../../../models/types/age-range.type';
import { DiscoveryDiscipline, DiscoveryFormat } from '../../../models/interfaces/tale-discovery.interface';
import { DanceFormat, DanceIntensity, DanceStyle } from '../../../models/interfaces/tale-staging.interface';
import { MediaCredit } from '../media-credit';

const ASSETS = 'assets/create-danced-tale/discovery';

/**
 * Ressource d'initiation artistique de l'écran 2. Titre, description et consigne sont traduits :
 * `createDancedTale.discovery.catalog.<id>.title`, `.description` et `.activity`.
 */
export interface DiscoveryResource {
  id: string;
  discipline: DiscoveryDiscipline;
  format: DiscoveryFormat;
  /** Durée de l'activité proposée, en minutes. */
  durationMinutes: number;
  /** RG-CMC-03 : tranches d'âge pour lesquelles la ressource est adaptée. */
  ageRanges: readonly AgeRange[];
  /** Fichier du média (vidéo, audio, PDF ou image). */
  src: string;
  /** Vignette de la carte : affiche de la vidéo ou image. Sans vignette, la carte montre une icône. */
  thumbnail?: string;
  /** Sous-titres WebVTT des vidéos, par langue (`<fichier>.<langue>.vtt`). */
  subtitles?: string;
  credit: MediaCredit;
  /**
   * Ressource de danse : une fois ajoutée au projet, elle est proposée dans la bibliothèque
   * de danses de l'écran 8.2, avec ces caractéristiques (icône Font Awesome sans fa-solid).
   */
  dance?: { format: DanceFormat; intensity: DanceIntensity; style: DanceStyle; icon: string };
}

const ALL_AGES = AGE_RANGES;
const FROM_6 = AGE_RANGES.filter((range) => range !== '3-5');
const FROM_9 = AGE_RANGES.filter((range) => range !== '3-5' && range !== '6-8');

/**
 * Catalogue provisoire (SCRUM-87) : pas encore de base de ressources côté back.
 * Médias de test du domaine public ou sous CC0 (sources dans `public/assets/create-danced-tale/CREDITS.md`).
 */
export const DISCOVERY_CATALOG: DiscoveryResource[] = [
  {
    id: 'serpentineAnnabelle',
    discipline: 'dance',
    dance: { format: 'solo', intensity: 'moderate', style: 'contemporary', icon: 'fa-wind' },
    format: 'video',
    durationMinutes: 10,
    ageRanges: ALL_AGES,
    src: `${ASSETS}/danse-serpentine-annabelle.mp4`,
    thumbnail: `${ASSETS}/danse-serpentine-annabelle-poster.jpg`,
    subtitles: `${ASSETS}/danse-serpentine-annabelle`,
    credit: {
      author: 'William K. L. Dickson (Edison)',
      date: '1894',
      licence: 'Domaine public',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Annabelle_Serpentine.ogv',
    },
  },
  {
    id: 'serpentineLumiere',
    discipline: 'dance',
    dance: { format: 'solo', intensity: 'gentle', style: 'contemporary', icon: 'fa-feather' },
    format: 'video',
    durationMinutes: 15,
    ageRanges: FROM_6,
    src: `${ASSETS}/danse-serpentine-lumiere.mp4`,
    thumbnail: `${ASSETS}/danse-serpentine-lumiere-poster.jpg`,
    subtitles: `${ASSETS}/danse-serpentine-lumiere`,
    credit: {
      author: 'Société Lumière',
      date: '1899',
      licence: 'Domaine public',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Loie_Fuller_-_Vue_Lumi%C3%A8re_No_76_-_Serpentine_Dance_-_1896.ogv',
    },
  },
  {
    id: 'animalWakeUp',
    discipline: 'dance',
    dance: { format: 'group', intensity: 'moderate', style: 'contemporary', icon: 'fa-paw' },
    format: 'pdf',
    durationMinutes: 35,
    ageRanges: ['3-5', '6-8'],
    src: `${ASSETS}/fiche-eveil-corporel-animaux.pdf`,
    credit: { author: 'Codabli', date: '2026', licence: 'CC0' },
  },
  {
    id: 'blueDancers',
    discipline: 'dance',
    dance: { format: 'group', intensity: 'gentle', style: 'classical', icon: 'fa-person-dress' },
    format: 'image',
    durationMinutes: 10,
    ageRanges: ALL_AGES,
    src: `${ASSETS}/danseuses-bleues-degas.jpg`,
    thumbnail: `${ASSETS}/danseuses-bleues-degas.jpg`,
    credit: {
      author: 'Edgar Degas',
      date: '1897',
      licence: 'Domaine public',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:%D0%94%D0%B5%D0%B3%D0%B0._%D0%93%D0%BE%D0%BB%D1%83%D0%B1%D1%8B%D0%B5_%D1%82%D0%B0%D0%BD%D1%86%D0%BE%D0%B2%D1%89%D0%B8%D1%86%D1%8B.jpg',
    },
  },
  {
    id: 'pierrotMime',
    discipline: 'theatre',
    format: 'image',
    durationMinutes: 20,
    ageRanges: FROM_6,
    src: `${ASSETS}/theatre-pierrot-watteau.jpg`,
    thumbnail: `${ASSETS}/theatre-pierrot-watteau.jpg`,
    credit: {
      author: 'Jean-Antoine Watteau',
      date: 'vers 1718',
      licence: 'Domaine public',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Jean-Antoine_Watteau_-_Pierrot,_dit_autrefois_Gilles.jpg',
    },
  },
  {
    id: 'livingStatues',
    discipline: 'theatre',
    format: 'audio',
    durationMinutes: 15,
    ageRanges: ALL_AGES,
    src: `${ASSETS}/satie-gymnopedie-1.mp3`,
    credit: {
      author: 'Erik Satie (composition)',
      date: '1888',
      licence: 'CC0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gymnopedie_No._1..ogg',
    },
  },
  {
    id: 'swanImprovisation',
    discipline: 'music',
    format: 'audio',
    durationMinutes: 15,
    ageRanges: FROM_6,
    src: `${ASSETS}/saint-saens-le-cygne.mp3`,
    credit: {
      author: 'Camille Saint-Saëns (composition)',
      date: '1886',
      licence: 'Domaine public',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:20091104_Alisa_Weilerstein_and_Jason_Yoder_-_Saint_Sa%C3%ABns%27_The_Swan.ogg',
    },
  },
  {
    id: 'operaOrchestra',
    discipline: 'music',
    format: 'image',
    durationMinutes: 10,
    ageRanges: FROM_9,
    src: `${ASSETS}/musique-orchestre-opera-degas.jpg`,
    thumbnail: `${ASSETS}/musique-orchestre-opera-degas.jpg`,
    credit: {
      author: 'Edgar Degas',
      date: 'vers 1870',
      licence: 'Domaine public',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Edgar_Degas_-_The_Orchestra_at_the_Opera_-_Google_Art_Project.jpg',
    },
  },
  {
    id: 'setDesign',
    discipline: 'scenography',
    format: 'image',
    durationMinutes: 25,
    ageRanges: FROM_9,
    src: `${ASSETS}/scenographie-decor-polyeucte-chaperon.jpg`,
    thumbnail: `${ASSETS}/scenographie-decor-polyeucte-chaperon.jpg`,
    credit: {
      author: 'Philippe Chaperon',
      date: '1878',
      licence: 'Domaine public',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Polyeucte_-_Projet_de_d%C3%A9cor_pour_l%27acte_III_-_Chaperon.jpg',
    },
  },
  {
    id: 'lightAndVeils',
    discipline: 'scenography',
    format: 'video',
    durationMinutes: 20,
    ageRanges: FROM_6,
    src: `${ASSETS}/danse-serpentine-lumiere.mp4`,
    thumbnail: `${ASSETS}/danse-serpentine-lumiere-poster.jpg`,
    subtitles: `${ASSETS}/danse-serpentine-lumiere`,
    credit: {
      author: 'Société Lumière',
      date: '1899',
      licence: 'Domaine public',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Loie_Fuller_-_Vue_Lumi%C3%A8re_No_76_-_Serpentine_Dance_-_1896.ogv',
    },
  },
];

export const DURATION_RANGES = ['short', 'medium', 'long'] as const;
export type DurationRange = (typeof DURATION_RANGES)[number];

/** Filtre rapide par durée : jusqu'à 10 min, de 11 à 20 min, plus de 20 min. */
export function durationRangeOf(minutes: number): DurationRange {
  if (minutes <= 10) {
    return 'short';
  }

  return minutes <= 20 ? 'medium' : 'long';
}
