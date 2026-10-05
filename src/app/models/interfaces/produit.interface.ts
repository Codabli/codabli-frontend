import type { PaginationParams } from './pagination.interface';

export type TypeProduit = 'produit_physique' | 'produit_numerique';

/** Miroir de `ProduitResponse` côté backend. */
export interface Produit {
  id: string;
  nom: string;
  description: string | null;
  prix: number;
  imageUrl: string | null;
  type: TypeProduit;
  /** Null pour un produit numérique. */
  stock: number | null;
  actif: boolean;
  dateCreation: string;
  dateMiseAJour: string;
}

export interface ProduitFiltres extends PaginationParams {
  type?: TypeProduit;
  actif?: boolean;
}
