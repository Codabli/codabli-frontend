import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArtGalleryHotspotComponent } from './art-gallery-hotspot-component';

describe('ArtGalleryHotspotComponent', () => {
  let component: ArtGalleryHotspotComponent;
  let fixture: ComponentFixture<ArtGalleryHotspotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtGalleryHotspotComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtGalleryHotspotComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('hotspotId', '1');
    fixture.componentRef.setInput('imageUrl', '/assets/test-hotspot.png');
    fixture.componentRef.setInput('text', 'A historic neighborhood.');
    fixture.componentRef.setInput('x', 25);
    fixture.componentRef.setInput('y', 60);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it.todo('places an accessible button at the configured position');
  it.todo('shows the hotspot information when clicked');
});
