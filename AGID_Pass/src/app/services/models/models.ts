export interface Cliente {
  cliente_nome: string;
  cliente_email: string;
  cliente_telefone: string;
  cliente_endereco: string;
  cliente_cpf: string;
  cliente_senha: string;
  cliente_imagem?: string;
}


export interface Profissional {
  profissional_nome: string;
  profissional_email: string;
  profissional_senha: string;
  profissional_telefone: string;
  profissional_cnpj: string;
  profissional_descricao: string;
  profissional_imagem: string;
  profissional_cep: string;
  profissional_numero: string;
  profissional_endereco?: string;
}

export interface getProfissional {
  profissional_id: string;
  profissional_nome: string;
  profissional_email: string;
  profissional_senha: string;
  profissional_telefone: string;
  profissional_cnpj: string;
  profissional_descricao: string;
  profissional_imagem: string;
  profissional_cep: string;
  profissional_numero: string;
  profissional_endereco?: string;
}

export interface Pagamento {
  pagamento_id: string;
  pagamento_nome: string;
  pagamento_forma_pagamento: string;
}

export interface Agendamento {
  agendamento_id: string;
  agendamento_data_agendamento: string;
  agendamento_horario: string;
  cliente_id: string;
  profissional_id: string;
  categoria_id: number;
  pagamento_id: string;
}
