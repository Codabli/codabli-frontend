import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { DanceLibrary } from './dance-library.component';
import { DANCE_CATALOG } from './dance-catalog';

describe('DanceLibrary', () => {
  let fixture: ComponentFixture<DanceLibrary>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DanceLibrary],
      providers: [provideTranslateService()],
    }).compileComponents();

    TestBed.inject(TranslateService).setTranslation('fr', {
      createDancedTale: {
        dances: {
          catalog: {
            festiveRound: { name: 'Ronde festive', description: 'Danse collective en cercle.' },
            dream: { name: 'Danse du rêve', description: 'Mouvements lents.' },
          },
        },
      },
    });
    TestBed.inject(TranslateService).use('fr');

    fixture = TestBed.createComponent(DanceLibrary);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  function cards(): HTMLElement[] {
    return Array.from(element.querySelectorAll<HTMLElement>('li.dance-card'));
  }

  function choose(id: string, value: string): void {
    const select = element.querySelector<HTMLSelectElement>(`#${id}`)!;
    select.value = value;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  it('affiche tout le catalogue', () => {
    expect(cards()).toHaveLength(DANCE_CATALOG.length);
  });

  it('filtre par format et par intensité', () => {
    choose('dance-format', 'solo');
    expect(cards()).toHaveLength(DANCE_CATALOG.filter((dance) => dance.format === 'solo').length);

    choose('dance-intensity', 'gentle');
    expect(cards()).toHaveLength(
      DANCE_CATALOG.filter((dance) => dance.format === 'solo' && dance.intensity === 'gentle').length,
    );

    choose('dance-format', '');
    choose('dance-intensity', '');
    expect(cards()).toHaveLength(DANCE_CATALOG.length);
  });

  it('recherche dans le nom et la description, sans tenir compte des accents', () => {
    const search = element.querySelector<HTMLInputElement>('#dance-search')!;

    search.value = 'REVE';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(cards().map((card) => card.querySelector('.dance-card__name')!.textContent!.trim())).toEqual([
      'Danse du rêve',
    ]);

    search.value = 'cercle';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(cards()).toHaveLength(1);
  });

  it('indique quand aucune danse ne correspond', () => {
    const search = element.querySelector<HTMLInputElement>('#dance-search')!;

    search.value = 'zzz';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(cards()).toHaveLength(0);
    expect(element.querySelector('.library__empty')).not.toBeNull();
  });
});
