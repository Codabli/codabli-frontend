import { ProjectContext } from '@models/interfaces/project-context.interface';
import { ResourceCategory, ResourceProvenance } from '@models/interfaces/tale-resources.interface';
import { MediaCredit } from '../media-credit';
import { normalizeText } from '../normalize-text';

const ASSETS = 'assets/create-danced-tale/resources';

/**
 * Ressource culturelle recommandée à l'écran 3. Titre, description et explication sont traduits :
 * `createDancedTale.resources.catalog.<id>.title`, `.description` et `.reason` (RG-CMC-06).
 */
export interface CulturalResource {
  id: string;
  category: ResourceCategory;
  /** RG-CMC-05 : origine affichée par un badge obligatoire. */
  provenance: ResourceProvenance;
  image: string;
  /** Lieu de la ressource, pour « À découvrir près de votre école ». */
  location?: { region: string; city: string };
  /** Mots rapprochés du thème et des ingrédients secrets de l'écran 1 (sans accents, en minuscules). */
  keywords: readonly string[];
  credit: MediaCredit;
}

/**
 * Catalogue provisoire (SCRUM-88) : pas encore de moteur de recommandation côté back.
 * La pertinence est approchée par des mots-clés ; les « Suggestions IA » sont des exemples.
 * Médias de test du domaine public ou sous CC0 (sources dans `public/assets/create-danced-tale/CREDITS.md`).
 */
