import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaleDetailComponent } from './tale-detail.component';

describe('TaleDetailComponent', () => {
  let component: TaleDetailComponent;
  let fixture: ComponentFixture<TaleDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaleDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaleDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
