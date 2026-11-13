import { Pipe, PipeTransform } from '@angular/core';
import {ArtGalleryCountryEnum} from './art-gallery-country-enum'

@Pipe({
  name: 'countryEnumToPoeticName',
  standalone: true,
})
export class CountryEnumToPoeticNamePipe implements PipeTransform {
  transform(value: ArtGalleryCountryEnum | null): string {
    let ret: string = '';

    if (value !== null) {
      switch (value) {
        case ArtGalleryCountryEnum.VIETNAM:
        case ArtGalleryCountryEnum.UNDEFINED:
        case ArtGalleryCountryEnum.WORLD:
        case ArtGalleryCountryEnum.LEBANON:
        case ArtGalleryCountryEnum.AUSTRALIA:
        case ArtGalleryCountryEnum.ITALY:
        case ArtGalleryCountryEnum.FRANCE:
        case ArtGalleryCountryEnum.TOGO:
        case ArtGalleryCountryEnum.BRAZIL:
          ret = `artGallery.poeticName.${ArtGalleryCountryEnum[value]}`;
          break;
        default:
          break;
      }
    }

    return ret;
  }
}
