import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  tipoUsuario: string | null = null;
  usuarioId: string | null = null;

  ngOnInit(): void {
    // Lê os dados do localStorage
    const tipo = localStorage.getItem('tipo');
    const user = localStorage.getItem('user');

    if (tipo && user) {
      try {
        const userObj = JSON.parse(user);
        this.tipoUsuario = tipo;
        this.usuarioId = userObj.id;
      } catch (error) {
        console.error('Erro ao ler usuário do localStorage:', error);
      }
    }

    console.log('Tipo detectado:', this.tipoUsuario);
    console.log('ID detectado:', this.usuarioId);
  }

  logout(): void {
    localStorage.clear();
    window.location.reload();
  }
}
