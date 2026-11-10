import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeacherSubscriptionComponent } from './teacher-subscription.component';

describe('TeacherSubscriptionComponent', () => {
  let component: TeacherSubscriptionComponent;
  let fixture: ComponentFixture<TeacherSubscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherSubscriptionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherSubscriptionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
