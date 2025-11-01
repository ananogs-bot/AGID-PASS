import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-catalogo',
  templateUrl: './catalogo.html',
  styleUrls: ['./catalogo.css'],
  imports: [CommonModule, RouterLink]
})
export class Catalogo implements OnInit {
  profissionais: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get('http://localhost:3000/profissionais').subscribe({
      next: (data: any) => {
        this.profissionais = data.map((p: any) => ({
          profissional_id: p.profissional_id,
          profissional_nome: p.profissional_nome,
          profissional_endereco: p.profissional_endereco,
          profissional_imagem: p.profissional_imagem,
          categorias: p.categorias ? p.categorias.split(' - ') : []
        }));
      },
      error: (err) => console.error('Erro ao carregar profissionais:', err)
    });
  }
}
