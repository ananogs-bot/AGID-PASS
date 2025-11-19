import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfissionalService } from '../services/api/profissional.service';
import { AgendamentoService } from '../services/api/agendamento.service';

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

  categoriaSelecionada: string = '';
  pagamentoSelecionado: string = '';
  dataAgendamento: string = '';
  horarioAgendamento: string = '';

  tipo: string = '';
  cliente_id: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private profissionalService: ProfissionalService,
    private agendamentoService: AgendamentoService
  ) { }

  ngOnInit(): void {
    // 🟩 Verifica o tipo do usuário
    const tipo = localStorage.getItem('tipo');
    if (tipo !== 'cliente') {
      alert('⚠️ Faça login como cliente para realizar um agendamento.');
      this.router.navigate(['/login']);
      return;
    }
    this.tipo = tipo;

    // 🟦 Resgata o ID do cliente
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.cliente_id = user.id;
      console.log('🧍‍♂️ Cliente logado:', this.cliente_id);
    } else {
      alert('⚠️ Erro ao identificar o usuário. Faça login novamente.');
      this.router.navigate(['/login']);
      return;
    }

    // 🟨 ID do profissional vindo da rota
    this.id = this.route.snapshot.paramMap.get('id') || '';

    // 🟪 Busca o profissional
    this.profissionalService.getProfissionais().subscribe({
      next: (data) => {
        this.profissional = data.find((p: any) => p.profissional_id === this.id);
        if (!this.profissional) {
          alert('Profissional não encontrado.');
          this.router.navigate(['/home']);
          return;
        }

        // 🟦 Converte string de categorias para lista
        if (typeof this.profissional.categorias === 'string') {
          this.profissional.categoriasList = this.profissional.categorias
            .split(',')
            .map((nome: string) => ({
              categoria_nome: nome.trim()
            }));
        } else if (Array.isArray(this.profissional.categorias)) {
          this.profissional.categoriasList = this.profissional.categorias;
        }

        console.log('🔹 Profissional encontrado:', this.profissional);
      },
      error: (err) => {
        console.error('❌ Erro ao buscar profissional:', err);
      }
    });
  }

  // 🔹 Agendar
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

    // 🧾 Monta o corpo conforme o backend espera
    const body = {
      cliente_id: this.cliente_id,
      profissional_id: this.profissional.profissional_id,
      categoria_nome: this.categoriaSelecionada, // envia o nome, não o id
      pagamento_id: this.pagamentoSelecionado,
      agendamento_data_agendamento: this.dataAgendamento,
      agendamento_horario: this.horarioAgendamento
    };

    console.log('📤 Dados enviados para o servidor:', body);

    // 🔽 POST no endpoint correto
    this.profissionalService.addDisponibilidade(body).subscribe({
      next: () => {
        alert('✅ Agendamento realizado com sucesso!');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Agendamento realizado com sucesso', err);
        // alert('Erro ao realizar o agendamento. Tente novamente.');
      }
    });
  }
}
