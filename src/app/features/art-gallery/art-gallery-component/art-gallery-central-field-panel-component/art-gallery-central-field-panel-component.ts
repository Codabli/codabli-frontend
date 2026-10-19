import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import {ArtGalleryFrescoComponent} from '../art-gallery-fresco-component/art-gallery-fresco-component'
import {ArtGalleryService} from '../../art-gallery-service'

@Component({
  imports: [ArtGalleryFrescoComponent, TranslatePipe],
  selector: 'app-art-gallery-central-field-panel-component',
  styleUrl: './art-gallery-central-field-panel-component.scss',
  templateUrl: './art-gallery-central-field-panel-component.html',
})
export class ArtGalleryCentralFieldPanelComponent {
  private service: ArtGalleryService;

  constructor() {
    this.service = inject(ArtGalleryService);
  }

  changeCountry(): void {
    this.service.GoNextCountry();
  }
}
