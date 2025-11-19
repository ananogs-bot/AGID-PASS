import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LoginResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // 🔹 LOGIN (Cliente ou Profissional)
  login(tipo: string, email: string, senha: string) {
    const endpoint = tipo === 'cliente' ? '/loginCliente' : '/loginProfissional';

    return this.http.post<LoginResponse>(
      `${this.baseUrl}${endpoint}`,
      { email, senha },
      { observe: 'response' }
    ).pipe(
      map((res) => {
        const body = res.body!;

        if (res.status === 200 && body.auth === true) {
          // 🧹 Limpa o localStorage antes de salvar novos dados
          localStorage.clear();

          // 🧩 Salva informações genéricas
          localStorage.setItem('user', JSON.stringify(body.user));
          localStorage.setItem('tipo', tipo);
          localStorage.setItem('email', email);

          // 🧩 Salva ID específico (profissional ou cliente)
          if (tipo === 'profissional' && body.user.profissional_id) {
            localStorage.setItem('profissional_id', body.user.profissional_id);
          }

          if (tipo === 'cliente' && body.user.cliente_id) {
            localStorage.setItem('cliente_id', body.user.cliente_id);
          }

          return { success: true, user: body.user };
        }

        return { success: false, status: res.status, body };
      }),
      catchError((err) => {
        return of({ success: false, status: err.status, body: err.error });
      })
    );
  }

  // 🔹 CADASTRO DE CLIENTE
  cadastrarCliente(cliente: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/cadastrarCliente`, cliente).pipe(
      map((res: any) => {
        if (res && res.success) return { success: true };
        if (res && res.motivo === 'email_existente') return { success: false, motivo: 'email_existente' };
        if (res && res.motivo === 'cpf_existente') return { success: false, motivo: 'cpf_existente' };
        return { success: false };
      }),
      catchError((err) => {
        console.error('❌ Erro HTTP no cadastro:', err);
        return of({ success: false });
      })
    );
  }

  // 🔹 RECUPERAR SENHA
  recuperarSenha(cpf: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/recuperarSenha`, { cpf }).pipe(
      map((res: any) => res),
      catchError(() => of({ success: false }))
    );
  }

  // 🔹 RECUPERAR E-MAIL
  recuperarEmail(cpf: string, confirmarEnvio: boolean = false): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/recuperarEmail`, { cpf, confirmarEnvio })
      .pipe(
        map((res: any) => res),
        catchError((err) => {
          console.error('❌ Erro ao recuperar e-mail:', err);
          return of({ success: false });
        })
      );
  }

  // 🔹 LOGOUT
  logout() {
    localStorage.clear();
  }
}
