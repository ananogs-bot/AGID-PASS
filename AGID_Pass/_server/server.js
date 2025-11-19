import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';


const app = express();
app.use(cors());
app.use(express.json());

// Conexão MySQL (modo Promise)
const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Facens@123',
  database: 'AGIDPASS'
});

console.log('✅ Conectado ao MySQL!');

//////////////////////////////
// CLIENTES
//////////////////////////////

// Criar cliente
app.post('/clientes', async (req, res) => {
  const {
    cliente_nome,
    cliente_email,
    cliente_senha,
    cliente_telefone,
    cliente_endereco,
    cliente_cpf,
    cliente_imagem
  } = req.body;

  if (!cliente_nome || !cliente_email || !cliente_senha || !cliente_telefone || !cliente_endereco || !cliente_cpf) {
    return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
  }

  const cliente_id = uuidv4();

  try {
    const sql = `
      INSERT INTO CLIENTE (
        cliente_id, cliente_nome, cliente_email, cliente_senha,
        cliente_telefone, cliente_endereco, cliente_cpf, cliente_imagem
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      cliente_id,
      cliente_nome,
      cliente_email,
      cliente_senha,
      cliente_telefone,
      cliente_endereco,
      cliente_cpf,
      cliente_imagem || null
    ];

    await db.query(sql, values);
    res.status(201).json({ success: true, message: 'Cliente criado com sucesso!', cliente_id });
  } catch (err) {
    console.error('Erro ao inserir cliente:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Listar clientes
app.get('/clientes', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM CLIENTE');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar cliente
app.put('/clientes/:id', async (req, res) => {
  const { nome, email, senha, telefone, cpf, endereco, imagem } = req.body;
  try {
    await db.query(
      'UPDATE CLIENTE SET cliente_nome=?, cliente_email=?, cliente_senha=?, cliente_telefone=?, cliente_cpf=?, cliente_endereco=?, cliente_imagem=? WHERE cliente_id=?',
      [nome, email, senha, telefone, cpf, endereco, imagem, req.params.id]
    );
    res.json({ message: 'Cliente atualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deletar cliente
app.delete('/clientes/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM CLIENTE WHERE cliente_id=?', [req.params.id]);
    res.json({ message: 'Cliente deletado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buscar cliente por ID
app.get('/clientes/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM CLIENTE WHERE cliente_id = ?', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // ✅ Retorna o cliente encontrado
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar cliente:', err);
    res.status(500).json({ error: err.message });
  }
});

// Login cliente
app.post('/loginCliente', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM CLIENTE WHERE cliente_email = ?', [email]);
    if (rows.length === 0) return res.status(400).json({ auth: false, message: 'E-mail não encontrado' });

    const usuario = rows[0];
    if (usuario.cliente_senha !== senha) return res.status(401).json({ auth: false, message: 'Senha incorreta' });

    res.status(200).json({
      auth: true,
      user: {
        id: usuario.cliente_id,
        nome: usuario.cliente_nome,
        email: usuario.cliente_email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verificar se e-mail existe
app.get('/clientes/email/:email', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM CLIENTE WHERE cliente_email = ?', [req.params.email]);
    res.json({ emailExiste: rows.length > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recuperar e-mail pelo CPF
app.post('/recuperarEmail', async (req, res) => {
  const { cpf, confirmarEnvio } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT cliente_email, cliente_telefone FROM CLIENTE WHERE cliente_cpf = ?',
      [cpf]
    );

    if (rows.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'CPF não encontrado no sistema.'
      });
    }

    const { cliente_email, cliente_telefone } = rows[0];

    // Mascarar e-mail
    const [nome, dominio] = cliente_email.split('@');
    const emailMascarado =
      nome.slice(0, 2) + '***' + nome.slice(-1) + '@' + dominio;

    // Se confirmarEnvio for true, simula notificação por celular
    if (confirmarEnvio) {
      console.log(
        `📱 Enviando SMS para ${cliente_telefone}: Seu e-mail cadastrado é ${cliente_email}`
      );

      return res.status(200).json({
        success: true,
        message: 'Notificação enviada para o número cadastrado.',
        telefone: cliente_telefone
      });
    }

    // Se não confirmou, apenas retorna as informações mascaradas
    res.status(200).json({
      success: true,
      telefone: cliente_telefone,
      emailMascarado,
      message:
        'Confirme se deseja receber uma notificação com o e-mail completo.'
    });
  } catch (error) {
    console.error('Erro ao recuperar e-mail:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor.',
      error: error.message
    });
  }
});

// Recuperar senha pelo CPF
app.post('/recuperarSenha', async (req, res) => {
  const { cpf } = req.body;

  if (!cpf || cpf.trim().length !== 11 || !/^\d+$/.test(cpf)) {
    return res.status(400).json({
      success: false,
      message: 'CPF inválido. Digite apenas números (11 dígitos).'
    });
  }

  try {
    const [clienteRows] = await db.query(
      'SELECT cliente_id AS id, cliente_email AS email, cliente_nome AS nome FROM CLIENTE WHERE cliente_cpf = ?',
      [cpf]
    );

    const [profRows] = await db.query(
      'SELECT profissional_id AS id, profissional_email AS email, profissional_nome AS nome FROM PROFISSIONAL WHERE profissional_cnpj = ?',
      [cpf]
    );

    let usuario = null;
    let tipo = '';

    if (clienteRows.length > 0) {
      usuario = clienteRows[0];
      tipo = 'cliente';
    } else if (profRows.length > 0) {
      usuario = profRows[0];
      tipo = 'profissional';
    } else {
      return res.status(200).json({
        success: false,
        message: 'CPF não encontrado no sistema.'
      });
    }

    const { id, email, nome } = usuario;

    // Gera senha de 8 caracteres
    const gerarSenhaTemporaria = () => {
      const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let senha = '';
      for (let i = 0; i < 8; i++) {
        senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
      }
      return senha;
    };

    const senhaTemporaria = gerarSenhaTemporaria();

    if (tipo === 'cliente') {
      await db.query('UPDATE CLIENTE SET cliente_senha = ? WHERE cliente_id = ?', [senhaTemporaria, id]);
    } else {
      await db.query('UPDATE PROFISSIONAL SET profissional_senha = ? WHERE profissional_id = ?', [senhaTemporaria, id]);
    }

    console.log(`📧 Enviando senha temporária para ${email}: ${senhaTemporaria}`);

    res.status(200).json({
      success: true,
      message: 'Uma senha temporária foi enviada para o e-mail cadastrado. Faça login e altere-a em seguida.',
      email,
      nome
    });
  } catch (error) {
    console.error('❌ Erro ao recuperar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor.',
      error: error.message
    });
  }
});


// Alterar senha do cliente
app.put('/clientes/:id/senha', async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;
    const { id } = req.params;

    // Busca o cliente
    const [rows] = await db.query('SELECT cliente_senha FROM CLIENTE WHERE cliente_id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });

    const senhaCorreta = rows[0].cliente_senha === senhaAtual;
    if (!senhaCorreta) return res.status(401).json({ error: 'Senha atual incorreta' });

    // Atualiza a senha
    await db.query('UPDATE CLIENTE SET cliente_senha = ? WHERE cliente_id = ?', [novaSenha, id]);
    res.json({ message: 'Senha alterada com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar cliente ou profissional
app.put(['/clientes/:id', '/profissionais/:id'], async (req, res) => {
  const { id } = req.params;
  const tipo = req.path.includes('profissionais') ? 'profissionais' : 'clientes';

  const tabela =
    tipo === 'profissionais' ? 'PROFISSIONAL' :
    tipo === 'clientes' ? 'CLIENTE' : null;

  if (!tabela) return res.status(400).json({ error: 'Tipo inválido' });

  // Campos possíveis (você pode ajustar conforme suas colunas do BD)
  const campos = tipo === 'profissionais' ? [
    'profissional_nome',
    'profissional_email',
    'profissional_telefone',
    'profissional_endereco',
    'profissional_cpf',
    'profissional_cep',
    'profissional_numero',
    'profissional_complemento',
    'profissional_imagem'
  ] : [
    'cliente_nome',
    'cliente_email',
    'cliente_telefone',
    'cliente_endereco',
    'cliente_cpf',
    'cliente_cep',
    'cliente_numero',
    'cliente_complemento',
    'cliente_imagem'
  ];

  try {
    const updates = [];
    const values = [];

    // Monta dinamicamente os campos que vieram no body
    for (const campo of campos) {
      if (req.body[campo] !== undefined) {
        updates.push(`${campo} = ?`);
        values.push(req.body[campo]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo enviado para atualização' });
    }

    const idCampo = tipo === 'profissionais' ? 'profissional_id' : 'cliente_id';
    values.push(id);

    const sql = `UPDATE ${tabela} SET ${updates.join(', ')} WHERE ${idCampo} = ?`;

    await db.query(sql, values);
    res.json({ message: 'Dados atualizados com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//////////////////////////////
// PROFISSIONAIS
//////////////////////////////

// Listar todos profissionais
app.get('/profissionais', async (req, res) => {
  try {
    const sql = `
      SELECT
        p.profissional_id,
        p.profissional_nome,
        COALESCE(p.profissional_imagem, '') AS profissional_imagem,
        p.profissional_endereco,
        GROUP_CONCAT(c.categoria_nome SEPARATOR ' - ') AS categorias
      FROM PROFISSIONAL p
      LEFT JOIN PROFISSIONAL_CATEGORIA pc ON p.profissional_id = pc.profissional_id
      LEFT JOIN CATEGORIA c ON pc.categoria_id = c.categoria_id
      GROUP BY p.profissional_id
    `;
    const [result] = await db.query(sql);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/profissionais/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM PROFISSIONAL WHERE profissional_id = ?', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar profissional:', err);
    res.status(500).json({ error: err.message });
  }
});

// Buscar profissional detalhado
app.get('/profissionais/:id/detalhes', async (req, res) => {
  try {
    const [profResult] = await db.query('SELECT * FROM PROFISSIONAL WHERE profissional_id = ?', [req.params.id]);
    if (profResult.length === 0) return res.status(404).json({ error: 'Profissional não encontrado' });

    const [cats] = await db.query(`
      SELECT c.categoria_id, c.categoria_nome
      FROM CATEGORIA c
      INNER JOIN PROFISSIONAL_CATEGORIA pc ON c.categoria_id = pc.categoria_id
      WHERE pc.profissional_id = ?
    `, [req.params.id]);

    const profissional = { ...profResult[0], categoriasList: cats };
    res.json(profissional);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/disponibilidade-semanal/:profissional_id", async (req, res) => {
  const { profissional_id } = req.params;

  try {
    const [result] = await db.query(
      "SELECT * FROM DISPONIBILIDADE_PROFISSIONAL WHERE profissional_id = ?",
      [profissional_id]
    );

    res.json(result);
  } catch (err) {
    console.error("❌ Erro ao buscar disponibilidades:", err);
    res.status(500).json({ error: "Erro ao buscar disponibilidades" });
  }
});

app.post("/disponibilidade-semanal", (req, res) => {
  const { profissional_id, dia_semana, hora_inicio, hora_fim, duracao_minutos } = req.body;

  if (!profissional_id || !dia_semana || !hora_inicio || !hora_fim)
    return res.status(400).json({ error: "Campos obrigatórios faltando." });

  const disponibilidade_id = uuidv4();
  const sql = `
    INSERT INTO DISPONIBILIDADE_PROFISSIONAL
    (disponibilidade_id, profissional_id, dia_semana, hora_inicio, hora_fim, duracao_minutos)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [disponibilidade_id, profissional_id, dia_semana, hora_inicio, hora_fim, duracao_minutos || 60], (err) => {
    if (err) return res.status(500).json({ error: "Erro ao adicionar disponibilidade" });
    res.json({ success: true });
  });
});

