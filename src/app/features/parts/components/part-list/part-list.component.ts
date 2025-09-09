import { Component, inject, OnInit } from '@angular/core';
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
  finalize,
} from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { LoadingService } from '../../../../shared/services/loading.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-part',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    PaginationComponent,
    SpinnerComponent,
  ],
  templateUrl: './part-list.component.html',
  styleUrl: './part-list.component.css',
})
export class PartListComponent implements OnInit {
  private partService = inject(PartService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private loadingService = inject(LoadingService);

  parts: Part[] = [];
  customers!: Customer[];
  phones!: Phone[];
  isLoading = false;
  isSearching = false;
  isDeleting = false;

  searchControl = new FormControl('');
  currentPage = 0;
  totalPages = 0;

  ngOnInit(): void {
    // Búsqueda reactiva
    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => {
          this.currentPage = 0;
          this.isSearching = true;
        }),
        switchMap((keyword) =>
          this.partService.getPartsPage(this.currentPage, keyword || '')
            .pipe(finalize(() => this.isSearching = false))
        )
      )
      .subscribe((data: any) => {
        this.parts = data.content;
        this.totalPages = data.totalPages;
      });
    // Cargar repuestos sin filtro al inicio
    this.loadParts();
  }

  loadParts(): void {
    const keyword = this.searchControl.value || '';
    this.isLoading = true;
    
    this.partService
      .getPartsPage(this.currentPage, keyword)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe((data: any) => {
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
        this.isDeleting = true;
        this.partService.deletePart(part.id)
          .pipe(finalize(() => this.isDeleting = false))
          .subscribe(() => {
            this.loadParts();
            Swal.fire('Eliminado', 'El repuesto ha sido eliminado.', 'success');
          });
      }
    });
  }
  
  get admin(): boolean {
    return this.authService.isAdmin();
  }
}
