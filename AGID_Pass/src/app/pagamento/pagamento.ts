import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface CarrinhoItem {
  nome: string;
  preco: number;
  quantidade: number;
}

type PagamentoStatus = 'pendente' | 'sucesso' | 'erroCartao' | 'tempoEsgotado' | null;

interface PagamentoPendente {
  metodo: 'PIX' | 'CARTAO';
  carrinho: CarrinhoItem[];
  total: number;
  criadoEm: string;
  info?: { referenciaPIX?: string };
}

@Component({
  standalone: true,
  selector: 'app-pagamento',
  templateUrl: './pagamento.html',
  styleUrls: ['./pagamento.css'],
  imports: [CommonModule, FormsModule, DecimalPipe, RouterLink]
})
export class Pagamento implements OnInit {
  carrinho: CarrinhoItem[] = [];
  total: number = 0;

  pagamentoStatus: PagamentoStatus = null;
  pagamentoPendente: PagamentoPendente | null = null;

  // Form cartão
  numeroCartao: string = '';
  nomeCartao: string = '';
  validade: string = '';
  cvv: string = '';

  // PIX
  pixReferencia: string = '';
  pixTempoSegundos = 15;
  pixTimerId: any = null;
  pixTempoRestante: number = 0;

  constructor(private router: Router) {}

  ngOnInit() {
    const carrinhoSalvo = localStorage.getItem('carrinho');
    if (carrinhoSalvo) {
      this.carrinho = JSON.parse(carrinhoSalvo);
      this.total = this.carrinho.reduce((s, it) => s + it.preco * (it.quantidade || 1), 0);
    } else {
      this.router.navigate(['/catalogo']);
      return;
    }

    const pend = localStorage.getItem('pagamentoPendente');
    if (pend) {
      try {
        const obj: PagamentoPendente = JSON.parse(pend);
        this.pagamentoPendente = obj;
        if (obj.metodo === 'PIX') {
          this.pixReferencia = obj.info?.referenciaPIX || '';
          this.iniciarTimerPIX();
        }
      } catch {}
    }
  }

  // -------------------------
  // CARTÃO
  // -------------------------
  private somenteDigitos(valor: string) {
    return valor.replace(/\D/g, '');
  }

  validarCartaoLuhn(numero: string): boolean {
    const s = this.somenteDigitos(numero);
    let soma = 0;
    let dupla = false;
    for (let i = s.length - 1; i >= 0; i--) {
      let d = parseInt(s[i], 10);
      if (dupla) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      soma += d;
      dupla = !dupla;
    }
    return soma % 10 === 0;
  }

  validarValidadeFormato(val: string): boolean {
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(val)) return false;
    const [mm, yy] = val.split('/').map(x => parseInt(x, 10));
    const agora = new Date();
    const ano = 2000 + yy;
    const ultimoDoMes = new Date(ano, mm, 0, 23, 59, 59, 999);
    return ultimoDoMes >= agora;
  }

  validarCartaoBasico(): boolean {
    const numero = this.somenteDigitos(this.numeroCartao);
    if (!(numero.length === 15 || numero.length === 16)) return false;
    if (!this.validarCartaoLuhn(numero)) return false;
    if (!this.validarValidadeFormato(this.validade)) return false;
    if (!/^\d{3,4}$/.test(this.cvv)) return false;
    if (this.nomeCartao.trim().length < 2) return false;
    return true;
  }

  pagarCartao() {
    this.pagamentoStatus = null;
    if (!this.validarCartaoBasico()) {
      this.pagamentoStatus = 'erroCartao';
      return;
    }
    this.concluirPagamentoComSucesso('CARTAO');
  }

  // -------------------------
  // PIX
  // -------------------------
  pagarPIX() {
    this.pagamentoStatus = 'pendente';
    this.pixReferencia = `PIX-${Date.now().toString().slice(-6)}`;

    const pend: PagamentoPendente = {
      metodo: 'PIX',
      carrinho: this.carrinho,
      total: this.total,
      criadoEm: new Date().toISOString(),
      info: { referenciaPIX: this.pixReferencia }
    };
    localStorage.setItem('pagamentoPendente', JSON.stringify(pend));
    this.pagamentoPendente = pend;

    this.iniciarTimerPIX();
  }

  iniciarTimerPIX() {
    if (this.pixTimerId) clearInterval(this.pixTimerId);
    this.pixTempoRestante = this.pixTempoSegundos;

    this.pixTimerId = setInterval(() => {
      this.pixTempoRestante--;
      if (this.pixTempoRestante <= 0) {
        clearInterval(this.pixTimerId);
        this.pixTimerId = null;
        this.pagamentoStatus = 'tempoEsgotado';
      }
    }, 1000);
  }

  gerarNovoPIX() {
    if (!confirm('O tempo do PIX expirou. Deseja gerar um novo código?')) return;
    this.pagarPIX();
  }

  confirmarPIX() {
    if (this.pagamentoStatus !== 'pendente') {
      alert('Não há pagamento PIX pendente.');
      return;
    }
    this.concluirPagamentoComSucesso('PIX');
  }

  // -------------------------
  // Conclusão
  // -------------------------
  private concluirPagamentoComSucesso(metodo: 'PIX' | 'CARTAO') {
    localStorage.removeItem('pagamentoPendente');
    this.pagamentoPendente = null;
    localStorage.removeItem('carrinho');
    this.carrinho = [];
    this.total = 0;
    this.pagamentoStatus = 'sucesso';
    if (this.pixTimerId) clearInterval(this.pixTimerId);
    setTimeout(() => this.router.navigate(['/perfil']), 1000);
  }

  // -------------------------
  // Cancelar ou Retomar
  // -------------------------
  retentarPagamento() {
    this.pagamentoStatus = null;
    if (this.pagamentoPendente?.metodo === 'PIX') {
      this.pixReferencia = this.pagamentoPendente.info?.referenciaPIX || '';
      this.iniciarTimerPIX();
    }
  }

  cancelarPagamentoPendente() {
    if (!confirm('Deseja cancelar o pagamento pendente?')) return;
    localStorage.removeItem('pagamentoPendente');
    this.pagamentoPendente = null;
    this.pagamentoStatus = null;
  }
}
