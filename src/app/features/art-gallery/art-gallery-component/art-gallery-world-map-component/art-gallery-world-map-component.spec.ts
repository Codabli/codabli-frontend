import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArtGalleryWorldMapComponent } from './art-gallery-world-map-component';

describe('ArtGalleryWorldMapComponent', () => {
  let component: ArtGalleryWorldMapComponent;
  let fixture: ComponentFixture<ArtGalleryWorldMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtGalleryWorldMapComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtGalleryWorldMapComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
