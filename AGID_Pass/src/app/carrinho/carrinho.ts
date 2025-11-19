import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-carrinho',
  templateUrl: './carrinho.html',
  styleUrls: ['./carrinho.css'],
  imports: [CommonModule]
})
export class Carrinho implements OnInit {
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

  ngOnInit() {
    // 🔹 Recupera o carrinho salvo no localStorage
    const carrinhoSalvo = localStorage.getItem('carrinho');
    if (carrinhoSalvo) {
      this.carrinho = JSON.parse(carrinhoSalvo);

      // 🔹 Marca os botões "Adicionado" conforme o carrinho salvo
      this.carrinho.forEach(item => {
        const plano = this.planos.find(p => p.nome === item.nome);
        if (plano) plano.adicionado = true;
      });
    }
  }

  // 🔹 Salva o carrinho no localStorage
  salvarCarrinho() {
    localStorage.setItem('carrinho', JSON.stringify(this.carrinho));

    const total = this.carrinho.reduce((sum, item) => sum + item.preco * (item.quantidade || 1), 0);
    localStorage.setItem('totalCarrinho', total.toString());
  }

  // 🔹 Adiciona item
  adicionarAoCarrinho(plano: any) {
    const jaExiste = this.carrinho.some(item => item.nome === plano.nome);
    if (jaExiste) return;

    plano.adicionado = true;
    this.carrinho.push({ ...plano, quantidade: 1 });
    this.salvarCarrinho();
  }

  // 🔹 Remove item individual
  removerDoCarrinho(plano: any) {
    const confirmar = confirm(`Deseja remover o plano "${plano.nome}" do carrinho?`);
    if (!confirmar) return;

    this.carrinho = this.carrinho.filter(item => item.nome !== plano.nome);
    const itemOriginal = this.planos.find(p => p.nome === plano.nome);
    if (itemOriginal) itemOriginal.adicionado = false;

    this.salvarCarrinho();
  }

  // 🔹 Cancela tudo
  cancelarCarrinho() {
    const confirmar = confirm('Tem certeza que deseja remover todas as assinaturas do carrinho?');
    if (!confirmar) return;

    this.carrinho = [];
    this.planos.forEach(p => (p.adicionado = false));
    localStorage.removeItem('carrinho');
  }

  // 🔹 Total calculado
  get total() {
    return this.carrinho.reduce((sum, item) => sum + item.preco * item.quantidade, 0);
  }

  toggleCarrinho() {
    this.mostrarCarrinho = !this.mostrarCarrinho;
  }

  // 🔹 Redireciona para página de pagamento (mantendo o carrinho salvo)
  finalizarAssinatura() {
    this.salvarCarrinho();
    this.router.navigate(['/pagamento']);
  }
}
