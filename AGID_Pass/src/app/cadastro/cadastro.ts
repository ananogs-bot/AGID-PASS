import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // <-- Import necessário

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, RouterModule], // <-- Adicionar RouterModule
  templateUrl: './cadastro.html'
})

export class Cadastro {}
