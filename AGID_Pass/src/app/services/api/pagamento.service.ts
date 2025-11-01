import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pagamento } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class PagamentoService {
  private baseUrl = 'http://localhost:3000/pagamentos';

  constructor(private http: HttpClient) {}

  getPagamentos(): Observable<Pagamento[]> {
    return this.http.get<Pagamento[]>(this.baseUrl);
  }

  criarPagamento(pagamento: Pagamento): Observable<any> {
    return this.http.post(this.baseUrl, pagamento);
  }

}
