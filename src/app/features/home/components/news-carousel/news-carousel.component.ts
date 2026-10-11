import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Button } from '../../../../shared/components/button/button.component';
import {
  getCenteredItemIndex,
  scrollToCenteredItem,
} from '../../../../shared/utils/centered-carousel';

@Component({
  imports: [Button],
  selector: 'app-news-carousel',
  styleUrl: './news-carousel.component.scss',
  templateUrl: './news-carousel.component.html',
})
export class NewsCarouselComponent implements AfterViewInit {
  @ViewChild('newsTrack') private newsTrack?: ElementRef<HTMLElement>;

  private readonly news = [
    {
      title: 'Les histoires prennent vie avec le Conte Dansé',
      date: 'Publiée le 10 septembre 2026',
      image: '/assets/images/news/Visuel.png',
      imageWidth: 395,
      imageHeight: 219,
    },
    {
      title: 'Place à l’imagination : inventez votre propre conte',
      date: 'Publiée le 25 janvier 2026',
      image: '/assets/images/Video.png',
      imageWidth: 608,
      imageHeight: 342,
    },
    {
      title: 'Des œuvres et des histoires à regarder autrement',
      date: 'Publiée le 23 mars 2026',
      image: '/assets/images/news/Visuel.png',
      imageWidth: 395,
      imageHeight: 219,
    },
    {
      title: 'Des idées pour faire vivre les histoires au quotidien',
      date: 'Publiée le 05 octobre 2026',
      image: '/assets/images/Video.png',
      imageWidth: 608,
      imageHeight: 342,
    },
  ];

  protected readonly originalNewsCount = this.news.length;
  protected readonly carouselNews = [...this.news, ...this.news, ...this.news];

  ngAfterViewInit(): void {
    this.scrollToCard(this.news.length, true);
  }

  protected scrollNews(direction: -1 | 1): void {
    const track = this.newsTrack?.nativeElement;
    if (!track) return;

    const currentIndex = getCenteredItemIndex(track, '.news-card');
    this.scrollToCard(currentIndex + direction);
  }

  protected onNewsScroll(): void {
    const track = this.newsTrack?.nativeElement;
    if (!track) return;

    const centeredIndex = getCenteredItemIndex(track, '.news-card');
    if (centeredIndex < this.news.length) {
      this.scrollToCard(centeredIndex + this.news.length, true);
    } else if (centeredIndex >= this.news.length * 2) {
      this.scrollToCard(centeredIndex - this.news.length, true);
    }
  }

  private scrollToCard(index: number, instant = false): void {
    const track = this.newsTrack?.nativeElement;
    if (!track) return;
    scrollToCenteredItem(track, '.news-card', index, instant);
  }
}
