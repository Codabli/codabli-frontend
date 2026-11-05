import { Component, inject } from '@angular/core';
import {ArtGalleryService} from '../../art-gallery-service'
import {ArtGalleryCountryEnum} from '../../art-gallery-country-enum'

@Component({
  imports: [],
  selector: 'app-art-gallery-world-map-component',
  styleUrl: './art-gallery-world-map-component.scss',
  templateUrl: './art-gallery-world-map-component.html',
})
export class ArtGalleryWorldMapComponent {
  private service: ArtGalleryService;

  constructor() {
    this.service = inject(ArtGalleryService);
  }

  goToVietnam(): void {
    this.service.goTo(ArtGalleryCountryEnum.VIETNAM);
  }
}
