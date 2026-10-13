import { Component } from '@angular/core';
import { AudienceGridComponent } from './components/audience-grid/audience-grid.component';
import { CodabliUniverseComponent } from './components/codabli-universe/codabli-universe.component';
import { HeroBannerComponent } from './components/hero-banner/hero-banner.component';
import { NewsCarouselComponent } from './components/news-carousel/news-carousel.component';
import { ShopPreviewComponent } from './components/shop-preview/shop-preview.component';
import { SubscriptionPlansComponent } from '../subscriptions/components/subscription-plans/subscription-plans.component';

@Component({
  imports: [
    HeroBannerComponent,
    CodabliUniverseComponent,
    AudienceGridComponent,
    SubscriptionPlansComponent,
    NewsCarouselComponent,
    ShopPreviewComponent,
  ],
  selector: 'app-home',
  styleUrl: './home.component.scss',
  templateUrl: './home.component.html',
})
export class HomeComponent {}
