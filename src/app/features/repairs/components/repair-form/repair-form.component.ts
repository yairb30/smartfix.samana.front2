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
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { LoadingService } from '../../../../shared/services/loading.service';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-repair-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, SpinnerComponent],
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
  private loadingService = inject(LoadingService);

  form!: FormGroup;
  repairId!: number;
  isEditMode = false;
  isLoading = false;
  isLoadingData = false;
  isSubmitting = false;
  
  customers: Customer[] = [];
  phones: Phone[] = [];

  // Estados de reparación disponibles
  repairStates = [
    { value: 'Pendiente', label: 'Pendiente', color: '#f59e0b' },
    { value: 'En Proceso', label: 'En Proceso', color: '#3b82f6' },
    { value: 'Completado', label: 'Completado', color: '#10b981' },
    { value: 'Entregado', label: 'Entregado', color: '#6366f1' },
    { value: 'Cancelado', label: 'Cancelado', color: '#ef4444' }
  ];

  ngOnInit(): void {
    this.form = this.fb.group({
      customerId: [null, Validators.required],
      phoneId: [null, Validators.required],
      fault: ['', Validators.required],
      state: ['', Validators.required],
      date: ['', Validators.required],
    });

    // Cargar datos iniciales
    this.loadInitialData();

    // Modo edición
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.repairId = +idParam;
        this.isEditMode = true;
        this.loadRepairData();
      }
    });
  }

  private loadInitialData(): void {
    this.isLoadingData = true;
    
    // Cargar clientes y celulares simultáneamente
    forkJoin({
      customers: this.customerService.getCustomers(),
      phones: this.phoneService.getPhones()
    })
    .pipe(finalize(() => this.isLoadingData = false))
    .subscribe({
      next: ({ customers, phones }) => {
        this.customers = customers;
        this.phones = phones;
      },
      error: (error) => {
        console.error('Error loading initial data:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar los datos iniciales'
        });
      }
    });
  }

  private loadRepairData(): void {
    this.isLoading = true;
    this.repairService.getRepairById(this.repairId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (repair) => {
          if (repair) {
            this.form.patchValue({
              customerId: repair.customer.id,
              phoneId: repair.phone.id,
              fault: repair.fault,
              state: repair.state,
              date: repair.date,
            });
          }
        },
        error: (error) => {
          console.error('Error loading repair data:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al cargar los datos de la reparación'
          });
        }
      });
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) return;

    const repairDto = this.form.value;
    this.isSubmitting = true;

    if (this.isEditMode && this.repairId != null) {
      this.repairService
        .updateRepair(this.repairId, repairDto)
        .pipe(finalize(() => this.isSubmitting = false))
        .subscribe(() => {
          Swal.fire({
            icon: 'success',
            title: 'Reparación actualizada',
            text: 'La reparación se ha actualizado correctamente.',
          });
          this.router.navigate(['/dashboard/repairs']);
        });
    } else {
      this.repairService.createRepair(repairDto)
        .pipe(finalize(() => this.isSubmitting = false))
        .subscribe(() => {
          Swal.fire({
            icon: 'success',
            title: 'Reparación agregada',
            text: 'La reparación se ha agregado correctamente.',
          });
          this.router.navigate(['/dashboard/repairs']);
        });
    }
  }

  cancel(): void {
    this.router.navigate(['/dashboard/repairs']);
  }

  // Métodos helper para el template
  getSelectedCustomer(): Customer | undefined {
    const customerId = this.form.get('customerId')?.value;
    return this.customers.find((customer) => customer.id === customerId);
  }

  getSelectedPhone(): Phone | undefined {
    const phoneId = this.form.get('phoneId')?.value;
    return this.phones.find((phone) => phone.id === phoneId);
  }

  getSelectedState(): any {
    const state = this.form.get('state')?.value;
    return this.repairStates.find((s) => s.value === state);
  }

  get isFormReady(): boolean {
    return !this.isLoadingData && this.customers.length > 0 && this.phones.length > 0;
  }

  get todayDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
