import { Component, Inject } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { DashboardComponent } from "./shared/components/layout/dashboard/dashboard.component";
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './core/services/auth.service';
import { LoginComponent } from './features/auth/login/login.component';
import { SidebarComponent } from './shared/components/layout/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private authService = Inject(AuthService);

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
  
}
