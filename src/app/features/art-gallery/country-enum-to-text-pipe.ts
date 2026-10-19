import { Pipe, PipeTransform } from '@angular/core';
import {ArtGalleryCountryEnum} from './art-gallery-country-enum'

@Pipe({
  name: 'countryEnumToText',
  standalone: true,
})
export class CountryEnumToTextPipe implements PipeTransform {
  transform(value: ArtGalleryCountryEnum | null): string {
    return (value !== null && value !== ArtGalleryCountryEnum.UNDEFINED) ? `artGallery.country.${ArtGalleryCountryEnum[value]}` : '';
  }
}