app.get("/agenda/:profissionalId", async (req, res) => {
  const { profissionalId } = req.params;
  try {
    const [rows] = await con.query(`
      SELECT
          d.dia_semana,
          d.hora_inicio,
          d.hora_fim,
          d.duracao_sessao,
          a.agendamento_id,
          a.agendamento_data_agendamento,
          a.agendamento_horario,
          c.cliente_nome,
          c.cliente_email,
          cat.categoria_nome
      FROM DISPONIBILIDADE_PROFISSIONAL d
      LEFT JOIN AGENDAMENTO a
          ON a.profissional_id = d.profissional_id
          AND DAYNAME(a.agendamento_data_agendamento) = d.dia_semana
      LEFT JOIN CLIENTE c
          ON a.cliente_id = c.cliente_id
      LEFT JOIN CATEGORIA cat
          ON a.categoria_id = cat.categoria_id
      WHERE d.profissional_id = ?
      ORDER BY FIELD(d.dia_semana, 'domingo','segunda','terca','quarta','quinta','sexta','sabado'), d.hora_inicio;
    `, [profissionalId]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar agenda" });
  }
});


app.delete("/disponibilidade-semanal/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(
      "DELETE FROM DISPONIBILIDADE_PROFISSIONAL WHERE disponibilidade_id = ?",
      [id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Erro ao deletar disponibilidade:", err);
    res.status(500).json({ error: "Erro ao deletar disponibilidade" });
  }
});


