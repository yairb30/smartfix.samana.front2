import { Component } from '@angular/core';
import { CustomerService } from '../../../../features/customers/services/customers.service';
import { PartService } from '../../../../features/parts/services/parts.service';
import { PhoneService } from '../../../../features/phones/services/phone.service';
import { RepairService } from '../../../../features/repairs/services/repair.service';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.css'
})
export class DashboardHomeComponent {

  totalCustomers: number = 0;
  totalPhones: number = 0;
  totalRepairs: number = 0;
  totalParts: number = 0;

  constructor(
    private customerService: CustomerService,
    private phoneService: PhoneService,
    private repairService: RepairService,
    private partService: PartService
  ) {}

  ngOnInit(): void {
    this.loadCustomerCount();
    this.loadPhonesCount();
    this.loadRepairsCount();
    this.loadPartsCount();
  }

  loadCustomerCount(): void {
    this.customerService.getCountCustomers().subscribe({
      next: (count) => this.totalCustomers = count,
      error: (err) => console.error('Error cargando clientes:', err)
    });
  }
  loadPhonesCount(): void {
    this.phoneService.getCountPhones().subscribe({
      next: (count) => this.totalPhones = count,
      error: (err) => console.error('Error cargando teléfonos:', err)
    });
  }
  loadRepairsCount(): void {
    this.repairService.getCountRepairs().subscribe({
      next: (count) => this.totalRepairs = count,
      error: (err) => console.error('Error cargando reparaciones:', err)
    });
  }

  loadPartsCount(): void {
    this.partService.getParts().subscribe({
      next: (parts) => this.totalParts = parts.length,
      error: (err) => console.error('Error cargando repuestos:', err)
    });
  }

}
