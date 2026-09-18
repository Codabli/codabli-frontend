import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LanguageFlag } from './language-flag.component';

describe('LanguageFlag', () => {
  let component: LanguageFlag;
  let fixture: ComponentFixture<LanguageFlag>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageFlag],
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageFlag);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
