import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RepairService } from '../../services/repair.service';
import { CustomerService } from '../../../customers/services/customers.service';
import { PhoneService } from '../../../phones/services/phone.service';
import { Customer } from '../../../../shared/models/customer';
import { Phone } from '../../../../shared/models/phone';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-repair-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './repair-form.component.html',
  styleUrl: './repair-form.component.css',
})
export class RepairFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private repairService = inject(RepairService);
  private customerService = inject(CustomerService);
  private phoneService = inject(PhoneService);

  form!: FormGroup;
  repairId!: number;
  isEditMode = false;
  customers: Customer[] = [];
  phones: Phone[] = [];
  MM: any;

  ngOnInit(): void {
    this.form = this.fb.group({
      customerId: [null, Validators.required],
      phoneId: [null, Validators.required],
      fault: ['', Validators.required],
      state: ['', Validators.required],
      date: ['', Validators.required],
    });

    // Cargar clientes y celulares
    this.customerService
      .getCustomers()
      .subscribe((data) => (this.customers = data));
    this.phoneService.getPhones().subscribe((data) => (this.phones = data));

    // Modo edición
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.repairId = +idParam;
        this.isEditMode = true;
        this.repairService.getRepairById(this.repairId).subscribe((repair) => {
          if (repair) {
            this.form.patchValue({
              customerId: repair.customer.id,
              phoneId: repair.phone.id,
              fault: repair.fault,
              state: repair.state,
              date: repair.date,
            });
          }
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const repairDto = this.form.value;

    if (this.isEditMode && this.repairId != null) {
      this.repairService
        .updateRepair(this.repairId, repairDto)
        .subscribe(() => {
          Swal.fire({
            icon: 'success',
            title: 'Reparación actualizada',
            text: 'La reparación se ha actualizado correctamente.',
          });
          this.router.navigate(['/dashboard/repairs']);
        });
    } else {
      this.repairService.createRepair(repairDto).subscribe(() => {
        Swal.fire({
          icon: 'success',
          title: 'Reparación agregada',
          text: 'La reparación se ha agregado correctamente.',
        });
        this.router.navigate(['/dashboard/repairs']);
      });
    }
  }
  cancel(): void{
    this.router.navigate(['/dashboard/repairs'])
  }
}
