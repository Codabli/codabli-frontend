/** Miroir de `HotspotResponse` côté backend. */
export interface Hotspot {
  id: string;
  fresqueId: string;
  titre: string;
  explicationDecouverte: string;
  explicationApprofondie: string;
  imageUrl: string | null;
  audioUrl: string | null;
  ordreAffichage: number;
  actif: boolean;
}

/** Miroir de `FresqueResponse` côté backend. */
export interface Fresque {
  id: string;
  salleId: string;
  titre: string;
  imageUrl: string | null;
  introduction: string | null;
  conteId: string | null;
  hotspots: Hotspot[];
}

/** Miroir de `SalleGalerieResponse` côté backend. */
export interface SalleGalerie {
  id: string;
  pays: string;
  introduction: string | null;
  ambianceSonoreUrl: string | null;
  paletteCouleurs: string | null;
  ordreAffichage: number;
  actif: boolean;
  /** Null tant qu'aucune fresque n'est rattachée à la salle. */
  fresque: Fresque | null;
}
