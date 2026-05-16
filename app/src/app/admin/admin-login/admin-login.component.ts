import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss',
  host: { class: 'admin-app' },
})
export class AdminLoginComponent {
  password = '';
  error = '';
  loading = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly router: Router
  ) {}

  submit(): void {
    this.error = '';
    this.loading = true;
    this.configService.login(this.password).subscribe({
      next: () => {
        this.loading = false;
        void this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err?.error?.error ||
          'No se pudo iniciar sesión. Revisá la contraseña y que la API tenga JWT_SECRET.';
      },
    });
  }
}
