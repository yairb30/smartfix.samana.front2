import { Component, inject } from '@angular/core';
import { PhoneService } from '../../services/phone.service';
import { Router, RouterModule } from '@angular/router';
import { Phone } from '../../../../shared/models/phone';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-phone-list',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule, PaginationComponent],
  templateUrl: './phone-list.component.html',
  styleUrl: './phone-list.component.css'
})
export class PhoneListComponent {

  private phoneService = inject(PhoneService);
  private router = inject(Router);
  private authService = inject(AuthService);
  
    phones: Phone[] = [];
  
    searchControl = new FormControl('');
    currentPage = 0;
    totalPages = 0;
  
    ngOnInit(): void {
      // Búsqueda reactiva
      this.searchControl.valueChanges
        .pipe(
          startWith(''),
          debounceTime(400),
          distinctUntilChanged(),
          switchMap((keyword) =>
            this.phoneService.getPhonesPage(this.currentPage, keyword || '')
          )
        )
        .subscribe((data) => {
          this.phones = data.content;
          this.totalPages = data.totalPages;
        });
  
      // Cargar teléfonos sin filtro al inicio
      this.loadPhones();
    }
  
    loadPhones(): void {
      const keyword = this.searchControl.value || '';
      this.phoneService
        .getPhonesPage(this.currentPage, keyword)
        .subscribe((data) => {
          this.phones = data.content;
          this.totalPages = data.totalPages;
        });
    }
  
    goToPage(page: number): void {
      this.currentPage = page;
      this.loadPhones();
    }
  
    create(): void {
      this.router.navigate(['/dashboard/phones/new']);
    }
  
    update(id: number): void {
      this.router.navigate(['/dashboard/phones/edit', id]);
    }
    delete(phone: Phone): void {
      Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Quieres eliminar el teléfono ${phone.brand} ${phone.model}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          this.phoneService.deletePhone(phone.id).subscribe(() => {
            Swal.fire({
              title: 'Eliminado',
              text: 'Teléfono eliminado con éxito.',
              icon: 'success',
            });
          });
        }
      });
    }

    get admin(): boolean {
      return this.authService.isAdmin();
    }

}
