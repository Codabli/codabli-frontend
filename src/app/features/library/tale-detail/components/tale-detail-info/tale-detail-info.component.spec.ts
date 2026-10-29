import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaleDetailInfoComponent } from './tale-detail-info.component';

describe('TaleDetailInfoComponent', () => {
  let component: TaleDetailInfoComponent;
  let fixture: ComponentFixture<TaleDetailInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaleDetailInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaleDetailInfoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
