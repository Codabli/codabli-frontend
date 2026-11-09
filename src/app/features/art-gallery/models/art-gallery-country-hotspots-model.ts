import {ArtGalleryCountryEnum} from '../art-gallery-country-enum'
import {ArtGalleryHotspotModel} from './art-gallery-hotspot-model'

export interface ArtGalleryCountryHotspotsModel {
    country: ArtGalleryCountryEnum;
    hotspots: ArtGalleryHotspotModel[];
}
