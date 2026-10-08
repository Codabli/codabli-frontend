import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { apiInterceptor } from '../http/api.interceptor';
import { ActualiteService } from './actualite.service';
import { GalerieArtsService } from './galerie-arts.service';
import { PartenaireService } from './partenaire.service';
import { ProduitService } from './produit.service';
import { RechercheService } from './recherche.service';

describe('Services API publics', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([apiInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('ActualiteService : liste paginée et détail', () => {
    const service = TestBed.inject(ActualiteService);

    service.lister({ page: 1, size: 5 }).subscribe();
    const liste = http.expectOne((r) => r.url === '/api/actualites');
    expect(liste.request.params.get('page')).toBe('1');
    expect(liste.request.params.get('size')).toBe('5');
    liste.flush({ content: [] });

    service.getById('a1').subscribe();
    http.expectOne('/api/actualites/a1').flush({});
  });

  it('PartenaireService : filtre par catégorie', () => {
    TestBed.inject(PartenaireService).lister({ categorie: 'culturel' }).subscribe();

    const req = http.expectOne((r) => r.url === '/api/partenaires');
    expect(req.request.params.get('categorie')).toBe('culturel');
    req.flush({ content: [] });
  });

  it('ProduitService : filtre par type et actif', () => {
    TestBed.inject(ProduitService).lister({ type: 'produit_physique', actif: true }).subscribe();

    const req = http.expectOne((r) => r.url === '/api/produits');
    expect(req.request.params.get('type')).toBe('produit_physique');
    expect(req.request.params.get('actif')).toBe('true');
    req.flush({ content: [] });
  });

  it('GalerieArtsService : salles et détail', () => {
    const service = TestBed.inject(GalerieArtsService);

    service.listerSalles().subscribe();
    http.expectOne('/api/galerie-arts/salles').flush([]);

    service.getSalle('s1').subscribe();
    http.expectOne('/api/galerie-arts/salles/s1').flush({});
  });

  it('RechercheService : envoie q et la pagination', () => {
    TestBed.inject(RechercheService).rechercher('lune', { size: 3 }).subscribe();

    const req = http.expectOne((r) => r.url === '/api/recherche');
    expect(req.request.params.get('q')).toBe('lune');
    expect(req.request.params.get('size')).toBe('3');
    req.flush({});
  });
});
