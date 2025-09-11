import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PartService } from '../../services/parts.service';
import { PartCatalogService } from '../../services/parts-catalog.service';
import { PhoneService } from '../../../phones/services/phone.service';
import { Phone } from '../../../../shared/models/phone';
import { PartCatalog } from '../../../../shared/models/part-catalog';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-part-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, SpinnerComponent],
  templateUrl: './part-form.component.html',
  styleUrl: './part-form.component.css',
})
export class PartFormComponent {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private partService = inject(PartService);
  private phoneService = inject(PhoneService);
  private partCatalogService = inject(PartCatalogService);

  form!: FormGroup;
  partId!: number;
  isEditMode = false;
  isLoading = false;
  isLoadingData = false;
  isSubmitting = false;

  phones: Phone[] = [];
  partsCatalog: PartCatalog[] = [];

  ngOnInit(): void {
    this.form = this.fb.group({
      phoneId: [null, Validators.required],
      partCatalogId: ['', Validators.required],
    });

    // Cargar datos iniciales
    this.loadInitialData();

    // Modo edición
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.partId = +idParam;
        this.isEditMode = true;
        this.loadPartData();
      }
    });
  }

  private loadInitialData(): void {
    this.isLoadingData = true;
    
    // Cargar celulares y repuestos del catálogo simultáneamente
    forkJoin({
      phones: this.phoneService.getPhones(),
      partsCatalog: this.partCatalogService.getPartsCatalog()
    })
    .pipe(finalize(() => this.isLoadingData = false))
    .subscribe({
      next: ({ phones, partsCatalog }) => {
        this.phones = phones;
        this.partsCatalog = partsCatalog;
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

  private loadPartData(): void {
    this.isLoading = true;
    this.partService.getPartById(this.partId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (part) => {
          if (part) {
            this.form.patchValue({
              phoneId: part.phone.id,
              partCatalogId: part.partCatalog.id,
            });
          }
        },
        error: (error) => {
          console.error('Error loading part data:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al cargar los datos del repuesto'
          });
        }
      });
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) return;

    const partDto = this.form.value;
    this.isSubmitting = true;

    if (this.isEditMode && this.partId != null) {
      this.partService.updatePart(this.partId, partDto)
        .pipe(finalize(() => this.isSubmitting = false))
        .subscribe(() => {
          Swal.fire({
            icon: 'success',
            title: 'Repuesto actualizado',
            text: 'El repuesto se ha actualizado correctamente.',
          });
          this.router.navigate(['/dashboard/parts']);
        });
    } else {
      this.partService.createPart(partDto)
        .pipe(finalize(() => this.isSubmitting = false))
        .subscribe(() => {
          Swal.fire({
            icon: 'success',
            title: 'Repuesto agregado',
            text: 'El repuesto se ha agregado correctamente.',
          });
          this.router.navigate(['/dashboard/parts']);
        });
    }
  }

  cancel(): void {
    this.router.navigate(['/dashboard/parts']);
  }

  // Métodos helper para el template
  getSelectedPhone(): Phone | undefined {
    const phoneId = this.form.get('phoneId')?.value;
    return this.phones.find((phone) => phone.id === phoneId);
  }

  getSelectedPart(): PartCatalog | undefined {
    const partCatalogId = this.form.get('partCatalogId')?.value;
    return this.partsCatalog.find((part) => part.id === partCatalogId);
  }

  get isFormReady(): boolean {
    return !this.isLoadingData && this.phones.length > 0 && this.partsCatalog.length > 0;
  }
}
