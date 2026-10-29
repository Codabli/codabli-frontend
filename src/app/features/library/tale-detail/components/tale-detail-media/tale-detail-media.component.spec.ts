import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaleDetailMediaComponent } from './tale-detail-media.component';

describe('TaleDetailMediaComponent', () => {
  let component: TaleDetailMediaComponent;
  let fixture: ComponentFixture<TaleDetailMediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaleDetailMediaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaleDetailMediaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
