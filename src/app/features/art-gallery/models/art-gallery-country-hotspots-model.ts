import {ArtGalleryCountryEnum} from '../art-gallery-country-enum'
import {ArtGalleryHotspotModel} from './art-gallery-hotspot-model'

export interface ArtGalleryCountryHotspotsModel {
    public country: ArtGalleryCountryEnum;
    public hotspots: ArtGalleryHotspotModel[];
}
