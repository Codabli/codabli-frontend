import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeacherAccountProfileComponent } from './teacher-account-profile.component';

describe('TeacherAccountProfileComponent', () => {
  let component: TeacherAccountProfileComponent;
  let fixture: ComponentFixture<TeacherAccountProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherAccountProfileComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherAccountProfileComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
