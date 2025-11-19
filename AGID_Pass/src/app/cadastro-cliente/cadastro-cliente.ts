import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Cliente } from '../services/models/models';
import { ClienteService } from '../services/api/cliente.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

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
  emailErro = '';
  mensagemErro = '';

  constructor(
    private clienteService: ClienteService,
    private http: HttpClient,
    private router: Router
  ) { }

  formatarTelefone() {
    let v = this.telefone.replace(/\D/g, '');
    if (v.length > 0) v = '(' + v;
    if (v.length > 3) v = v.slice(0, 3) + ') ' + v.slice(3);
    if (v.length > 10) v = v.slice(0, 10) + '-' + v.slice(10, 15);
    this.telefone = v.slice(0, 15);
  }

  validarCPF() {
    const cpf = this.cpf.replace(/\D/g, '');
    this.cpfErro = '';
    this.mensagemErro = '';

    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
      this.exibirErro('CPF inválido.');
      this.cpfErro = 'CPF inválido.';
      return;
    }

    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto >= 10) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) {
      this.exibirErro('CPF inválido.');
      this.cpfErro = 'CPF inválido.';
      return;
    }

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto >= 10) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) {
      this.exibirErro('CPF inválido.');
      this.cpfErro = 'CPF inválido.';
      return;
    }

    this.cpfErro = '';
    this.mensagemErro = '';
  }

  validarSenha() {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!regex.test(this.senha)) {
      this.senhaErro = 'A senha deve ter ao menos 8 caracteres, com letra maiúscula, minúscula, número e símbolo.';
      this.exibirErro(this.senhaErro);
    } else {
      this.senhaErro = '';
      this.mensagemErro = '';
    }
  }

  formatarCEP() {
    let valor = this.cep.replace(/\D/g, '');
    if (valor.length > 8) valor = valor.substring(0, 8);
    if (valor.length > 5) this.cep = valor.substring(0, 5) + '-' + valor.substring(5);
    else this.cep = valor;
    this.cepErro = '';
  }

  async buscarEndereco() {
    const cepFormatado = this.cep.replace(/\D/g, '');
    if (cepFormatado.length !== 8) {
      this.cepErro = 'CEP deve ter 8 números.';
      this.exibirErro(this.cepErro);
      this.endereco = '';
      return;
    }

    try {
      const res: any = await firstValueFrom(this.http.get(`https://viacep.com.br/ws/${cepFormatado}/json/`));
      if (!res.erro) {
        this.endereco = `${res.logradouro}, ${res.bairro}, ${res.localidade}/${res.uf}`;
        this.cepErro = '';
        this.mensagemErro = '';
      } else {
        this.cepErro = 'CEP não encontrado.';
        this.exibirErro(this.cepErro);
        this.endereco = '';
      }
    } catch {
      this.cepErro = 'Erro ao buscar o CEP.';
      this.exibirErro(this.cepErro);
      this.endereco = '';
    }
  }

  async cadastrarCliente(form: NgForm) {
    this.mensagemErro = '';
    this.emailErro = '';

    if (form.invalid || this.cpfErro || this.senhaErro || this.cepErro) {
      this.exibirErro('Preencha corretamente todos os campos.');
      return;
    }

    const cpfLimpo = this.cpf.replace(/\D/g, '');

    try {
      const res: any = await firstValueFrom(this.http.get(`http://localhost:3000/clientes/email/${this.email}`));

      if (res && res.emailExiste) {
        this.emailErro = 'Este e-mail já está cadastrado.';
        this.exibirErro('Este e-mail já está cadastrado. Você será redirecionado para login...', true, 3000, () => {
          this.router.navigate(['/login']);
        });
        return;
      }

      const cliente: Cliente = {
        cliente_nome: this.nome,
        cliente_email: this.email,
        cliente_senha: this.senha,
        cliente_telefone: this.telefone,
        cliente_endereco: `${this.endereco}, ${this.numero}`,
        cliente_cpf: cpfLimpo,
        cliente_imagem: this.imagem
      };

      await firstValueFrom(this.clienteService.cadastrarCliente(cliente));
      this.exibirErro('Cliente cadastrado com sucesso!', false, 3000);
      form.resetForm();

    } catch (err: any) {
      console.error('Erro ao cadastrar:', err);
      this.exibirErro('Ocorreu um erro ao cadastrar o cliente.');
    }
  }

  // Função helper para exibir mensagens temporárias
  exibirErro(msg: string, vermelho: boolean = true, tempo: number = 3000, callback?: () => void) {
    this.mensagemErro = msg;
    setTimeout(() => {
      this.mensagemErro = '';
      if (callback) callback();
    }, tempo);
  }
}
