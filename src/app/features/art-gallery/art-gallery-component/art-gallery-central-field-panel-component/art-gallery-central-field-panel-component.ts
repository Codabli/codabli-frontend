import { Component, inject } from '@angular/core';
import {ArtGalleryFrescoComponent} from '../art-gallery-fresco-component/art-gallery-fresco-component'
import {ArtGalleryService} from '../../art-gallery-service'
import {ArtGalleryConstants} from '../../art-gallery-constants'

@Component({
  imports: [ArtGalleryFrescoComponent],
  selector: 'app-art-gallery-central-field-panel-component',
  styleUrl: './art-gallery-central-field-panel-component.scss',
  templateUrl: './art-gallery-central-field-panel-component.html',
})
export class ArtGalleryCentralFieldPanelComponent {
  private service: ArtGalleryService;
  readonly ArtGalleryConstants: typeof ArtGalleryConstants;

  constructor() {
    this.service = inject(ArtGalleryService);
    this.ArtGalleryConstants = ArtGalleryConstants;
  }

  changeCountry(): void {
    this.service.GoNextCountry();
  }
}
