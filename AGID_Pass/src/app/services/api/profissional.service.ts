import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profissional} from '../models/models';
import { getProfissional } from '../models/models';

export interface Categoria {
  categoria_id: number;
  categoria_nome: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfissionalService {
  private baseUrl = 'http://localhost:3000/profissionais';
  private categoriaUrl = 'http://localhost:3000/categorias'; // rota para categorias

  constructor(private http: HttpClient) {}

  getProfissionais(): Observable<getProfissional[]> {
    console.log('Buscando profissionais');
    return this.http.get<getProfissional[]>(this.baseUrl);
  }

  cadastrarProfissional(profissional: Profissional): Observable<any> {
    console.log('Cadastrando profissional:', profissional);
    return this.http.post(this.baseUrl, profissional);
  }

  atualizarProfissional(profissionalId: string, profissional: Profissional): Observable<any> {
    console.log('Atualizando profissional:', profissionalId, profissional);
    return this.http.put(`${this.baseUrl}/${profissionalId}`, profissional);
  }

  deletarProfissional(profissionalId: string): Observable<any> {
    console.log('Deletando profissional com ID:', profissionalId);
    return this.http.delete(`${this.baseUrl}/${profissionalId}`);
  }

  // Novo método para pegar categorias
  getCategorias(): Observable<Categoria[]> {
    console.log('Buscando categorias');
    return this.http.get<Categoria[]>(this.categoriaUrl);
  }
}
