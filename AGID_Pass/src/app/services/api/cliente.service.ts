import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private baseUrl = 'http://localhost:3000/clientes';

  constructor(private http: HttpClient) {}

  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.baseUrl);
  }

  cadastrarCliente(cliente: any) {
    return this.http.post(`${this.baseUrl}`, cliente);
  }

  atualizarCliente(clienteId: string, cliente: Cliente): Observable<any> {
    return this.http.put(`${this.baseUrl}/${clienteId}`, cliente);
  }

  deletarCliente(clienteId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${clienteId}`);
  }
}
