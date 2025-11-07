import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-carrinho',
  templateUrl: './carrinho.html',
  styleUrls: ['./carrinho.css'],
  imports: [CommonModule]
})
export class Carrinho {
  planos = [
    { nome: 'Manicure', preco: 80, adicionado: false },
    { nome: 'Barbearia', preco: 50, adicionado: false },
    { nome: 'Cabeleleiro', preco: 70, adicionado: false },
    { nome: 'Pedicure', preco: 100, adicionado: false },
    { nome: 'Sobrancelhas', preco: 60, adicionado: false },
    { nome: 'Cílios', preco: 270, adicionado: false },
    { nome: 'Maquiagem', preco: 120, adicionado: false }
  ];

  carrinho: any[] = [];
  mostrarCarrinho: boolean = false;

  constructor(private router: Router) {}

  adicionarAoCarrinho(plano: any) {
    // Impede adicionar o mesmo plano duas vezes
    const jaExiste = this.carrinho.some(item => item.nome === plano.nome);
    if (jaExiste) return;

    plano.adicionado = true;
    this.carrinho.push({ ...plano, quantidade: 1 });
  }

  removerDoCarrinho(plano: any) {
    this.carrinho = this.carrinho.filter(item => item.nome !== plano.nome);
    const itemOriginal = this.planos.find(p => p.nome === plano.nome);
    if (itemOriginal) itemOriginal.adicionado = false;
  }

  get total() {
    return this.carrinho.reduce((sum, item) => sum + item.preco * item.quantidade, 0);
  }

  toggleCarrinho() {
    this.mostrarCarrinho = !this.mostrarCarrinho;
  }

  finalizarAssinatura() {
    alert('Assinatura finalizada com sucesso! Redirecionando...');
    this.router.navigate(['/catalogo']);
  }
}
