import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PartCatalog } from '../../../shared/models/part-catalog';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PartCatalogService {

  private partCatalogUrl: string = 'http://localhost:8080/parts_catalog';

  constructor(private http: HttpClient) { }

  getPartsCatalog(): Observable<PartCatalog[]> {
    return this.http.get<PartCatalog[]>(this.partCatalogUrl);
  }
  getPartCatalogById(id: number): Observable<PartCatalog> {
    return this.http.get<PartCatalog>(`${this.partCatalogUrl}/${id}`);
  }

}
