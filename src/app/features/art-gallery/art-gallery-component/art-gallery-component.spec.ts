import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArtGalleryComponent } from './art-gallery-component';

describe('ArtGalleryComponent', () => {
  let component: ArtGalleryComponent;
  let fixture: ComponentFixture<ArtGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtGalleryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtGalleryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
