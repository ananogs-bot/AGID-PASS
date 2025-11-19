import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class Perfil implements OnInit {
  tipoUsuario: string | null = null;
  dadosUsuario: any = null;
  editando = false;
  trocandoSenha = false;

  senhaAtual = '';
  novaSenha = '';
  confirmarSenha = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const tipo = localStorage.getItem('tipo');
    const userData = localStorage.getItem('user');
    if (!tipo || !userData) return;

    this.tipoUsuario = tipo;
    const user = JSON.parse(userData);
    const id = user.id;

    const endpoint =
      tipo === 'cliente'
        ? `http://localhost:3000/clientes/${id}`
        : `http://localhost:3000/profissionais/${id}`;

    this.http.get(endpoint).subscribe({
      next: (res: any) => {
        console.log('✅ Dados recebidos:', res);
        this.dadosUsuario = res;
      },
      error: (err) => console.error('Erro ao carregar perfil:', err)
    });
  }

  toggleEditar(): void {
    this.editando = !this.editando;
  }

  toggleTrocarSenha(): void {
    this.trocandoSenha = !this.trocandoSenha;
  }

  salvarAlteracoes(): void {
    if (!this.dadosUsuario) return;

    const tipo = this.tipoUsuario === 'cliente' ? 'clientes' : 'profissionais';
    const id =
      this.dadosUsuario.cliente_id || this.dadosUsuario.profissional_id;

    const endpoint = `http://localhost:3000/${tipo}/${id}`;

    // 🔹 Garante que todos os campos estão sendo enviados corretamente
    const dadosAtualizados =
      this.tipoUsuario === 'cliente'
        ? {
            cliente_nome: this.dadosUsuario.cliente_nome?.trim() || '',
            cliente_email: this.dadosUsuario.cliente_email?.trim() || '',
            cliente_telefone: this.dadosUsuario.cliente_telefone?.trim() || '',
            cliente_endereco: this.dadosUsuario.cliente_endereco?.trim() || '',
            cliente_cep: this.dadosUsuario.cliente_cep?.trim() || '',
            cliente_numero: this.dadosUsuario.cliente_numero?.trim() || '',
            cliente_complemento: this.dadosUsuario.cliente_complemento?.trim() || '',
            cliente_imagem: this.dadosUsuario.cliente_imagem?.trim() || ''
          }
        : {
            profissional_nome: this.dadosUsuario.profissional_nome?.trim() || '',
            profissional_email: this.dadosUsuario.profissional_email?.trim() || '',
            profissional_telefone: this.dadosUsuario.profissional_telefone?.trim() || '',
            profissional_endereco: this.dadosUsuario.profissional_endereco?.trim() || '',
            profissional_cep: this.dadosUsuario.profissional_cep?.trim() || '',
            profissional_numero: this.dadosUsuario.profissional_numero?.trim() || '',
            profissional_complemento: this.dadosUsuario.profissional_complemento?.trim() || '',
            profissional_imagem: this.dadosUsuario.profissional_imagem?.trim() || ''
          };

    console.log('📤 Enviando PUT:', dadosAtualizados);

    this.http.put(endpoint, dadosAtualizados).subscribe({
      next: (res: any) => {
        alert('✅ Perfil atualizado com sucesso!');
        console.log(res);
        this.editando = false;
      },
      error: (err) => {
        console.error('❌ Erro ao atualizar perfil:', err);
        alert('Erro ao atualizar perfil. Verifique os campos e tente novamente.');
      }
    });
  }

  alterarSenha(): void {
    if (!this.senhaAtual || !this.novaSenha || !this.confirmarSenha) {
      alert('Preencha todos os campos de senha.');
      return;
    }

    if (this.novaSenha !== this.confirmarSenha) {
      alert('As senhas novas não coincidem.');
      return;
    }

    const id =
      this.dadosUsuario.cliente_id || this.dadosUsuario.profissional_id;
    const endpoint =
      this.tipoUsuario === 'cliente'
        ? `http://localhost:3000/clientes/${id}/senha`
        : `http://localhost:3000/profissionais/${id}/senha`;

    const body = {
      senhaAtual: this.senhaAtual,
      novaSenha: this.novaSenha
    };

    this.http.put(endpoint, body).subscribe({
      next: () => {
        alert('Senha alterada com sucesso!');
        this.senhaAtual = '';
        this.novaSenha = '';
        this.confirmarSenha = '';
        this.trocandoSenha = false;
      },
      error: (err) => {
        console.error('Erro ao alterar senha:', err);
        alert('Erro ao alterar senha. Verifique se a senha atual está correta.');
      }
    });
  }
}
