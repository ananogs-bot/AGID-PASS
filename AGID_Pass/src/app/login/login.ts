import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [FormsModule, CommonModule]
})
export class Login {
  tipo: string = '';
  email: string = '';
  senha: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login(form: any) {
    if (form.invalid) {
      return;
    }

    this.authService.login(this.tipo, this.email, this.senha).subscribe({
      next: (res) => {
        if (res.success) {
          // redireciona conforme o tipo de usuário
          if (this.tipo === 'cliente') {
            this.router.navigate(['/catalogo']);
          } else if (this.tipo === 'profissional') {
            this.router.navigate(['/beneficios']);
          }
        } else {
          alert('Credenciais inválidas. Verifique seus dados.');
        }
      },
      error: () => {
        alert('Erro ao tentar fazer login. Tente novamente.');
      }
    });
  }
}
