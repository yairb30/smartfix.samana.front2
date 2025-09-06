import { Component, inject } from '@angular/core';
import { PartService } from '../../services/parts.service';
import { Router, RouterModule } from '@angular/router';
import { Part } from '../../../../shared/models/part';
import { Customer } from '../../../../shared/models/customer';
import { Phone } from '../../../../shared/models/phone';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-part',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    PaginationComponent,
  ],
  templateUrl: './part-list.component.html',
  styleUrl: './part-list.component.css',
})
export class PartListComponent {
  private partService = inject(PartService);
  private router = inject(Router);
  private authService = inject(AuthService);

  parts!: Part[];
  customers!: Customer[];
  phones!: Phone[];

  searchControl = new FormControl('');
  currentPage = 0;
  totalPages = 0;

  ngOnInit(): void {
    // Búsqueda reactiva
    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.currentPage = 0)), // reset página con cada búsqueda
        switchMap((keyword) =>
          this.partService.getPartsPage(this.currentPage, keyword || '')
        )
      )
      .subscribe((data) => {
        this.parts = data.content;
        this.totalPages = data.totalPages;
      });

    // Cargar repuestos sin filtro al inicio
    this.loadParts();
  }

  loadParts(): void {
    const keyword = this.searchControl.value || '';
    this.partService
      .getPartsPage(this.currentPage, keyword)
      .subscribe((data) => {
        this.parts = data.content;
        this.totalPages = data.totalPages;
      });
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadParts();
  }

  create(): void {
    this.router.navigate(['/dashboard/parts/new']);
  }

  update(id: number): void {
    this.router.navigate(['/dashboard/parts/edit', id]);
  }
  delete(part: Part): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar el repuesto ${part.partCatalog.name} de ${part.phone.brand} ${part.phone.model}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.partService.deletePart(part.id).subscribe(() => {
          Swal.fire('Eliminado', 'El repuesto ha sido eliminado.', 'success');
        });
      }
    });
  }
  get admin(): boolean {
    return this.authService.isAdmin();
  }
}
