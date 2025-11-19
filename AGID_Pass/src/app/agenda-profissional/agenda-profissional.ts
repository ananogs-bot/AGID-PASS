import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-agenda-profissional',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agenda-profissional.html',
  styleUrls: ['./agenda-profissional.css']
})
export class AgendaProfissional implements OnInit {
  profissionalId: string = '';
  disponibilidades: any[] = [];
  agendamentos: any[] = [];
  horariosPorDia: { [dia: string]: string[] } = {};

  novoDia: string = '';
  horaInicio: string = '';
  horaFim: string = '';
  duracaoSessao: string = '';

  diasSemana = [
    { nome: 'Domingo', valor: 'domingo' },
    { nome: 'Segunda-feira', valor: 'segunda' },
    { nome: 'Terça-feira', valor: 'terca' },
    { nome: 'Quarta-feira', valor: 'quarta' },
    { nome: 'Quinta-feira', valor: 'quinta' },
    { nome: 'Sexta-feira', valor: 'sexta' },
    { nome: 'Sábado', valor: 'sabado' }
  ];

  duracoes = [
    { label: '30 minutos', valor: 30 },
    { label: '1 hora', valor: 60 },
    { label: '1h 30min', valor: 90 },
    { label: '2 horas', valor: 120 }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('👤 Usuário encontrado no localStorage:', user);

    if (user && user.profissional_id) {
      this.profissionalId = user.profissional_id;
      console.log('📅 Buscando dados do profissional:', this.profissionalId);
      this.carregarDisponibilidades();
      this.carregarAgendamentos();
    } else {
      console.error('⚠️ Nenhum profissional logado!');
    }
  }

  carregarDisponibilidades() {
    this.http.get(`http://localhost:3000/disponibilidade-semanal/${this.profissionalId}`)
      .subscribe({
        next: (res: any) => {
          console.log('✅ Disponibilidades:', res);
          this.disponibilidades = res;
          this.gerarHorariosSemana();
        },
        error: (err) => console.error('❌ Erro ao carregar disponibilidades:', err)
      });
  }

  carregarAgendamentos() {
    this.http.get(`http://localhost:3000/agendamentos/${this.profissionalId}`)
      .subscribe({
        next: (res: any) => {
          console.log('✅ Agendamentos:', res);
          this.agendamentos = res;
        },
        error: (err) => console.error('❌ Erro ao carregar agendamentos:', err)
      });
  }

  adicionarDisponibilidade() {
    if (!this.novoDia || !this.horaInicio || !this.horaFim || !this.duracaoSessao) {
      alert('Preencha todos os campos!');
      return;
    }

    const nova = {
      profissional_id: this.profissionalId,
      dia_semana: this.novoDia,
      hora_inicio: this.horaInicio,
      hora_fim: this.horaFim,
      duracao_sessao: this.duracaoSessao
    };

    this.http.post('http://localhost:3000/disponibilidade-semanal', nova)
      .subscribe({
        next: (res) => {
          console.log('✅ Adicionado com sucesso:', res);
          this.carregarDisponibilidades();
          this.novoDia = '';
          this.horaInicio = '';
          this.horaFim = '';
          this.duracaoSessao = '';
        },
        error: (err) => console.error('❌ Erro ao adicionar:', err)
      });
  }

  removerDisponibilidade(id: string) {
    if (!confirm('Deseja realmente remover este horário?')) return;

    this.http.delete(`http://localhost:3000/disponibilidade-semanal/${id}`)
      .subscribe({
        next: (res) => {
          console.log('✅ Disponibilidade removida:', res);
          this.carregarDisponibilidades();
        },
        error: (err) => console.error('❌ Erro ao remover:', err)
      });
  }

  removerAgendamento(id: string) {
    if (!confirm('Deseja realmente remover este agendamento?')) return;

    this.http.delete(`http://localhost:3000/agendamentos/${id}`)
      .subscribe({
        next: (res) => {
          console.log('✅ Agendamento removido:', res);
          this.carregarAgendamentos();
        },
        error: (err) => console.error('❌ Erro ao remover agendamento:', err)
      });
  }

  gerarHorariosSemana() {
    this.horariosPorDia = {};
    for (let dia of this.diasSemana) {
      this.horariosPorDia[dia.valor] = this.gerarHorariosDoDia(dia.valor);
    }
  }

  gerarHorariosDoDia(dia: string): string[] {
    const disponibilidade = this.disponibilidades.find(d => d.dia_semana === dia);
    if (!disponibilidade) return [];

    const horarios: string[] = [];
    let inicio = this.converterHoraParaMinutos(disponibilidade.hora_inicio);
    const fim = this.converterHoraParaMinutos(disponibilidade.hora_fim);
    const duracao = this.converterDuracao(disponibilidade.duracao_sessao);

    while (inicio < fim) {
      horarios.push(this.converterMinutosParaHora(inicio));
      inicio += duracao;
    }
    return horarios;
  }

  obterAgendamento(dia: any, hora: string) {
    return this.agendamentos.find(a => a.dia_semana === dia.valor && a.hora_inicio === hora);
  }

  converterHoraParaMinutos(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  }

  converterMinutosParaHora(minutos: number): string {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  converterDuracao(valor: string): number {
    switch (valor) {
      case '30min': return 30;
      case '1h': return 60;
      case '1h30': return 90;
      case '2h': return 120;
      default: return 60;
    }
  }

  traduzirDia(valor: string): string {
    const dia = this.diasSemana.find(d => d.valor === valor);
    return dia ? dia.nome : valor;
  }
}
