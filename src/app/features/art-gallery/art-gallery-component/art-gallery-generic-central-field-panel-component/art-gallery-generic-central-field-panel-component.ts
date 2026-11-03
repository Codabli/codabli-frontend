import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import {ArtGalleryWorldMapComponent} from '../art-gallery-world-map-component/art-gallery-world-map-component';
import {ArtGalleryCentralFieldPanelComponent} from '../art-gallery-central-field-panel-component/art-gallery-central-field-panel-component';
import {ArtGalleryService} from '../../art-gallery-service'
import {ArtGalleryCountryEnum} from '../../art-gallery-country-enum'

@Component({
  imports: [AsyncPipe, ArtGalleryWorldMapComponent, ArtGalleryCentralFieldPanelComponent],
  selector: 'app-art-gallery-generic-central-field-panel-component',
  styleUrl: './art-gallery-generic-central-field-panel-component.scss',
  templateUrl: './art-gallery-generic-central-field-panel-component.html',
})
export class ArtGalleryGenericCentralFieldPanelComponent {
  private service: ArtGalleryService;
  readonly currentCountryObservable: Observable<ArtGalleryCountryEnum>;
  readonly ArtGalleryCountryEnum: typeof ArtGalleryCountryEnum;

  constructor() {
    this.service = inject(ArtGalleryService);
    this.currentCountryObservable = this.service.currentCountryObservable;
    this.ArtGalleryCountryEnum = ArtGalleryCountryEnum;
  }
}
