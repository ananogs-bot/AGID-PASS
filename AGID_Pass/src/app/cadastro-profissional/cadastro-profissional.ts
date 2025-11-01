import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Profissional } from '../services/models/models';
import { ProfissionalService, Categoria } from '../services/api/profissional.service';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-cadastro-profissional',
  templateUrl: './cadastro-profissional.html',
  styleUrls: ['./cadastro-profissional.css']
})
export class CadastroProfissional implements OnInit {

  nome = '';
  email = '';
  senha = '';
  telefone = '';
  cnpj = '';
  cep = '';
  numero = '';
  endereco = '';
  descricao = '';
  imagem = '';

  categorias: Categoria[] = [];
  categoriasSelecionadas: number[] = [];

  constructor(private profissionalService: ProfissionalService, private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarCategorias();
  }

  carregarCategorias() {
    this.profissionalService.getCategorias().subscribe({
      next: (data) => this.categorias = data,
      error: (err) => console.error('Erro ao carregar categorias', err)
    });
  }

  toggleCategoria(categoriaId: number, event: any) {
    if (event.target.checked) {
      this.categoriasSelecionadas.push(categoriaId);
    } else {
      this.categoriasSelecionadas = this.categoriasSelecionadas.filter(id => id !== categoriaId);
    }
  }

  buscarEndereco() {
    const cepFormatado = this.cep.replace(/\D/g, '');
    console.log('Buscando endereço para CEP:', cepFormatado);
    if (cepFormatado.length === 8) {
      this.http.get(`https://viacep.com.br/ws/${cepFormatado}/json/`).subscribe({
        next: (res: any) => {
          if (!res.erro) {
            this.endereco = `${res.logradouro}, ${res.bairro}, ${res.localidade}/${res.uf}`;
          } else {
            alert('CEP não encontrado.');
            this.endereco = '';
          }
        },
        error: (err) => {
          console.error('Erro ao buscar CEP', err);
          this.endereco = '';
        }
      });
    } else {
      this.endereco = '';
    }
  }

  cadastrarProfissional(form: NgForm) {
    const body: Profissional & { categorias: number[] } = {
      profissional_nome: this.nome,
      profissional_email: this.email,
      profissional_senha: this.senha,
      profissional_telefone: this.telefone,
      profissional_cnpj: this.cnpj,
      profissional_cep: this.cep,
      profissional_numero: this.numero,
      profissional_endereco: `${this.endereco}, ${this.numero}`,
      profissional_descricao: this.descricao,
      profissional_imagem: this.imagem,
      categorias: this.categoriasSelecionadas
    };

    this.profissionalService.cadastrarProfissional(body).subscribe({
      next: res => {
        console.log('Profissional cadastrado', res);
        form.resetForm();
      },
      error: err => console.error(err)
    });
  }
}
