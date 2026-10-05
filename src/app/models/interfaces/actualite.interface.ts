/** Miroir de `ActualiteResponse` côté backend. */
export interface Actualite {
  id: string;
  titre: string;
  imageUrl: string | null;
  resume: string | null;
  contenu: string;
  publie: boolean;
  datePublication: string | null;
  dateCreation: string;
  dateMiseAJour: string;
  auteurId: string;
  auteurNom: string;
  auteurPrenom: string;
}
