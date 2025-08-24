import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Part } from '../../../shared/models/part';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PartService {
  private partUrl = `${environment.apiUrl}/parts`;

  constructor(private http: HttpClient) {}

  getCountParts(): Observable<number> {
    return this.http.get<number>(`${this.partUrl}/count`);
  }

  // ✅ Obtener todos los repuestos (sin paginación, no recomendado si hay muchos datos)
  getParts(): Observable<Part[]> {
    return this.http.get<Part[]>(this.partUrl);
  }

  // ✅ Obtener un repuesto por ID
  getPartById(id: number): Observable<Part> {
    return this.http.get<Part>(`${this.partUrl}/${id}`);
  }

  // ✅ Crear un nuevo repuesto
  createPart(part: Part): Observable<Object> {
    return this.http.post(`${this.partUrl}`, part);
  }

  // ✅ Actualizar un repuesto
  updatePart(id: number, part: Part): Observable<Object> {
    return this.http.put(`${this.partUrl}/${id}`, part);
  }

  // ✅ Eliminar un repuesto
  deletePart(id: number): Observable<any> {
    return this.http.delete(`${this.partUrl}/${id}`, {
      responseType: 'text',
    });
  }
   // ✅ Obtener repuestos paginados con búsqueda opcional
  getPartsPage(page: number, keyword: string = ''): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('keyword', keyword.trim());

    return this.http.get<any>(`${this.partUrl}/search`, { params });
  }
}
