import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Phone } from '../../shared/models/phone';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PhoneService {
  private phoneUrl: string = 'http://localhost:8080/phones';

  constructor(private http: HttpClient) {}

  getPhones(): Observable<Phone[]> {
    return this.http.get<Phone[]>(this.phoneUrl);
  }
  getPhoneById(id: number): Observable<Phone> {
    return this.http.get<Phone>(`${this.phoneUrl}/${id}`);
  }
  createPhone(phone: Phone): Observable<Object> {
    return this.http.post(`${this.phoneUrl}`, phone);
  }
  updatePhone(id: number, phone: Phone): Observable<object> {
    return this.http.put(`${this.phoneUrl}/${id}`, phone);
  }
  deletePhone(id: number): Observable<any> {
    return this.http.delete(`${this.phoneUrl}/${id}`, {
      responseType: 'text',
    });
  }
}
