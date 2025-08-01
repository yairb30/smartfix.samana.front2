import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  form!: FormGroup;
  

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
     this.form = this.fb.group({
       email: ['', [Validators.required, Validators.email]],
       username: ['', [Validators.required, Validators.minLength(4)]],
       password: ['', [Validators.required]],
       admin: [{ value: false, disabled: !this.authService.isAdmin() }] // Campo admin deshabilitado por defecto
    });
  }

  register(): void {
    if (this.form.invalid) return;

    this.authService.register(this.form.value).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text: 'El usuario ha sido registrado con éxito.',
        });
        this.form.reset();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo registrar',
        });
        console.error(err);
        this.form.reset();
      }
    });
  }
 
}
