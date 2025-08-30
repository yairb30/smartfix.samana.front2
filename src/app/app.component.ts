import { Component, inject, Inject } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { DashboardComponent } from "./shared/components/layout/dashboard/dashboard.component";
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './core/services/auth.service';
import { LoginComponent } from './features/auth/login/login.component';
import { SidebarComponent } from './shared/components/layout/sidebar/sidebar.component';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private updates = inject(SwUpdate);

  ngOnInit() {
    if (!this.updates.isEnabled) return;

    // versionUpdates es el stream de Angular 16+
    this.updates.versionUpdates.subscribe(evt => {
      // evt.type puede ser 'VERSION_DETECTED', 'VERSION_READY', 'VERSION_INSTALLATION_FAILED', ...
      if (evt.type === 'VERSION_READY') {
        // notifica al usuario
        const proceed = confirm('Hay una nueva versión disponible. ¿Deseas actualizar ahora?');
        if (proceed) {
          this.updates.activateUpdate().then(() => document.location.reload());
        }
      }
    });
  }
  
}
