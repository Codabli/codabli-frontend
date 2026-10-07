import type { Actualite } from './actualite.interface';
import type { ConteDanse } from './conte-danse.interface';
import type { Page } from './page.interface';
import type { Partenaire } from './partenaire.interface';
import type { Produit } from './produit.interface';

/** Résultat de `GET /api/recherche` : une page par type de contenu. */
export interface ResultatsRecherche {
  actualites: Page<Actualite>;
  contesDanses: Page<ConteDanse>;
  /** Cartes à conte validées (`GalerieItemResponse`), pas encore typées côté front. */
  cartesAConte: Page<unknown>;
  produits: Page<Produit>;
  partenaires: Page<Partenaire>;
}
