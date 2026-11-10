import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeacherProfileSidebarComponent } from './teacher-profile-sidebar.component';

describe('TeacherProfileSidebarComponent', () => {
  let component: TeacherProfileSidebarComponent;
  let fixture: ComponentFixture<TeacherProfileSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherProfileSidebarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherProfileSidebarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