// Criar profissional
app.post('/profissionais', async (req, res) => {
  const {
    profissional_nome,
    profissional_email,
    profissional_senha,
    profissional_telefone,
    profissional_cnpj,
    profissional_endereco,
    profissional_descricao,
    profissional_imagem,
    categorias
  } = req.body;

  if (!profissional_nome || !profissional_email || !profissional_senha) {
    return res.status(400).json({ message: 'Campos obrigatórios faltando' });
  }

  const profissional_id = uuidv4();
  try {
    await db.query(
      `INSERT INTO PROFISSIONAL
      (profissional_id, profissional_nome, profissional_email, profissional_senha, profissional_telefone, profissional_cnpj, profissional_endereco, profissional_descricao, profissional_imagem)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [profissional_id, profissional_nome, profissional_email, profissional_senha, profissional_telefone, profissional_cnpj, profissional_endereco, profissional_descricao, profissional_imagem]
    );

    if (categorias && categorias.length > 0) {
      const values = categorias.map(catId => [profissional_id, catId]);
      await db.query('INSERT INTO PROFISSIONAL_CATEGORIA (profissional_id, categoria_id) VALUES ?', [values]);
    }

    res.status(201).json({ message: 'Profissional cadastrado com sucesso', profissional_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login profissional
app.post('/loginProfissional', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const [result] = await db.query('SELECT * FROM PROFISSIONAL WHERE profissional_email = ? AND profissional_senha = ?', [email, senha]);
    if (result.length > 0) res.json({ auth: true, user: result[0] });
    else res.json({ auth: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deletar profissional
app.delete('/profissionais/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM PROFISSIONAL WHERE profissional_id=?', [req.params.id]);
    res.json({ message: 'Profissional deletado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//////////////////////////////
// CATEGORIAS
//////////////////////////////
app.get('/categorias', async (req, res) => {
  try {
    const [results] = await db.query('SELECT categoria_id, categoria_nome FROM CATEGORIA ORDER BY categoria_nome');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//////////////////////////////
// PAGAMENTOS
//////////////////////////////
app.get('/pagamentos', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM PAGAMENTO');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/pagamentos', async (req, res) => {
  const { nome, forma_pagamento } = req.body;
  try {
    await db.query('INSERT INTO PAGAMENTO (pagamento_nome, pagamento_forma_pagamento) VALUES (?, ?)', [nome, forma_pagamento]);
    res.json({ message: 'Pagamento criado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//////////////////////////////
// AGENDAMENTOS
//////////////////////////////
app.get('/agendamentos', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM AGENDAMENTO');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/agendamentos/:id', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM AGENDAMENTO WHERE agendamento_id=?', [req.params.id]);
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/agendamentos', async (req, res) => {
  const { cliente_id, profissional_id, categoria_nome, pagamento_id, agendamento_data_agendamento, agendamento_horario } = req.body;

  try {
    const [cat] = await db.query('SELECT categoria_id FROM CATEGORIA WHERE categoria_nome = ?', [categoria_nome]);
    if (cat.length === 0) return res.status(400).json({ error: 'Categoria não encontrada' });

    await db.query(`
      INSERT INTO AGENDAMENTO
      (cliente_id, profissional_id, categoria_id, pagamento_id, agendamento_data_agendamento, agendamento_horario, agendamento_classificacao, agendamento_confirmacao)
      VALUES (?, ?, ?, ?, ?, ?, NULL, FALSE)
    `, [cliente_id, profissional_id, cat[0].categoria_id, pagamento_id, agendamento_data_agendamento, agendamento_horario]);

    res.json({ message: 'Agendamento criado com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/agendamentos/:id', async (req, res) => {
  const { cliente_id, profissional_id, categoria_id, pagamento_id, agendamento_data_agendamento, agendamento_horario } = req.body;
  try {
    await db.query(`
      UPDATE AGENDAMENTO
      SET cliente_id=?, profissional_id=?, categoria_id=?, pagamento_id=?, agendamento_data_agendamento=?, agendamento_horario=?
      WHERE agendamento_id=?
    `, [cliente_id, profissional_id, categoria_id, pagamento_id, agendamento_data_agendamento, agendamento_horario, req.params.id]);
    res.json({ message: 'Agendamento atualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/agendamentos/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM AGENDAMENTO WHERE agendamento_id=?', [req.params.id]);
    res.json({ message: 'Agendamento deletado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//////////////////////////////
// START SERVER
//////////////////////////////
app.listen(3000, () => console.log('🚀 Servidor rodando na porta 3000'));
