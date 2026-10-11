import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Button } from '../../../../shared/components/button/button.component';

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
    },
    {
      title: 'Place à l’imagination : inventez votre propre conte',
      date: 'Publiée le 25 janvier 2026',
      image: '/assets/images/Video.png',
    },
    {
      title: 'Des œuvres et des histoires à regarder autrement',
      date: 'Publiée le 23 mars 2026',
      image: '/assets/images/news/Visuel.png',
    },
    {
      title: 'Des idées pour faire vivre les histoires au quotidien',
      date: 'Publiée le 05 octobre 2026',
      image: '/assets/images/Video.png',
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

    const currentIndex = this.getCenteredCardIndex(track);
    this.scrollToCard(currentIndex + direction);
  }

  protected onNewsScroll(): void {
    const track = this.newsTrack?.nativeElement;
    if (!track) return;

    const centeredIndex = this.getCenteredCardIndex(track);
    if (centeredIndex < this.news.length) {
      this.scrollToCard(centeredIndex + this.news.length, true);
    } else if (centeredIndex >= this.news.length * 2) {
      this.scrollToCard(centeredIndex - this.news.length, true);
    }
  }

  private getCenteredCardIndex(track: HTMLElement): number {
    const trackCenter =
      track.getBoundingClientRect().left + track.clientWidth / 2;
    const cards = track.querySelectorAll<HTMLElement>('.news-card');
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const bounds = card.getBoundingClientRect();
      const distance = Math.abs(bounds.left + bounds.width / 2 - trackCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  }

  private scrollToCard(index: number, instant = false): void {
    const track = this.newsTrack?.nativeElement;
    const card = track?.querySelectorAll<HTMLElement>('.news-card')[index];
    if (!track || !card) return;

    const trackCenter =
      track.getBoundingClientRect().left + track.clientWidth / 2;
    const bounds = card.getBoundingClientRect();
    const cardCenter = bounds.left + bounds.width / 2;
    const target = track.scrollLeft + cardCenter - trackCenter;

    if (instant) {
      const previousScrollBehavior = track.style.scrollBehavior;
      track.style.scrollBehavior = 'auto';
      track.scrollLeft = target;
      track.style.scrollBehavior = previousScrollBehavior;
    } else {
      track.scrollTo({ left: target });
    }
  }
}
