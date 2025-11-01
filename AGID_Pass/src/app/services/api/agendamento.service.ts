import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agendamento } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AgendamentoService {
  private baseUrl = 'http://localhost:3000/agendamentos';

  constructor(private http: HttpClient) {}

  getAgendamentos(): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(this.baseUrl);
  }

  criarAgendamento(agendamento: Agendamento): Observable<any> {
    return this.http.post(this.baseUrl, agendamento);
  }

  atualizarAgendamento(agendamentoId: string, agendamento: Agendamento): Observable<any> {
    return this.http.put(`${this.baseUrl}/${agendamentoId}`, agendamento);
  }

  deletarAgendamento(agendamentoId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${agendamentoId}`);
  }
}
