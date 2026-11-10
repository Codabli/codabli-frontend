import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FamilyAccountProfileComponent } from './family-account-profile.component';

describe('FamilyAccountProfileComponent', () => {
  let component: FamilyAccountProfileComponent;
  let fixture: ComponentFixture<FamilyAccountProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FamilyAccountProfileComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FamilyAccountProfileComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
