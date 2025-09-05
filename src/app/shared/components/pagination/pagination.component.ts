import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent {
  @Input() currentPage: number = 0;
  @Input() totalPages: number = 0;
  
  @Output() pageChange = new EventEmitter<number>();

  goToPreviousPage(): void {
    if (this.currentPage > 0) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  goToFirstPage(): void {
    if (this.currentPage > 0) {
      this.pageChange.emit(0);
    }
  }

  goToLastPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.pageChange.emit(this.totalPages - 1);
    }
  }

  get hasPreviousPage(): boolean {
    return this.currentPage > 0;
  }

  get hasNextPage(): boolean {
    return this.currentPage < this.totalPages - 1;
  }

  get displayPageNumber(): number {
    return this.currentPage + 1;
  }
}
