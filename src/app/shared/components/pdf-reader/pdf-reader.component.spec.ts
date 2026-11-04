import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { PdfReaderComponent } from './pdf-reader.component';

describe('PdfReaderComponent', () => {
  let component: PdfReaderComponent;
  let fixture: ComponentFixture<PdfReaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfReaderComponent],
      providers: [provideTranslateService()],
    })
      // pdf.js ne tourne pas sous jsdom : le viewer est remplacé par un élément inerte.
      .overrideComponent(PdfReaderComponent, {
        remove: { imports: [NgxExtendedPdfViewerModule] },
        add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PdfReaderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('src', 'assets/conte.pdf');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate between pages within the document bounds', () => {
    component.onPdfLoaded({ pagesCount: 2 });

    component.previousPage();
    expect(component.currentPage()).toBe(1);

    component.nextPage();
    component.nextPage();
    expect(component.currentPage()).toBe(2);
  });

  it('should zoom in percent steps from the page-fit level', () => {
    component.zoomIn();
    expect(component.zoom()).toBe(125);

    component.resetZoom();
    component.zoomOut();
    expect(component.zoom()).toBe(75);
  });

  it('should keep the reader visible with an error when loading failed upstream', async () => {
    fixture.componentRef.setInput('failed', true);
    await fixture.whenStable();

    const element: HTMLElement = fixture.nativeElement;
    expect(component.hasError()).toBe(true);
    expect(element.querySelector('.pdf-toolbar')).not.toBeNull();
    expect(element.querySelector('.pdf-reader__viewer [role="alert"]')).not.toBeNull();
  });

  it('should reset the reader when the document changes', () => {
    component.onPdfLoaded({ pagesCount: 3 });
    component.nextPage();

    fixture.componentRef.setInput('src', 'assets/autre-conte.pdf');

    expect(component.currentPage()).toBe(1);
    expect(component.loading()).toBe(true);
  });
});
