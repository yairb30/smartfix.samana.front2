import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Customer } from '../../../shared/models/customer';


@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private customertUrl: string = 'http://localhost:8080/customers';

  constructor(private http: HttpClient) {}

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.customertUrl);
  }
   
  getCustomertById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.customertUrl}/${id}`);
  }
  createCustomer(customer: Customer): Observable<Object> {
    return this.http.post(`${this.customertUrl}`, customer);
  }
  updateCustomer(id: number, customer: Customer): Observable<object> {
    return this.http.put(`${this.customertUrl}/${id}`, customer);
  }
  deleteCustomer(id: number) {
    return this.http.delete(`${this.customertUrl}/${id}`, {
      responseType: 'text',
    });
  }
}
