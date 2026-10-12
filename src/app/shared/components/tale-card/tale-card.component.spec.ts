import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaleCardComponent } from './tale-card.component';

describe('TaleCardComponent', () => {
  let component: TaleCardComponent;
  let fixture: ComponentFixture<TaleCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaleCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaleCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
