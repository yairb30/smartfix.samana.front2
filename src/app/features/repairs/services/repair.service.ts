import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Repair } from '../../../shared/models/repair';

@Injectable({
  providedIn: 'root'
})
export class RepairService {

  private repairUrl: string = 'http://localhost:8080/repairs';

  constructor(private http: HttpClient) {}

  getCountRepairs(): Observable<number> {
    return this.http.get<number>(`${this.repairUrl}/count`);
  }

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
  getRepairsPage(page: number, keyword: string = ''): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('keyword', keyword.trim());

    return this.http.get<any>(`${this.repairUrl}/search`, { params });
  }
}
