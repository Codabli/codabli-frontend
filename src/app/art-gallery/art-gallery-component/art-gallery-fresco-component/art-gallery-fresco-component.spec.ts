import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArtGalleryFrescoComponent } from './art-gallery-fresco-component';

describe('ArtGalleryFrescoComponent', () => {
  let component: ArtGalleryFrescoComponent;
  let fixture: ComponentFixture<ArtGalleryFrescoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtGalleryFrescoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtGalleryFrescoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
