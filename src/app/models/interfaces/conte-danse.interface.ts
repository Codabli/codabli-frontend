import type { PaginationParams } from './pagination.interface';

export type AccesConte = 'gratuit' | 'payant';

export type StatutConte =
  | 'brouillon'
  | 'en_revision_enseignant'
  | 'en_revision_comite'
  | 'publie'
  | 'refuse';

/** Miroir de `ConteDanseResponse` côté backend. */
export interface ConteDanse {
  id: string;
  titre: string;
  description: string;
  thematique: string;
  langueOriginale: string;
  couvertureUrl: string | null;
  pays: string | null;
  culture: string | null;
  ageMin: number | null;
  ageMax: number | null;
  dureeMinutes: number | null;
  credits: string | null;
  statut: StatutConte;
  acces: AccesConte;
  isbn: string | null;
  fichierTexteUrl: string | null;
  fichierAudioUrl: string | null;
  fichierVideoUrl: string | null;
  dateCreation: string;
  datePublication: string | null;
  createurId: string;
  createurNom: string;
  createurPrenom: string;
}

export interface ConteDanseFiltres extends PaginationParams {
  langue?: string;
  pays?: string;
  thematique?: string;
  acces?: AccesConte;
  age?: number;
}
