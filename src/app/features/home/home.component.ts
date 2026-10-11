import { Component } from '@angular/core';
import { AudienceGridComponent } from './components/audience-grid/audience-grid.component';
import { CodabliUniverseComponent } from './components/codabli-universe/codabli-universe.component';
import { NewsCarouselComponent } from './components/news-carousel/news-carousel.component';
import { SubscriptionPlansComponent } from '../subscriptions/components/subscription-plans/subscription-plans.component';

@Component({
  imports: [
    CodabliUniverseComponent,
    AudienceGridComponent,
    SubscriptionPlansComponent,
    NewsCarouselComponent,
  ],
  selector: 'app-home',
  styleUrl: './home.component.scss',
  templateUrl: './home.component.html',
})
export class HomeComponent {}
