// Correspond à EcoleResponse côté backend (GET /api/ecoles).
export interface School {
  id: string;
  nom: string;
  pays: string;
  ville: string | null;
}
