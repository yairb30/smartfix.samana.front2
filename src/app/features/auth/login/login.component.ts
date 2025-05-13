import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  username = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    const credentials = { username: this.username, password: this.password };
    this.authService.login(credentials).subscribe(
      (response) => {
        sessionStorage.setItem('token', response.token);
        this.router.navigate(['/customers']);
      },
      (error) => {
        this.errorMessage = 'Usuario o contraseña incorrectos.';
        console.error('Error al iniciar sesión', error);
      }
    );
  }

}
