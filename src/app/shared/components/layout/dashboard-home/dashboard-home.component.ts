import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../../../features/customers/services/customers.service';
import { PartService } from '../../../../features/parts/services/parts.service';
import { PhoneService } from '../../../../features/phones/services/phone.service';
import { RepairService } from '../../../../features/repairs/services/repair.service';
import { Repair } from '../../../../shared/models/repair';
import { forkJoin } from 'rxjs';
import { Phone } from '../../../models/phone';

interface RepairsByStatus {
  pending: number;
  inProgress: number;
  completed: number;
  delivered: number;
}

interface TopRepairedDevice {
  id: number;
  brand: string;
  model: string;
  repairCount: number;
}

interface RecentActivity {
  id: number;
  type: 'repair' | 'customer' | 'device' | 'part';
  description: string;
  timestamp: Date;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent {

  // Datos básicos
  totalCustomers: number = 0;
  totalPhones: number = 0;
  totalRepairs: number = 0;
  totalParts: number = 0;

  // Datos del mes actual
  currentDate: Date = new Date();
  currentMonth: string = '';
  newCustomersThisMonth: number = 0;
  repairsThisMonth: number = 0;

  // Estadísticas de reparaciones
  repairsByStatus: RepairsByStatus = {
    pending: 0,
    inProgress: 0,
    completed: 0,
    delivered: 0
  };

  topRepairedDevices: TopRepairedDevice[] = [];
  maxRepairCount: number = 1;

  // Métricas de rendimiento
  averageRepairTime: number = 0;
  successRate: number = 0;
  customerSatisfaction: number = 4.5;

  // Actividad reciente
  recentActivities: RecentActivity[] = [];

  constructor(
    private customerService: CustomerService,
    private phoneService: PhoneService,
    private repairService: RepairService,
    private partService: PartService
  ) {
    this.setCurrentMonth();
  }

  ngOnInit(): void {
    this.loadAllData();
  }

  private setCurrentMonth(): void {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    this.currentMonth = months[this.currentDate.getMonth()] + ' ' + this.currentDate.getFullYear();
  }

  private loadAllData(): void {
    // Cargar datos básicos
    this.loadCustomerCount();
    this.loadPhonesCount();
    this.loadRepairsCount();
    this.loadPartsCount();
    
    // Cargar estadísticas avanzadas
    this.loadRepairsData();
    this.generateMockData();
  }

  loadCustomerCount(): void {
    this.customerService.getCountCustomers().subscribe({
      next: (count) => {
        this.totalCustomers = count;
        this.newCustomersThisMonth = Math.floor(count * 0.15); // Simulado: 15% del mes actual
      },
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
      next: (count) => {
        this.totalRepairs = count;
        this.repairsThisMonth = Math.floor(count * 0.25); // Simulado: 25% del mes actual
      },
      error: (err) => console.error('Error cargando reparaciones:', err)
    });
  }

  loadPartsCount(): void {
    this.partService.getParts().subscribe({
      next: (parts) => this.totalParts = parts.length,
      error: (err) => console.error('Error cargando repuestos:', err)
    });
  }

  private loadRepairsData(): void {
    // Cargar todas las reparaciones para análisis
    forkJoin({
      repairs: this.repairService.getRepairs(),
      phones: this.phoneService.getPhones()
    }).subscribe({
      next: ({ repairs, phones }) => {
        this.analyzeRepairsData(repairs, phones);
      },
      error: (err) => console.error('Error cargando datos de reparaciones:', err)
    });
  }

  private analyzeRepairsData(repairs: Repair[], phones: Phone[]): void {
    // Analizar reparaciones por estado
    this.repairsByStatus = {
      pending: repairs.filter(r => r.state === 'Pendiente').length,
      inProgress: repairs.filter(r => r.state === 'En Proceso').length,
      completed: repairs.filter(r => r.state === 'Completado').length,
      delivered: repairs.filter(r => r.state === 'Entregado').length
    };

    // Analizar dispositivos más reparados
    const deviceRepairCount = new Map<number, { device: any, count: number }>();
    
    repairs.forEach(repair => {
      const phoneId = repair.phone.id;
      if (deviceRepairCount.has(phoneId)) {
        deviceRepairCount.get(phoneId)!.count++;
      } else {
        const phone = phones.find(p => p.id === phoneId);
        if (phone) {
          deviceRepairCount.set(phoneId, { device: phone, count: 1 });
        }
      }
    });

    // Convertir a array y ordenar
    this.topRepairedDevices = Array.from(deviceRepairCount.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => ({
        id: item.device.id,
        brand: item.device.brand,
        model: item.device.model,
        repairCount: item.count
      }));

    this.maxRepairCount = this.topRepairedDevices.length > 0 
      ? this.topRepairedDevices[0].repairCount 
      : 1;

    // Calcular métricas de rendimiento
    this.calculatePerformanceMetrics(repairs);
  }

  private calculatePerformanceMetrics(repairs: Repair[]): void {
    if (repairs.length === 0) return;

    // Tiempo promedio de reparación (simulado)
    this.averageRepairTime = Math.floor(Math.random() * 5) + 3; // 3-7 días

    // Tasa de éxito (reparaciones completadas/entregadas vs total)
    const successfulRepairs = repairs.filter(r => 
      r.state === 'Completado' || r.state === 'Entregado'
    ).length;
    this.successRate = Math.round((successfulRepairs / repairs.length) * 100);
  }

  private generateMockData(): void {
    // Generar actividades recientes simuladas
    const activities = [
      {
        id: 1,
        type: 'repair' as const,
        description: 'Nueva reparación registrada - iPhone 13',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 horas atrás
      },
      {
        id: 2,
        type: 'customer' as const,
        description: 'Cliente nuevo registrado - María González',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 horas atrás
      },
      {
        id: 3,
        type: 'repair' as const,
        description: 'Reparación completada - Samsung Galaxy S22',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 horas atrás
      },
      {
        id: 4,
        type: 'device' as const,
        description: 'Nuevo modelo agregado - Xiaomi Redmi Note 12',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 horas atrás
      },
      {
        id: 5,
        type: 'part' as const,
        description: 'Repuesto agregado al inventario - Pantalla LCD',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 horas atrás
      }
    ];

    this.recentActivities = activities;
  }

  getActivityIcon(type: string): string {
    const icons = {
      repair: '🔧',
      customer: '👤',
      device: '📱',
      part: '🔩'
    };
    return icons[type as keyof typeof icons] || '📋';
  }
}
