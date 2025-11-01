import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Cliente } from '../services/models/models';
import { ClienteService } from '../services/api/cliente.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  endereco = '';
  imagem = '';

  constructor(private clienteService: ClienteService) {}

  cadastrarCliente(form: NgForm) {
    if (form.invalid) {
      // Marca todos os campos como "touched" para mostrar mensagens de erro
      form.control.markAllAsTouched();
      return;
    }

    const cliente: Cliente = {
      cliente_nome: this.nome,
      cliente_email: this.email,
      cliente_senha: this.senha,
      cliente_telefone: this.telefone,
      cliente_endereco: this.endereco,
      cliente_cpf: this.cpf,
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
}
