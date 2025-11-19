import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [FormsModule, CommonModule, RouterLink]
})
export class Login {
  tipo: string = '';
  email: string = '';
  senha: string = '';
  cpfRecuperacao: string = '';

  mostrarEsqueciSenha = false;
  mostrarEsqueciEmail = false;
  mostrarCadastroSugestao = false;

  // novos estados
  telefoneMascarado: string = '';
  emailMascarado: string = '';
  mostrarConfirmacaoEnvio = false;

  constructor(private authService: AuthService, private router: Router) { }

  // 🔹 LOGIN NORMAL
  login(form: any) {
    if (form.invalid) return;

    // 🧹 Limpa dados antigos do localStorage antes de logar
    localStorage.clear();

    this.authService.login(this.tipo, this.email, this.senha).subscribe((res) => {
      if (res.success) {
        if (this.tipo === 'cliente') {
          this.router.navigate(['/carrinho']);
        } else {
          this.router.navigate(['/beneficios']);
        }
        return;
      }

      if (res.status === 400) {
        this.mostrarCadastroSugestao = true;
      } else if (res.status === 401) {
        alert('Senha incorreta. Verifique e tente novamente.');
      } else {
        alert('Credenciais inválidas. Verifique seus dados.');
      }
    });
  }


  // 🔹 MODAIS
  abrirEsqueciSenha() {
    this.mostrarEsqueciSenha = true;
    this.mostrarEsqueciEmail = false;
  }

  abrirEsqueciEmail() {
    this.mostrarEsqueciEmail = true;
    this.mostrarEsqueciSenha = false;
    this.mostrarConfirmacaoEnvio = false;
  }

  fecharModal() {
    this.mostrarEsqueciSenha = false;
    this.mostrarEsqueciEmail = false;
    this.mostrarConfirmacaoEnvio = false;
    this.cpfRecuperacao = '';
    this.emailMascarado = '';
    this.telefoneMascarado = '';
  }

  // 🔹 CPF VALIDAÇÃO
  validarCPF(cpf: string): boolean {
    const regex = /^\d{11}$/;
    return regex.test(cpf);
  }

  // 🔹 RECUPERAR SENHA
  recuperarSenha() {
    if (!this.validarCPF(this.cpfRecuperacao)) {
      alert('CPF inválido. Digite apenas números (11 dígitos).');
      return;
    }

    this.authService.recuperarSenha(this.cpfRecuperacao).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Uma senha temporária foi enviada para o seu e-mail.');
          this.fecharModal();
        } else {
          alert('CPF não encontrado.');
        }
      },
      error: () => {
        alert('Erro ao processar recuperação. Tente novamente.');
      }
    });
  }

  // 🔹 RECUPERAR E-MAIL (etapa 1)
  recuperarEmail() {
    if (!this.validarCPF(this.cpfRecuperacao)) {
      alert('CPF inválido. Digite apenas números (11 dígitos).');
      return;
    }

    this.authService.recuperarEmail(this.cpfRecuperacao).subscribe({
      next: (res) => {
        if (res.success) {
          this.telefoneMascarado = res.telefone;
          this.emailMascarado = res.emailMascarado;
          this.mostrarConfirmacaoEnvio = true;
        } else {
          alert('CPF não cadastrado.');
        }
      },
      error: () => {
        alert('Erro ao tentar recuperar e-mail.');
      }
    });
  }

  // 🔹 CONFIRMAR ENVIO (etapa 2)
  confirmarEnvioNotificacao() {
    this.authService.recuperarEmail(this.cpfRecuperacao, true).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Notificação enviada para o número cadastrado.');
          this.fecharModal();
        } else {
          alert('Erro ao enviar notificação.');
        }
      },
      error: () => {
        alert('Erro ao processar envio da notificação.');
      }
    });
  }

  // 🔹 SUGESTÃO DE CADASTRO
  irParaCadastro() {
    this.router.navigate(['/cadastro-cliente']);
  }

  fecharCadastroSugestao() {
    this.mostrarCadastroSugestao = false;
  }
}
