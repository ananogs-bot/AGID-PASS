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
  imports: [CommonModule, FormsModule, RouterLink] // ✅ FormsModule adicionado
})
export class Agendamento implements OnInit {
  profissional: any = null;
  id: string = '';

  // Campos do agendamento
  categoriaSelecionada: string = '';
  pagamentoSelecionado: string = '';
  dataAgendamento: string = '';
  horarioAgendamento: string = '';

  cliente_id: string = '';

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';

    this.http.get(`http://localhost:3000/profissionais/${this.id}`).subscribe({
      next: (data: any) => {
        console.log('Dados recebidos da API:', data); // <-- aqui
        this.profissional = data;
      },
      error: (err) => console.error('Erro ao carregar profissional:', err)
    });
  }


  agendar() {
    if (!this.categoriaSelecionada || !this.pagamentoSelecionado || !this.dataAgendamento || !this.horarioAgendamento) {
      alert('Preencha todos os campos do agendamento.');
      return;
    }

    const body = {
      cliente_id: "b849a2fe-915b-41b0-bcd6-930c6a33220e",
      profissional_id: this.profissional.profissional_id,
      categoria_id: this.categoriaSelecionada, // ⚠️ pode ser o ID ou nome dependendo da sua API
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
      error: (err) => console.error('Erro ao criar agendamento:', err)
    });
  }
}
