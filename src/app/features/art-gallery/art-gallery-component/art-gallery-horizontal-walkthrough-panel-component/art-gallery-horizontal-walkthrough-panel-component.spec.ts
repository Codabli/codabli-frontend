import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArtGalleryHorizontalWalkthroughPanelComponent } from './art-gallery-horizontal-walkthrough-panel-component';

describe('ArtGalleryHorizontalWalkthroughPanelComponent', () => {
  let component: ArtGalleryHorizontalWalkthroughPanelComponent;
  let fixture: ComponentFixture<ArtGalleryHorizontalWalkthroughPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtGalleryHorizontalWalkthroughPanelComponent],
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
});
