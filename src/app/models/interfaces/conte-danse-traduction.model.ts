export type StatutTraduction = 'brouillon' | 'en_revision' | 'publie' | 'refuse';

export interface ConteDanseTraduction {
  id: string;
  conteId: string;
  langue: string;
  variante: string | null;
  texte: string | null;
  audioUrl: string | null;
  videoUrl: string | null;
  sousTitresUrl: string | null;
  traducteurId: string | null;
  traducteurNom: string | null;
  relecteurId: string | null;
  relecteurNom: string | null;
  statut: StatutTraduction;
  dateCreation: string;
  dateMiseAJour: string | null;
}