import { Component } from '@angular/core';
import {ArtGalleryNavigationPanelComponent} from './art-gallery-navigation-panel-component/art-gallery-navigation-panel-component'
import {ArtGalleryCentralFieldPanelComponent} from './art-gallery-central-field-panel-component/art-gallery-central-field-panel-component'
import {ArtGalleryHorizontalWalkthroughPanelComponent} from './art-gallery-horizontal-walkthrough-panel-component/art-gallery-horizontal-walkthrough-panel-component'

@Component({
  imports: [ArtGalleryNavigationPanelComponent, ArtGalleryCentralFieldPanelComponent, ArtGalleryHorizontalWalkthroughPanelComponent],
  selector: 'app-art-gallery-component',
  styleUrl: './art-gallery-component.scss',
  templateUrl: './art-gallery-component.html',
})
export class ArtGalleryComponent {}
