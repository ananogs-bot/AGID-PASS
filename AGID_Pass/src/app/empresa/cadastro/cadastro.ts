import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cadastro',
  imports: [FormsModule],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css',
})
export class Cadastro {
  nome: string = "";
  email: string = "";
  senha: string = "";
  telefone: number = 0;
  cnpj: number = 0;
  endereco: string = "";
  descricao: string = "";
  categorias: string[] = []; 

  cadastrarProfissional() {
    
  }
}
