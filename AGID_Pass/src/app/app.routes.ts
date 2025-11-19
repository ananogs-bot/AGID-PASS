import { Routes } from '@angular/router';
import { Home } from './home/home';
import { CadastroCliente } from './cadastro-cliente/cadastro-cliente';
import { CadastroProfissional } from './cadastro-profissional/cadastro-profissional';
import { Login } from './login/login';
import { Catalogo } from './catalogo/catalogo';
import { Beneficios } from './beneficios/beneficios';
import { Agendamento } from './agendamento/agendamento';
import { Carrinho } from './carrinho/carrinho';
import { Pagamento } from './pagamento/pagamento';
import { AgendaProfissional } from './agenda-profissional/agenda-profissional';
import { Perfil } from './perfil/perfil';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'cadastro-cliente', component: CadastroCliente},
  { path: 'cadastro-profissional', component: CadastroProfissional},
  { path: 'login', component: Login },
  { path: 'catalogo', component: Catalogo },
  { path: 'beneficios', component: Beneficios },
  { path: 'agendamento', component: Agendamento },
  { path: 'agendamento/:id', component: Agendamento },
  { path: 'carrinho', component: Carrinho },
  { path: 'pagamento', component: Pagamento },
  { path: 'agenda-profissional', component: AgendaProfissional },
  { path: 'perfil', component: Perfil }
];


