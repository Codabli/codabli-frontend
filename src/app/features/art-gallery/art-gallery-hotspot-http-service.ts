import { Injectable } from '@angular/core';
import {ArtGalleryCountryEnum} from './art-gallery-country-enum'
import {ArtGalleryCountryHotspotsModel} from './models/art-gallery-country-hotspots-model';

@Injectable({
    providedIn: 'root',
})
export class ArtGalleryHotspotHttpService {
    private DATABASE_URL: string = "http://localhost:3000/countries";

    async getHotspots(country: ArtGalleryCountryEnum): Promise<ArtGalleryCountryHotspotsModel | undefined> {
        const serviceResult: Response = await fetch(`${this.DATABASE_URL}`);

        if (!serviceResult.ok)
            throw new Error("Une erreur est survenue lors de la récupération des hotspots");

        let httpResult: ArtGalleryCountryHotspotsModel[] = (await serviceResult.json()) ?? [];

        return httpResult.find((countryHotspots: ArtGalleryCountryHotspotsModel) => countryHotspots.country === country);
    }
}
