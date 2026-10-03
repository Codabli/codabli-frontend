import { Component } from '@angular/core';
import { AudienceGridComponent } from './components/audience-grid/audience-grid.component';
import { CodabliUniverseComponent } from './components/codabli-universe/codabli-universe.component';
import { NewsCarouselComponent } from './components/news-carousel/news-carousel.component';

@Component({
  imports: [
    CodabliUniverseComponent,
    AudienceGridComponent,
    NewsCarouselComponent,
  ],
  selector: 'app-home',
  styleUrl: './home.component.scss',
  templateUrl: './home.component.html',
})
export class HomeComponent {}
