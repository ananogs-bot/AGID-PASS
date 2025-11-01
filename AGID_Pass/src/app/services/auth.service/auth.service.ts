import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:3000'; // sua API backend

  constructor(private http: HttpClient) {}

  login(tipo: string, email: string, senha: string): Observable<any> {
    const endpoint = tipo === 'cliente' ? '/loginCliente' : '/loginProfissional';

    return this.http.post(`${this.baseUrl}${endpoint}`, { email, senha }).pipe(
      map((res: any) => {
        // se o backend responder sucesso
        if (res && res.auth === true) {
          localStorage.setItem('user', JSON.stringify(res.user));
          return { success: true, user: res.user };
        } else {
          return { success: false };
        }
      }),
      catchError(() => of({ success: false }))
    );
  }

  logout() {
    localStorage.removeItem('user');
  }
}
