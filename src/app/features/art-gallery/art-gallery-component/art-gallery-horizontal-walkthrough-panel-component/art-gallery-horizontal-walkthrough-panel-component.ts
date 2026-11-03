import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import {
  ART_GALLERY_COUNTRIES,
  ART_GALLERY_VISITABLE_COUNTRIES,
  ArtGalleryCountryEnum,
} from '../../art-gallery-country-enum';
import { CountryEnumToTextPipe } from '../../country-enum-to-text-pipe';
import { ArtGalleryService } from '../../art-gallery-service';

@Component({
  imports: [AsyncPipe, CountryEnumToTextPipe, TranslatePipe],
  selector: 'app-art-gallery-horizontal-walkthrough-panel-component',
  styleUrl: './art-gallery-horizontal-walkthrough-panel-component.scss',
  templateUrl: './art-gallery-horizontal-walkthrough-panel-component.html',
})
export class ArtGalleryHorizontalWalkthroughPanelComponent {
  readonly countries = ART_GALLERY_COUNTRIES;
  readonly currentCountryObservable: Observable<ArtGalleryCountryEnum>;

  private readonly service = inject(ArtGalleryService);

  constructor() {
    this.currentCountryObservable = this.service.currentCountryObservable;
  }

  selectCountry(country: ArtGalleryCountryEnum): void {
    this.service.GoToCountry(country);
  }

  isCountryVisitable(country: ArtGalleryCountryEnum): boolean {
    return ART_GALLERY_VISITABLE_COUNTRIES.includes(country);
  }
}
