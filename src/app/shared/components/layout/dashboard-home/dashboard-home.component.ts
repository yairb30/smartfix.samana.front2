import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../../../features/customers/services/customers.service';
import { PartService } from '../../../../features/parts/services/parts.service';
import { PhoneService } from '../../../../features/phones/services/phone.service';
import { RepairService } from '../../../../features/repairs/services/repair.service';
import { Repair } from '../../../../shared/models/repair';
import { SpinnerComponent } from '../../spinner/spinner.component';
import { LoadingService } from '../../../services/loading.service';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs';
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
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent {

  // Estados de carga
  isLoadingDashboard = false;
  isLoadingStats = false;
  isLoadingCharts = false;

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
    private partService: PartService,
    private loadingService: LoadingService
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
    this.isLoadingDashboard = true;
    
    // Cargar datos básicos de forma simultánea
    this.loadBasicStats();
    
    // Cargar estadísticas avanzadas
    this.loadRepairsData();
    this.generateMockData();
  }

  private loadBasicStats(): void {
    this.isLoadingStats = true;
    
    forkJoin({
      customers: this.customerService.getCountCustomers(),
      phones: this.phoneService.getCountPhones(),
      repairs: this.repairService.getCountRepairs(),
      parts: this.partService.getParts()
    })
    .pipe(finalize(() => {
      this.isLoadingStats = false;
      this.isLoadingDashboard = false;
    }))
    .subscribe({
      next: ({ customers, phones, repairs, parts }) => {
        this.totalCustomers = customers;
        this.totalPhones = phones;
        this.totalRepairs = repairs;
        this.totalParts = parts.length;
        
        // Calcular datos del mes actual (simulado)
        this.newCustomersThisMonth = Math.floor(customers * 0.15);
        this.repairsThisMonth = Math.floor(repairs * 0.25);
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
      }
    });
  }

  // Métodos individuales mantenidos para compatibilidad pero ahora usan loadBasicStats()
  loadCustomerCount(): void {
    if (!this.isLoadingStats) {
      this.loadBasicStats();
    }
  }

  loadPhonesCount(): void {
    if (!this.isLoadingStats) {
      this.loadBasicStats();
    }
  }

  loadRepairsCount(): void {
    if (!this.isLoadingStats) {
      this.loadBasicStats();
    }
  }

  loadPartsCount(): void {
    if (!this.isLoadingStats) {
      this.loadBasicStats();
    }
  }

  private loadRepairsData(): void {
    this.isLoadingCharts = true;
    
    // Cargar todas las reparaciones para análisis
    forkJoin({
      repairs: this.repairService.getRepairs(),
      phones: this.phoneService.getPhones()
    })
    .pipe(finalize(() => this.isLoadingCharts = false))
    .subscribe({
      next: ({ repairs, phones }) => {
        this.analyzeRepairsData(repairs, phones);
      },
      error: (err) => {
        console.error('Error cargando datos de reparaciones:', err);
        this.isLoadingCharts = false;
      }
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
