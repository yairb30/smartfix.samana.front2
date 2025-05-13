import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Repair } from '../../shared/models/repair';

@Injectable({
  providedIn: 'root'
})
export class RepairService {

  private repairUrl: string = 'http://localhost:8080/repairs';

  constructor(private http: HttpClient) {}

  getRepairs(): Observable<Repair[]> {
    return this.http.get<Repair[]>(this.repairUrl);
  }
 
  getRepairById(id: number): Observable<Repair> {
    return this.http.get<Repair>(`${this.repairUrl}/${id}`);
  }
  createRepair(repair: Repair): Observable<Object> {
    return this.http.post(`${this.repairUrl}`, repair);
  }
  updateRepair(id: number, repair: Repair): Observable<object> {
    return this.http.put(`${this.repairUrl}/${id}`, repair);
  }
  deleteRepair(id: number): Observable<any> {
    return this.http.delete(`${this.repairUrl}/${id}`, {
      responseType: 'text',
    });
  }
  // Buscar reparacion por nombre o apellido del cliente
  getRepairByCustomer(customer: string): Observable<Repair[]> {
    return this.http.get<Repair[]>(
      `${this.repairUrl}/customer?customer=${customer}`
    );
  }

  // Buscar repuestos por marca o modelo del celular
  getRepairByPhone(phone: string): Observable<Repair[]> {
    return this.http.get<Repair[]>(
      `${this.repairUrl}/phone?phone=${phone}`
    );
  }
}
