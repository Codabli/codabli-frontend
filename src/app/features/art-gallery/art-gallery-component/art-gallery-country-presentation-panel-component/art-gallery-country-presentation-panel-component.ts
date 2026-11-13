import { Component, inject, effect, signal, WritableSignal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ArtGalleryService } from '../../art-gallery-service';
import {ArtGalleryHotspotService} from '../../art-gallery-hotspot-service';
import { ArtGalleryPresentationModel } from '../../models/art-gallery-presentation-model';

@Component({
  imports: [TranslatePipe],
  selector: 'app-art-gallery-country-presentation-panel-component',
  styleUrl: './art-gallery-country-presentation-panel-component.scss',
  templateUrl: './art-gallery-country-presentation-panel-component.html',
})
export class ArtGalleryCountryPresentationPanelComponent {
  private readonly artGalleryService: ArtGalleryService;
  private readonly artGalleryHotspotService: ArtGalleryHotspotService;

  title: WritableSignal<string | undefined>;
  introduction: WritableSignal<string | undefined>;

  constructor() {
    this.artGalleryService = inject(ArtGalleryService);
    this.artGalleryHotspotService = inject(ArtGalleryHotspotService);

    this.title = signal(undefined);
    this.introduction = signal(undefined);

    effect(() => {
      this.artGalleryHotspotService.getPresentation(this.artGalleryService.getCurrentCountry()).then((serviceResult: ArtGalleryPresentationModel | undefined) => {
        this.title.set(serviceResult?.title);
        this.introduction.set(serviceResult?.introduction);
      })
    });
  }
}
