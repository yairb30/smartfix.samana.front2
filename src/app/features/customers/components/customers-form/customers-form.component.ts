import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../../services/customers.service';
import { Customer } from '../../../../shared/models/customer';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-customers-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './customers-form.component.html',
  styleUrl: './customers-form.component.css'
})
export class CustomersFormComponent implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customerService = inject(CustomerService);

  form!: FormGroup;
  customerId!: number;
  isEditMode = false;

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      phone: ['',],
      email: ['',],
    });

    // Detectar si se trata de edición
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.customerId = +idParam;
        this.isEditMode = true;
        this.customerService.getCustomerById(this.customerId).subscribe(customer => {
          if (customer) {
            this.form.patchValue(customer);
          }
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const customer: Customer = this.form.value;

    if (this.isEditMode && this.customerId != null) {
      this.customerService.updateCustomer(this.customerId, customer).subscribe(() => {
        Swal.fire({
          icon: 'success',
          title: 'Cliente actualizado',
          text: 'El cliente se ha actualizado correctamente.'
        });
        this.router.navigate(['/dashboard/customers']);
      });
    } else {
      this.customerService.createCustomer(customer).subscribe(() => {
        Swal.fire({
          icon: 'success',
          title: 'Cliente agregado',
          text: 'El cliente se ha agregado correctamente.'
        });
        this.router.navigate(['/dashboard/customers']);
      });
    }
  }
  cancel(): void{
    this.router.navigate(['/dashboard/customers'])
  }

}
