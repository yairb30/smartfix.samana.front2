import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Part } from '../../shared/models/part';

@Injectable({
  providedIn: 'root'
})
export class PartService {
    private partUrl: string = 'http://localhost:8080/parts';

  constructor(private http: HttpClient) {}

  // Obtener todos los repuestos
  getParts(): Observable<Part[]> {
    return this.http.get<Part[]>(this.partUrl);
  }
  getAllPageable(page: number): Observable<any> {
    return this.http.get<any>(`${this.partUrl}/page/${page}`);
  }

  // Obtener un repuesto por ID
  getPartById(id: number): Observable<Part> {
    return this.http.get<Part>(`${this.partUrl}/${id}`);
  }

  // Crear un nuevo repuesto
  createPart(part: Part): Observable<Object> {
    return this.http.post(`${this.partUrl}`, part);
  }

  // Actualizar un repuesto
  updatePart(id: number, part: Part): Observable<Object> {
    return this.http.put(`${this.partUrl}/${id}`, part);
  }

  // Eliminar un repuesto
  deletePart(id: number): Observable<any> {
    return this.http.delete(`${this.partUrl}/${id}`, {
      responseType: 'text',
    });
  }

  // Buscar repuestos por nombre del repuesto
  getPartByName(part: string): Observable<Part[]> {
    return this.http.get<Part[]>(
      `${this.partUrl}/part?part=${part}`
    );
  }

  // Buscar repuestos por marca o modelo del celular
  getPartByPhone(phone: string): Observable<Part[]> {
    return this.http.get<Part[]>(
      `${this.partUrl}/phone?phone=${phone}`
    );
  }
}
