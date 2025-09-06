import { Component, inject, OnInit } from '@angular/core';
import { RepairService } from '../../services/repair.service';
import { Router, RouterModule } from '@angular/router';
import { Repair } from '../../../../shared/models/repair';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith, switchMap, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Customer } from '../../../../shared/models/customer';
import { Phone } from '../../../../shared/models/phone';
import { AuthService } from '../../../../core/services/auth.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-repair',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule, PaginationComponent],
  templateUrl: './repair-list.component.html',
  styleUrl: './repair-list.component.css',
})
export class RepairListComponent implements OnInit {
  private repairService = inject(RepairService);
  private router = inject(Router);
  private authService = inject(AuthService);

  repairs!: Repair[];
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
          this.repairService.getRepairsPage(this.currentPage, keyword || '')
        )
      )
      .subscribe((data) => {
        this.repairs = data.content;
        this.totalPages = data.totalPages;
      });

    // Cargar reparaciones sin filtro al inicio
    this.loadRepairs();
   
  }

  loadRepairs(): void {
    const keyword = this.searchControl.value || '';
    this.repairService
      .getRepairsPage(this.currentPage, keyword)
      .subscribe((data) => {
        this.repairs = data.content;
        this.totalPages = data.totalPages;
      });
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadRepairs();
  }

  create(): void {
    this.router.navigate(['/dashboard/repairs/new']);
  }

  update(id: number): void {
    this.router.navigate(['/dashboard/repairs/edit', id]);
  }
  delete(repair: Repair): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar la reparación ${repair.phone.brand} ${repair.phone.model}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.repairService.deleteRepair(repair.id).subscribe(() => {
          this.repairs = this.repairs.filter((r) => r.id !== repair.id);
          Swal.fire('Eliminado', 'La reparación ha sido eliminada.', 'success');
        });
      }
    });
  }
  get admin(): boolean {
    return this.authService.isAdmin();
  }
}
