import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([])],
    }).compileComponents();

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
    const audienceImages = home.querySelectorAll(
      '.audience-card__image',
    ) as NodeListOf<HTMLImageElement>;

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
    expect(home.querySelectorAll('.news-card')).toHaveLength(4);
    expect(home.querySelectorAll('a[href]')).toHaveLength(0);
    expect(
      home.querySelectorAll('button[type="button"]').length,
    ).toBeGreaterThan(0);
    expect(content).not.toContain('Bienvenue dans l’univers Codabli');
    expect(content).not.toContain('Nos abonnements');
    expect(content).not.toContain('Visitez également notre boutique');
  });
});
