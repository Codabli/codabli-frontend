import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { School } from '../../models/interfaces/school.interface';

@Injectable({ providedIn: 'root' })
export class SchoolService {
  private readonly http = inject(HttpClient);

  getSchools(): Observable<School[]> {
    return this.http.get<School[]>('/api/ecoles');
  }
}
