import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { ArtGalleryHotspotComponent } from '../art-gallery-hotspot-component/art-gallery-hotspot-component';
import {CountryEnumToTextPipe} from '../../country-enum-to-text-pipe';
import {CountryEnumToPoeticNamePipe} from '../../country-enum-to-poetic-name-pipe';
import {ArtGalleryService} from '../../art-gallery-service';
import {ArtGalleryCountryEnum} from '../../art-gallery-country-enum';

@Component({
  imports: [AsyncPipe, ArtGalleryHotspotComponent, CountryEnumToTextPipe, CountryEnumToPoeticNamePipe, TranslatePipe],
  selector: 'app-art-gallery-fresco-component',
  styleUrl: './art-gallery-fresco-component.scss',
  templateUrl: './art-gallery-fresco-component.html',
})
export class ArtGalleryFrescoComponent {
  readonly ArtGalleryCountryEnum = ArtGalleryCountryEnum;
  private service: ArtGalleryService;
  readonly currentCountryObservable: Observable<ArtGalleryCountryEnum>;
  readonly isExtendedObservable: Observable<boolean>;

  constructor() {
    this.service = inject(ArtGalleryService);
    this.currentCountryObservable = this.service.currentCountryObservable;
    this.isExtendedObservable = this.service.isFrescoExtendedObservable;
  }

  public returnToGallery(): void {
    this.service.shrinkFresco();
  }
}
