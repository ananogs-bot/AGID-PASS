import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-agendamento',
  templateUrl: './agendamento.html',
  styleUrls: ['./agendamento.css'],
  imports: [CommonModule, FormsModule, RouterLink]
})
export class Agendamento implements OnInit {
  profissional: any = null;
  id: string = '';

  // Campos do agendamento
  categoriaSelecionada: string = '';
  pagamentoSelecionado: string = '';
  dataAgendamento: string = '';
  horarioAgendamento: string = '';

  cliente_id: string = 'b849a2fe-915b-41b0-bcd6-930c6a33220e'; // Exemplo fixo

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';

    this.http.get(`http://localhost:3000/profissionais/${this.id}`).subscribe({
      next: (data: any) => {
        console.log('Dados recebidos da API:', data);

        this.profissional = data;

        // Garante que as categorias venham tratadas
        if (typeof this.profissional.categorias === 'string') {
          this.profissional.categoriasList = this.profissional.categorias
            .split(' - ')
            .map((nome: string) => ({
              categoria_nome: nome.trim()
            }));
        } else {
          this.profissional.categoriasList = [];
        }

        console.log('Categorias tratadas:', this.profissional.categoriasList);
      },
      error: (err) => console.error('Erro ao carregar profissional:', err)
    });
  }

  agendar() {
    if (
      !this.categoriaSelecionada ||
      !this.pagamentoSelecionado ||
      !this.dataAgendamento ||
      !this.horarioAgendamento
    ) {
      alert('Preencha todos os campos do agendamento.');
      return;
    }

    // Corpo da requisição (atenção: agora envia categoria_nome)
    const body = {
      cliente_id: this.cliente_id,
      profissional_id: this.profissional.profissional_id,
      categoria_nome: this.categoriaSelecionada,
      pagamento_id: this.pagamentoSelecionado,
      agendamento_data_agendamento: this.dataAgendamento,
      agendamento_horario: this.horarioAgendamento
    };

    console.log('Dados que vão para o servidor:', body);

    this.http.post('http://localhost:3000/agendamentos', body).subscribe({
      next: () => {
        alert('Agendamento realizado com sucesso!');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Agendamento realizado com sucesso', err);
        alert('Agendamento realizado com sucesso');
      }
    });
  }
}
