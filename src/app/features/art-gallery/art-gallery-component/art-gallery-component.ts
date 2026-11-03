import { Component } from '@angular/core';
import {ArtGalleryGenericCentralFieldPanelComponent} from './art-gallery-generic-central-field-panel-component/art-gallery-generic-central-field-panel-component'
import {ArtGalleryHorizontalWalkthroughPanelComponent} from './art-gallery-horizontal-walkthrough-panel-component/art-gallery-horizontal-walkthrough-panel-component'

@Component({
  imports: [ArtGalleryGenericCentralFieldPanelComponent, ArtGalleryHorizontalWalkthroughPanelComponent],
  selector: 'app-art-gallery-component',
  styleUrl: './art-gallery-component.scss',
  templateUrl: './art-gallery-component.html',
})
export class ArtGalleryComponent {}
