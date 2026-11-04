import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ART_GALLERY_VISITABLE_COUNTRIES } from './art-gallery-constants';
import { ArtGalleryCountryEnum } from './art-gallery-country-enum';

@Injectable({
    providedIn: 'root',
})
export class ArtGalleryService {
    private currentCountry: ArtGalleryCountryEnum;
    private currentCountrySubject: BehaviorSubject<ArtGalleryCountryEnum>;
    public currentCountryObservable: Observable<ArtGalleryCountryEnum>;

    constructor() {
        this.currentCountry = ArtGalleryCountryEnum.WORLD;
        this.currentCountrySubject = new BehaviorSubject<ArtGalleryCountryEnum>(this.currentCountry);
        this.currentCountryObservable = this.currentCountrySubject.asObservable();
    }

    public GetCurrentCountry(): ArtGalleryCountryEnum {
        return this.currentCountry;
    }

    public GoTo(destination: ArtGalleryCountryEnum): void {
        if (
            (destination === ArtGalleryCountryEnum.WORLD ||
                ART_GALLERY_VISITABLE_COUNTRIES.includes(destination)) &&
            destination !== this.currentCountry
        ) {
            this.currentCountry = destination;
            this.currentCountrySubject.next(this.currentCountry);
        }
    }

    public GoNextCountry(): void {
        const currentIndex = ART_GALLERY_VISITABLE_COUNTRIES.indexOf(this.currentCountry);
        const nextCountry = ART_GALLERY_VISITABLE_COUNTRIES[currentIndex + 1];

        if (nextCountry !== undefined) {
            this.GoTo(nextCountry);
        }
    }
}
