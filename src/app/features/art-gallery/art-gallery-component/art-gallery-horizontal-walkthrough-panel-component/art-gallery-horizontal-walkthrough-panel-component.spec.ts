import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ArtGalleryHotspotService } from '../../art-gallery-hotspot-service';
import { ArtGalleryHorizontalWalkthroughPanelComponent } from './art-gallery-horizontal-walkthrough-panel-component';

describe('ArtGalleryHorizontalWalkthroughPanelComponent', () => {
  let component: ArtGalleryHorizontalWalkthroughPanelComponent;
  let fixture: ComponentFixture<ArtGalleryHorizontalWalkthroughPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtGalleryHorizontalWalkthroughPanelComponent],
      providers: [
        provideTranslateService(),
        // Hotspot data comes from json-server; tests must not depend on it.
        {
          provide: ArtGalleryHotspotService,
          useValue: { getHotspot: () => Promise.resolve(undefined) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(
      ArtGalleryHorizontalWalkthroughPanelComponent,
    );
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it.todo('updates the shared room and active state when a room is selected');
});
