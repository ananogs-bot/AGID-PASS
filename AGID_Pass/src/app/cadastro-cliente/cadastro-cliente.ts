import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Cliente } from '../services/models/models';
import { ClienteService } from '../services/api/cliente.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-cadastro-cliente',
  templateUrl: './cadastro-cliente.html',
  styleUrls: ['./cadastro-cliente.css']
})
export class CadastroCliente {

  nome = '';
  email = '';
  senha = '';
  telefone = '';
  cpf = '';
  cep = '';
  numero = '';
  endereco = '';
  imagem = '';

  cpfErro = '';
  senhaErro = '';
  cepErro = '';

  constructor(private clienteService: ClienteService, private http: HttpClient) { }

  // 🔹 Formatar telefone enquanto digita
  formatarTelefone() {
    let v = this.telefone.replace(/\D/g, '');
    if (v.length > 0) v = '(' + v;
    if (v.length > 3) v = v.slice(0, 3) + ') ' + v.slice(3);
    if (v.length > 10) v = v.slice(0, 10) + '-' + v.slice(10, 15);
    this.telefone = v.slice(0, 15);
  }

  // 🔹 Validar CPF (estrutura + dígitos)
  validarCPF() {
    const cpf = this.cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
      this.cpfErro = 'CPF incompleto.';
      return;
    }

    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) {
      this.cpfErro = 'CPF inválido.';
      return;
    }

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) {
      this.cpfErro = 'CPF inválido.';
      return;
    }

    this.cpfErro = ''; // válido
    this.cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  // 🔹 Validar força da senha
  validarSenha() {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    this.senhaErro = regex.test(this.senha)
      ? ''
      : 'A senha deve ter ao menos 8 caracteres, com letra maiúscula, minúscula, número e símbolo.';
  }

  // 🔹 Formatar CEP enquanto digita
  formatarCEP() {
    let valor = this.cep.replace(/\D/g, '');
    if (valor.length > 8) valor = valor.substring(0, 8);
    if (valor.length > 5) this.cep = valor.substring(0, 5) + '-' + valor.substring(5);
    else this.cep = valor;
    this.cepErro = '';
  }

  // 🔹 Buscar endereço pelo CEP
  buscarEndereco() {
    const cepFormatado = this.cep.replace(/\D/g, '');
    if (cepFormatado.length !== 8) {
      this.cepErro = 'CEP deve ter 8 números.';
      this.endereco = '';
      return;
    }

    this.http.get(`https://viacep.com.br/ws/${cepFormatado}/json/`).subscribe({
      next: (res: any) => {
        if (!res.erro) {
          this.endereco = `${res.logradouro}, ${res.bairro}, ${res.localidade}/${res.uf}`;
          this.cepErro = '';
        } else {
          this.cepErro = 'CEP não encontrado.';
          this.endereco = '';
        }
      },
      error: () => {
        this.cepErro = 'Erro ao buscar o CEP. Tente novamente.';
        this.endereco = '';
      }
    });
  }

  // 🔹 Enviar formulário
  cadastrarCliente(form: NgForm) {
    if (form.invalid || this.cpfErro || this.senhaErro) {
      form.control.markAllAsTouched();
      return;
    }

    // Limpar campos formatados
    const cpfLimpo = this.cpf.replace(/\D/g, '');

    // 🔹 Verificar se o e-mail já existe
    this.http.get(`http://localhost:3000/clientes/email/${this.email}`).subscribe({
      next: (res: any) => {
        if (res && res.emailExiste) {
          // Exemplo de retorno: { emailExiste: true }
          alert('Este e-mail já está cadastrado! Você será redirecionado para a página de login.');
          window.location.href = '/login'; // ou this.router.navigate(['/login'])
          return;
        } else {
          // 🔹 Só cadastra se o e-mail for novo
          const cliente: Cliente = {
            cliente_nome: this.nome,
            cliente_email: this.email,
            cliente_senha: this.senha,
            cliente_telefone: this.telefone,
            cliente_endereco: `${this.endereco}, ${this.numero}`,
            cliente_cpf: cpfLimpo,
            cliente_imagem: this.imagem
          };

          this.clienteService.cadastrarCliente(cliente).subscribe({
            next: res => {
              alert('Cliente cadastrado com sucesso!');
              form.resetForm();
            },
            error: err => {
              console.error('Erro ao cadastrar:', err);
              alert('Ocorreu um erro ao cadastrar o cliente.');
            }
          });
        }
      },
      error: (err) => {
        console.error('Erro ao verificar e-mail:', err);
        alert('Não foi possível verificar o e-mail. Tente novamente mais tarde.');
      }
    });
  }
}