export const CULTURAL_RESOURCE_CATALOG: CulturalResource[] = [
  {
    id: 'chambord',
    category: 'places',
    provenance: 'localHeritage',
    image: `${ASSETS}/chateau-de-chambord.jpg`,
    location: { region: 'Centre-Val de Loire', city: 'Chambord' },
    keywords: ['chateau', 'roi', 'reine', 'prince', 'princesse', 'renaissance'],
    credit: {
      author: 'Photoglob Co. (photochrome)',
      date: 'vers 1890',
      licence: 'Domaine public',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ch%C3%A2teau_de_Chambord_LCCN2017659781.jpg',
    },
  },
  {
    id: 'montSaintMichel',
    category: 'places',
    provenance: 'localHeritage',
    image: `${ASSETS}/mont-saint-michel.jpg`,
    location: { region: 'Normandie', city: 'Le Mont-Saint-Michel' },
    keywords: ['moyen age', 'abbaye', 'mer', 'maree', 'ile', 'chevalier'],
    credit: {
      author: 'Tswgb',
      date: '2007',
      licence: 'Domaine public',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mont_St._Michel_aerial.jpg',
    },
  },
  {
    id: 'broceliande',
    category: 'places',
    provenance: 'localHeritage',
    image: `${ASSETS}/foret-de-broceliande-paimpont.jpg`,
    location: { region: 'Bretagne', city: 'Paimpont' },
    keywords: ['foret', 'fee', 'merlin', 'arthur', 'magie', 'legende', 'enchant'],
    credit: {
      author: 'Gabriel from92',
      date: '2026',
      licence: 'CC0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Foug%C3%A8res_dans_la_for%C3%AAt_de_Paimpont-_juillet_2026_01.jpg',
    },
  },
  {
    id: 'kingArthur',
    category: 'characters',
    provenance: 'codabli',
    image: `${ASSETS}/roi-arthur-wyeth.jpg`,
    keywords: ['arthur', 'roi', 'chevalier', 'moyen age', 'epee', 'legende', 'table ronde'],
    credit: {
      author: 'N. C. Wyeth',
      date: '1922',
      licence: 'Domaine public',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Boys_King_Arthur_-_N._C._Wyeth_-_p102.jpg',
    },
  },
  {
    id: 'joanOfArc',
    category: 'characters',
    provenance: 'codabli',
    image: `${ASSETS}/jeanne-d-arc-ingres.jpg`,
    location: { region: 'Centre-Val de Loire', city: 'Orléans' },
    keywords: ['moyen age', 'heroine', 'chevalier', 'courage', 'roi', 'histoire'],
    credit: {
      author: 'Jean-Auguste-Dominique Ingres',
      date: '1854',
      licence: 'Domaine public',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ingres_coronation_charles_vii.jpg',
    },
  },
  {
    id: 'morganLeFay',
    category: 'characters',
    provenance: 'ai',
    image: `${ASSETS}/morgane-la-fee-sandys.jpg`,
    keywords: ['fee', 'magie', 'sorciere', 'arthur', 'legende', 'enchant'],
    credit: {
      author: 'Frederick Sandys',
      date: '1864',
      licence: 'Domaine public',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Frederick_Sandys_-_Morgan-le-Fay_-_1925P104_-_Birmingham_Museum_and_Art_Gallery.jpg',
    },
  },
  {
    id: 'moulinGalette',
    category: 'events',
    provenance: 'codabli',
    image: `${ASSETS}/bal-du-moulin-de-la-galette-renoir.jpg`,
    location: { region: 'Île-de-France', city: 'Paris' },
    keywords: ['bal', 'fete', 'danse', 'musique', 'guinguette'],
    credit: {
      author: 'Pierre-Auguste Renoir',
      date: '1876',
      licence: 'Domaine public',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Pierre-Auguste_Renoir,_Le_Moulin_de_la_Galette.jpg',
    },
  },
  {
    id: 'federationFestival',
    category: 'events',
    provenance: 'localHeritage',
    image: `${ASSETS}/fete-de-la-federation-thevenin.jpg`,
    location: { region: 'Île-de-France', city: 'Paris' },
    keywords: ['fete', 'revolution', 'histoire', '14 juillet', 'foule'],
    credit: {
      author: 'Charles Thévenin',
      date: '1792',
      licence: 'CC0',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Charles_Th%C3%A9venin_-_La_f%C3%AAte_de_la_F%C3%A9d%C3%A9ration,_le_14_juillet_1790,_au_Champ-de-Mars,_actuel_7%C3%A8me_arrondissement_-_La_F%C3%AAte_de_la_F%C3%A9d%C3%A9ration,_le_14_juillet_1790,_au_Champ-de-Mars_-_Mus%C3%A9e_Carnavalet_-_2.jpg',
    },
  },
  {
    id: 'degasDanceClass',
    category: 'artworks',
    provenance: 'codabli',
    image: `${ASSETS}/classe-de-danse-degas.jpg`,
    location: { region: 'Île-de-France', city: 'Paris' },
    keywords: ['danse', 'ballet', 'opera', 'danseuse', 'ecole'],
    credit: {
      author: 'Edgar Degas',
      date: '1875',
      licence: 'Domaine public',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Edgar_Degas_-_La_Classe_de_danse.jpg',
    },
  },
  {
    id: 'bayeuxTapestry',
    category: 'artworks',
    provenance: 'localHeritage',
    image: `${ASSETS}/tapisserie-de-bayeux-banquet.jpg`,
    location: { region: 'Normandie', city: 'Bayeux' },
    keywords: ['moyen age', 'chevalier', 'bataille', 'roi', 'banquet', 'histoire'],
    credit: {
      author: 'Broderie anonyme',
      date: 'vers 1070',
      licence: 'Domaine public',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Bayeux_Tapestry_scene43_banquet_Odo.jpg',
    },
  },
  {
    id: 'pierrotWatteau',
    category: 'artworks',
    provenance: 'ai',
    image: 'assets/create-danced-tale/discovery/theatre-pierrot-watteau.jpg',
    location: { region: 'Île-de-France', city: 'Paris' },
    keywords: ['theatre', 'clown', 'comedie', 'pierrot', 'mime'],
    credit: {
      author: 'Jean-Antoine Watteau',
      date: 'vers 1718',
      licence: 'Domaine public',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Jean-Antoine_Watteau_-_Pierrot,_dit_autrefois_Gilles.jpg',
    },
  },
  {
    id: 'redRidingHood',
    category: 'tales',
    provenance: 'codabli',
    image: `${ASSETS}/petit-chaperon-rouge-dore.jpg`,
    keywords: ['loup', 'foret', 'conte', 'perrault', 'grand-mere'],
    credit: {
      author: 'Gustave Doré',
      date: '1862',
      licence: 'Domaine public',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Little_Red_Riding_Hood_Gustav_Dor%C3%A9_illustration_for_Charles_Perrault_-_Il_libro_delle_fate,_Longanesi,_Milano,_1891.jpg',
    },
  },
  {
    id: 'pussInBoots',
    category: 'tales',
    provenance: 'codabli',
    image: `${ASSETS}/chat-botte-dore.jpg`,
    keywords: ['chat', 'ruse', 'chateau', 'ogre', 'roi', 'perrault', 'conte'],
    credit: {
      author: 'Gustave Doré',
      date: '1867',
      licence: 'Domaine public',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lechatbotte1.jpg',
    },
  },
  {
    id: 'cinderella',
    category: 'tales',
    provenance: 'ai',
    image: `${ASSETS}/cendrillon-dore.jpg`,
    keywords: ['princesse', 'prince', 'bal', 'fee', 'magie', 'chateau', 'perrault', 'conte'],
    credit: {
      author: 'Gustave Doré',
      date: '1867',
      licence: 'Domaine public',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gustave_dore_cendrillon4.jpg',
    },
  },
];

/** Comparaison de lieux : sans casse, accents ni tirets (« Centre-Val de Loire » = « centre val de loire »). */
function placeKey(text: string): string {
  return normalizeText(text)
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Ressource située dans la région ou la ville de l'école (écran 1). */
export function isNearSchool(resource: CulturalResource, context: ProjectContext | null): boolean {
  if (!resource.location || !context) {
    return false;
  }

  const region = placeKey(context.region);
  const city = placeKey(context.city);

  return (
    (!!region && placeKey(resource.location.region) === region) ||
    (!!city && placeKey(resource.location.city) === city)
  );
}

/**
 * Mots-clés de la ressource retrouvés dans le thème ou les ingrédients secrets.
 * Un mot-clé correspond au début d'un mot : « chevalier » retrouve « chevaliers ».
 */
export function matchedKeywords(resource: CulturalResource, context: ProjectContext | null): string[] {
  if (!context) {
    return [];
  }

  const text = normalizeText([context.theme, ...context.secretIngredients].join(' '));

  return resource.keywords.filter((keyword) => new RegExp(`(^|[^a-z0-9])${keyword}`).test(text));
}
