import {ArtGalleryCountryEnum} from '../art-gallery-country-enum'
import {ArtGalleryHotspotModel} from './art-gallery-hotspot-model'
import {ArtGalleryPresentationModel} from './art-gallery-presentation-model'

export interface ArtGalleryCountryModel {
    country: string;
    presentation: ArtGalleryPresentationModel;
    hotspots: ArtGalleryHotspotModel[];
}
