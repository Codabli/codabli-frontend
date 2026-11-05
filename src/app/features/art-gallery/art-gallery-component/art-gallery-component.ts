import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import {ArtGalleryGenericCentralFieldPanelComponent} from './art-gallery-generic-central-field-panel-component/art-gallery-generic-central-field-panel-component'
import {ArtGalleryHorizontalWalkthroughPanelComponent} from './art-gallery-horizontal-walkthrough-panel-component/art-gallery-horizontal-walkthrough-panel-component'
import {ArtGalleryFrescoComponent} from './art-gallery-fresco-component/art-gallery-fresco-component'
import {ArtGalleryService} from '../art-gallery-service'

@Component({
  imports: [AsyncPipe,
            ArtGalleryGenericCentralFieldPanelComponent,
            ArtGalleryHorizontalWalkthroughPanelComponent,
            ArtGalleryFrescoComponent],
  selector: 'app-art-gallery-component',
  styleUrl: './art-gallery-component.scss',
  templateUrl: './art-gallery-component.html',
})
export class ArtGalleryComponent {
  private service: ArtGalleryService;
  readonly isFrescoExtendedObservable: Observable<boolean>;

  constructor() {
    this.service = inject(ArtGalleryService);
    this.isFrescoExtendedObservable = this.service.isFrescoExtendedObservable;
  }
}
