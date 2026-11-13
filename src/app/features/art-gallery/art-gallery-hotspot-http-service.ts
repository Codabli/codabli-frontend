import { Injectable } from '@angular/core';
import {ArtGalleryCountryEnum} from './art-gallery-country-enum'
import {ArtGalleryCountryModel} from './models/art-gallery-country-model';

@Injectable({
    providedIn: 'root',
})
export class ArtGalleryHotspotHttpService {
    private DATABASE_URL: string = "http://localhost:3000/countries";

    public async getCountryData(country: ArtGalleryCountryEnum): Promise<ArtGalleryCountryModel | undefined> {
        const serviceResult: Response = await fetch(`${this.DATABASE_URL}`);

        if (!serviceResult.ok)
            throw new Error("Une erreur est survenue lors de la récupération des hotspots");

        let httpResult: ArtGalleryCountryModel[] = (await serviceResult.json()) ?? [];

        return httpResult.find((countryHotspots: ArtGalleryCountryModel) => countryHotspots.country === ArtGalleryCountryEnum[country]);
    }
}
