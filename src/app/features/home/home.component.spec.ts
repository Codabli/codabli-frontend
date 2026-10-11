import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([]), provideTranslateService()],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('fr', {
      home: {
        hero: {
          discoverTales: 'Découvrez nos contes dansés',
          createTales: 'Créez vos propres contes dansés',
        },
        universe: {
          title: 'Plongez-vous dans l’univers de Codabli',
          question: 'Qu’est-ce qu’un Conte Dansé ?',
        },
        audience: {
          title: 'À qui s’adresse-t-on ?',
          children: { title: 'Les enfants' },
          educators: { title: 'Les professionnels de l’éducation' },
          parents: { title: 'Les parents' },
        },
        news: {
          title: 'Notre actualité',
          all: 'Voir toutes les actualités',
        },
        subscriptions: { title: 'Nos abonnements' },
        shop: { title: 'Visitez également notre boutique' },
      },
    });
    translate.use('fr');

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the active home sections without the deferred sections', () => {
    const home = fixture.nativeElement as HTMLElement;
    const content = home.textContent as string;
    const heroButtons = home.querySelectorAll('.hero__action');
    const heroImage = home.querySelector('.hero__image');
    const universeImage = home.querySelector('.universe__visual img');
    const audienceImages = home.querySelectorAll(
      '.audience-card__image',
    ) as NodeListOf<HTMLImageElement>;

    expect(heroButtons).toHaveLength(4);
    expect(heroImage?.getAttribute('src')).toContain('hero-banner.jpg');
    expect(heroImage?.getAttribute('fetchpriority')).toBe('high');
    expect(heroImage?.getAttribute('width')).toBe('1440');
    expect(heroImage?.getAttribute('height')).toBe('474');
    expect(universeImage?.getAttribute('loading')).toBe('lazy');
    expect(audienceImages[0].getAttribute('loading')).toBe('lazy');
    expect(content).toContain('Découvrez nos contes dansés');
    expect(content).toContain('Créez vos propres contes dansés');
    expect(content).toContain('Plongez-vous dans l’univers de Codabli');
    expect(content).toContain('Conte Dansé');
    expect(content).toContain('À qui s’adresse-t-on');
    expect(content).toContain('Les enfants');
    expect(content).toContain('Les professionnels de l’éducation');
    expect(content).toContain('Les parents');
    expect(audienceImages).toHaveLength(3);
    expect(audienceImages[0].getAttribute('src')).toContain(
      '/audience/enfants.png',
    );
    expect(audienceImages[1].getAttribute('src')).toContain(
      '/audience/professionnels_de_l_education.png',
    );
    expect(audienceImages[2].getAttribute('src')).toContain(
      '/audience/parents.png',
    );
    expect(content).toContain('Notre actualité');
    expect(content).toContain('Voir toutes les actualités');
    expect(content).toContain('Nos abonnements');
    expect(home.querySelectorAll('.plan-card')).toHaveLength(3);
    expect(home.querySelectorAll('.plan-card__button')).toHaveLength(3);
    expect(content).toContain('Visitez également notre boutique');
    expect(home.querySelectorAll('.shop-card')).toHaveLength(12);
    expect(
      home.querySelectorAll('.shop-card[aria-hidden="true"]'),
    ).toHaveLength(8);
    expect(
      home.querySelector('.shop-card__image')?.getAttribute('src'),
    ).toContain('/assets/images/shop/bookmark_1.png');
    expect(home.querySelectorAll('.news-card')).toHaveLength(12);
    expect(
      home.querySelectorAll('.news-card[aria-hidden="true"]'),
    ).toHaveLength(8);
    expect(home.querySelectorAll('a[href]')).toHaveLength(0);
    expect(
      home.querySelectorAll('button[type="button"]').length,
    ).toBeGreaterThan(0);
    expect(content).not.toContain('Bienvenue dans l’univers Codabli');
  });
});
