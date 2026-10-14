import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import {CountryEnumToTextPipe} from '../../country-enum-to-text-pipe'
import {ArtGalleryService} from '../../art-gallery-service'
import {ArtGalleryCountryEnum} from '../../art-gallery-country-enum'

@Component({
  imports: [AsyncPipe, CountryEnumToTextPipe, TranslatePipe],
  selector: 'app-art-gallery-fresco-component',
  styleUrl: './art-gallery-fresco-component.scss',
  templateUrl: './art-gallery-fresco-component.html',
})
export class ArtGalleryFrescoComponent {
  private service: ArtGalleryService;
  readonly currentCountryObservable: Observable<ArtGalleryCountryEnum>;

  constructor() {
    this.service = inject(ArtGalleryService);
    this.currentCountryObservable = this.service.currentCountryObservable;
  }
}
