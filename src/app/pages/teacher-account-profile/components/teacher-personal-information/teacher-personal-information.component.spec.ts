import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeacherPersonalInformationComponent } from './teacher-personal-information.component';

describe('TeacherPersonalInformationComponent', () => {
  let component: TeacherPersonalInformationComponent;
  let fixture: ComponentFixture<TeacherPersonalInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherPersonalInformationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherPersonalInformationComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
