export interface UtilisateurResponse {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: RoleUtilisateur;
  dateNaissance: string | null;
  languePreferee: string | null;
  statut: string;
  ecoleId: string | null;
  ecoleNom: string | null;
  dateCreation: string;
}

export enum RoleUtilisateur {
  ELEVE = 'eleve',
  ENSEIGNANT = 'enseignant',
  PARENT = 'parent',
  PROFESSIONNEL_EDUCATION = 'professionnel_education',
  MODERATEUR = 'moderateur',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  COMITE_LECTURE = 'comite_lecture',
  TRADUCTEUR = 'traducteur',
  AMBASSADEUR = 'ambassadeur',
}