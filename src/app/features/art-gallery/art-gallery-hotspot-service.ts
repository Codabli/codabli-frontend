import { Injectable, inject } from '@angular/core';
import {ArtGalleryHotspotHttpService} from './art-gallery-hotspot-http-service';
import {ArtGalleryCountryEnum} from './art-gallery-country-enum';
import {ArtGalleryCountryModel} from './models/art-gallery-country-model';
import {ArtGalleryHotspotModel} from './models/art-gallery-hotspot-model';
import {ArtGalleryPresentationModel} from './models/art-gallery-presentation-model';

@Injectable({
    providedIn: 'root',
})
export class ArtGalleryHotspotService {
    private httpService: ArtGalleryHotspotHttpService;

    constructor() {
        this.httpService = inject(ArtGalleryHotspotHttpService);
    }

    public getHotspot(forCountry: ArtGalleryCountryEnum, withId: number) : Promise<ArtGalleryHotspotModel | undefined> {
        return this.httpService.getCountryData(forCountry).then((httpServiceResult: ArtGalleryCountryModel | undefined) => {
            return httpServiceResult?.hotspots.find((item: ArtGalleryHotspotModel) => item.id === withId);
        });
    }

    public getPresentation(forCountry: ArtGalleryCountryEnum) : Promise<ArtGalleryPresentationModel | undefined> {
        return this.httpService.getCountryData(forCountry).then((httpServiceResult: ArtGalleryCountryModel | undefined) => {
            return httpServiceResult?.presentation;
        });
    }
}
