import type { PaginationParams } from './pagination.interface';

export type CategoriePartenaire =
  | 'institutionnel'
  | 'fondation'
  | 'culturel'
  | 'association'
  | 'citoyen_contributeur';

/** Miroir de `PartenaireResponse` côté backend. */
export interface Partenaire {
  id: string;
  nom: string;
  logoUrl: string | null;
  presentation: string | null;
  categorie: CategoriePartenaire;
  territoire: string | null;
  roleProjet: string | null;
  videoUrl: string | null;
  lien: string | null;
  periodeDebut: string | null;
  periodeFin: string | null;
  actif: boolean;
  dateCreation: string;
  dateMiseAJour: string;
}

export interface PartenaireFiltres extends PaginationParams {
  categorie?: CategoriePartenaire;
}
