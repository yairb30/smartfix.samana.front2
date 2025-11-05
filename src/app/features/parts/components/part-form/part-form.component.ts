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
import { AutocompleteComponent } from '../../../../shared/components/autocomplete/autocomplete.component';
import { forkJoin, of } from 'rxjs';
import { finalize, map } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-part-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, SpinnerComponent, AutocompleteComponent],
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

  selectedPhone: Phone | null = null;
  selectedPartCatalog: PartCatalog | null = null;
  partsCatalog: PartCatalog[] = [];

  ngOnInit(): void {
    this.form = this.fb.group({
      phoneId: [null, Validators.required],
      partCatalogId: ['', Validators.required],
    });

    // Cargar catálogo de repuestos
    this.loadPartsCatalog();

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

  // Load parts catalog for dropdown/search
  private loadPartsCatalog(): void {
    this.isLoadingData = true;

    this.partCatalogService.getPartsCatalog()
      .pipe(finalize(() => this.isLoadingData = false))
      .subscribe({
        next: (partsCatalog) => {
          this.partsCatalog = partsCatalog;
        },
        error: (error) => {
          console.error('Error loading parts catalog:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al cargar el catálogo de repuestos'
          });
        }
      });
  }

  // Search function for phones autocomplete
  searchPhones = (keyword: string) => {
    return this.phoneService.getPhonesPage(0, keyword);
  };

  // Format display for phone
  formatPhoneDisplay = (phone: Phone) => {
    return `${phone.brand} ${phone.model}`;
  };

  // Handle phone selection
  onPhoneSelected(phone: Phone | null): void {
    this.selectedPhone = phone;
    this.form.patchValue({ phoneId: phone?.id || null });
  }

  // Handle part catalog selection
  onPartCatalogSelected(event: any): void {
    const partCatalogId = event.target.value;
    const selected = this.partsCatalog.find(p => p.id === +partCatalogId);
    this.selectedPartCatalog = selected || null;
    this.form.patchValue({ partCatalogId: partCatalogId });
  }

  private loadPartData(): void {
    this.isLoading = true;
    this.partService.getPartById(this.partId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (part) => {
          if (part) {
            // Set selected items for display
            this.selectedPhone = part.phone;
            this.selectedPartCatalog = part.partCatalog;

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
  getSelectedPhone(): Phone | null {
    return this.selectedPhone;
  }

  getSelectedPart(): PartCatalog | null {
    return this.selectedPartCatalog;
  }

  get isFormReady(): boolean {
    return !this.isLoadingData && !this.isLoading && this.partsCatalog.length > 0;
  }
}
