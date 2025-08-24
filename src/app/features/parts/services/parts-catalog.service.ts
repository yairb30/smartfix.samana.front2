import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PartCatalog } from '../../../shared/models/part-catalog';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PartCatalogService {

  private partCatalogUrl = `${environment.apiUrl}/parts_catalog`;

  constructor(private http: HttpClient) { }

  getPartsCatalog(): Observable<PartCatalog[]> {
    return this.http.get<PartCatalog[]>(this.partCatalogUrl);
  }
  getPartCatalogById(id: number): Observable<PartCatalog> {
    return this.http.get<PartCatalog>(`${this.partCatalogUrl}/${id}`);
  }

}
