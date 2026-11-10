import { Injectable, inject } from '@angular/core';
import {ArtGalleryHotspotHttpService} from './art-gallery-hotspot-http-service';
import {ArtGalleryCountryEnum} from './art-gallery-country-enum';
import {ArtGalleryHotspotModel} from './models/art-gallery-hotspot-model';
import {ArtGalleryCountryHotspotsModel} from './models/art-gallery-country-hotspots-model';

@Injectable({
    providedIn: 'root',
})
export class ArtGalleryHotspotService {
    private httpService: ArtGalleryHotspotHttpService;

    constructor() {
        this.httpService = inject(ArtGalleryHotspotHttpService);
    }

    public getHotspot(forCountry: ArtGalleryCountryEnum, withId: number) : Promise<ArtGalleryHotspotModel | undefined> {
        return this.httpService.getHotspots(forCountry).then((httpServiceResult: ArtGalleryCountryHotspotsModel | undefined) => {
            return httpServiceResult?.hotspots.find((item: ArtGalleryHotspotModel) => item.id === withId);
        });
    }
}
