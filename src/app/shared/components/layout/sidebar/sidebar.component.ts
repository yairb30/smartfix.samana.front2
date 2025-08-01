import { Component } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  constructor(private authService: AuthService, private router: Router) {}

  isSidebarCollapsed = false;
  profileMenuOpen = false;

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleProfileMenu() {
    this.profileMenuOpen = !this.profileMenuOpen;
  }
  
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onRegister(): void {
    this.router.navigate(['/register']);
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get username(): string {
    return this.authService.username;
  }

  get admin(): boolean {
    return this.authService.isAdmin();
  }

}
