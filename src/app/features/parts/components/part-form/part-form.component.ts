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
import Swal from 'sweetalert2';

@Component({
  selector: 'app-part-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
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

  phones: Phone[] = [];
  partsCatalog: PartCatalog[] = [];

  ngOnInit(): void {
    this.form = this.fb.group({
      phoneId: [null, Validators.required],
      partCatalogId: ['', Validators.required],
    });

    // Cargar celulares y repuestos del catálogo
    this.phoneService.getPhones().subscribe((data) => (this.phones = data));
    this.partCatalogService
      .getPartsCatalog()
      .subscribe((data) => (this.partsCatalog = data));

    // Modo edición
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.partId = +idParam;
        this.isEditMode = true;
        this.partService.getPartById(this.partId).subscribe((part) => {
          if (part) {
            this.form.patchValue({
              phoneId: part.phone.id,
              partCatalogId: part.partCatalog.id,
            });
          }
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const partDto = this.form.value;

    if (this.isEditMode && this.partId != null) {
      this.partService.updatePart(this.partId, partDto).subscribe(() => {
        Swal.fire({
          icon: 'success',
          title: 'Repuesto actualizado',
          text: 'El repuesto se ha actualizado correctamente.',
        });
        this.router.navigate(['/dashboard/parts']);
      });
    } else {
      this.partService.createPart(partDto).subscribe(() => {
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
}
