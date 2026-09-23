import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaleCard } from './tale-card.component';

describe('TaleCard', () => {
  let component: TaleCard;
  let fixture: ComponentFixture<TaleCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaleCard],
    }).compileComponents();

    fixture = TestBed.createComponent(TaleCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
