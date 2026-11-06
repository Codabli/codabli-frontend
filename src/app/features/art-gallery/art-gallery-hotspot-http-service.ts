import { Injectable } from '@angular/core';
import {ArtGalleryCountryEnum} from './art-gallery-country-enum'
import {ArtGalleryHotspotModel} from './art-gallery-hotspot-model';

@Injectable({
    providedIn: 'root',
})
export class ArtGalleryHotspotHttpService {
    private DATABASE_URL: string = "http://localhost:3000/countries";

    async getHotspots(country: ArtGalleryCountryEnum): Promise<ArtGalleryHotspotModel[]> {
        const serviceResult: Response = await fetch(`${this.DATABASE_URL}/${ArtGalleryCountryEnum[country]}`);

        if (!serviceResult.ok)
            throw new Error("Une erreur est survenue lors de la récupération des hotspots");

        return (await serviceResult.json()) ?? [];
    }
}
