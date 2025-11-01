
import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(express.json());

// Conexão MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Facens@123',
  database: 'AGIDPASS'
});

db.connect(err => {
  if (err) console.log('Erro na conexão:', err);
  else console.log('Conectado ao MySQL!');
});


//////////////////////////////
// Clientes
//////////////////////////////

app.post('/clientes', (req, res) => {
  const {
    cliente_nome,
    cliente_email,
    cliente_senha,
    cliente_telefone,
    cliente_endereco,
    cliente_cpf,
    cliente_imagem
  } = req.body;

  // Verifica se todos os campos obrigatórios foram enviados
  if (!cliente_nome || !cliente_email || !cliente_senha || !cliente_telefone || !cliente_endereco || !cliente_cpf) {
    return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
  }

  const cliente_id = uuidv4();

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
    cliente_imagem || null // garante que seja NULL se não vier nada
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Erro no MySQL:', err); // mostra o erro completo no console
      return res.status(500).json({ error: 'Erro ao inserir cliente', detalhes: err.message });
    }
    res.status(201).json({ message: 'Cliente criado com sucesso', cliente_id });
  });
});

//////////////////////////////
// Listar clientes
app.get('/clientes', (req, res) => {
  db.query('SELECT * FROM CLIENTE', (err, results) => {
    if (err) res.status(500).send(err);
    else res.json(results);
  });
});


// Atualizar cliente
app.put('/clientes/:id', (req, res) => {
  const { nome, email, senha, telefone, cpf, endereco, imagem } = req.body;
  db.query(
    'UPDATE CLIENTE SET cliente_nome=?, cliente_email=?, cliente_senha=?, cliente_telefone=?, cliente_cpf=?, cliente_endereco=?, cliente_imagem=? WHERE cliente_id=?',
    [nome, email, senha, telefone, cpf, endereco, imagem, req.params.id],
    (err) => {
      if(err) res.status(500).send(err);
      else res.json({ message: 'Cliente atualizado' });
    }
  );
});

// Deletar cliente
app.delete('/clientes/:id', (req, res) => {
  db.query('DELETE FROM CLIENTE WHERE cliente_id=?', [req.params.id], (err) => {
    if(err) res.status(500).send(err);
    else res.json({ message: 'Cliente deletado' });
  });
});

// login cliente
app.post("/loginCliente", (req, res) => {
  const { email, senha } = req.body;

  const sql = "SELECT * FROM CLIENTE WHERE cliente_email = ? AND cliente_senha = ?";
  db.query(sql, [email, senha], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Erro no servidor." });
    }

    if (result.length > 0) {
      res.json({ auth: true, user: result[0] });
    } else {
      res.json({ auth: false });
    }
  });
});


//////////////////////////////
// Profissionais
//////////////////////////////

// Listar todos profissionais

app.get('/profissionais', (req, res) => {
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

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Erro ao buscar profissionais:', err);
      return res.status(500).json({ error: 'Erro no servidor' });
    }

    console.log('Resultado /profissionais:', JSON.stringify(result, null, 2)); // <--- loga o JSON
    res.json(result);
  });
});


// Buscar profissional por ID
app.get('/profissionais/:id', (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT
      p.*,
      COALESCE(GROUP_CONCAT(c.categoria_nome SEPARATOR ' - '), '') AS categorias
    FROM PROFISSIONAL p
    LEFT JOIN PROFISSIONAL_CATEGORIA pc ON p.profissional_id = pc.profissional_id
    LEFT JOIN CATEGORIA c ON pc.categoria_id = c.categoria_id
    WHERE p.profissional_id = ?
    GROUP BY p.profissional_id
  `;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro no servidor' });
    }
    res.json(result[0]);
  });
});



app.post('/profissionais', (req, res) => {
  const {
    profissional_nome,
    profissional_email,
    profissional_senha,
    profissional_telefone,
    profissional_cnpj,
    profissional_endereco,
    profissional_descricao,
    profissional_imagem,
    categorias // array de categoria_id
  } = req.body;

  if (!profissional_nome || !profissional_email || !profissional_senha) {
    return res.status(400).json({ message: 'Campos obrigatórios faltando' });
  }

  const profissional_id = uuidv4(); // gera UUID no Node

  const sql = `
    INSERT INTO PROFISSIONAL
    (profissional_id, profissional_nome, profissional_email, profissional_senha, profissional_telefone, profissional_cnpj, profissional_endereco, profissional_descricao, profissional_imagem)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [profissional_id, profissional_nome, profissional_email, profissional_senha, profissional_telefone, profissional_cnpj, profissional_endereco, profissional_descricao, profissional_imagem],
    (err) => {
      if (err) {
        console.error('Erro ao cadastrar profissional:', err);
        return res.status(500).json({ error: 'Erro ao cadastrar profissional', details: err });
      }

      // ✅ Inserir categorias
      if (categorias && categorias.length > 0) {
        const values = categorias.map(catId => [profissional_id, catId]);
        const sqlCat = `INSERT INTO PROFISSIONAL_CATEGORIA (profissional_id, categoria_id) VALUES ?`;
        db.query(sqlCat, [values], (errCat) => {
          if (errCat) {
            console.error('Erro ao associar categorias:', errCat);
            return res.status(500).json({ error: 'Erro ao associar categorias', details: errCat });
          }
          res.status(201).json({ message: 'Profissional cadastrado com sucesso', profissional_id });
        });
      } else {
        res.status(201).json({ message: 'Profissional cadastrado com sucesso', profissional_id });
      }
    }
  );
});

// login profissional (se existir tabela separada)
app.post("/loginProfissional", (req, res) => {
  const { email, senha } = req.body;

  const sql = "SELECT * FROM PROFISSIONAL WHERE profissional_email = ? AND profissional_senha = ?";
  db.query(sql, [email, senha], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Erro no servidor." });
    }

    if (result.length > 0) {
      res.json({ auth: true, user: result[0] });
    } else {
      res.json({ auth: false });
    }
  });
});

// Deletar profissional
app.delete('/profissionais/:id', (req, res) => {
  db.query('DELETE FROM PROFISSIONAL WHERE profissional_id=?', [req.params.id], (err) => {
    if(err) res.status(500).send(err);
    else res.json({ message: 'Profissional deletado' });
  });
});


//////////////////////////////
// Categorias
//////////////////////////////
app.get('/categorias', (req, res) => {
  const sql = `SELECT categoria_id, categoria_nome FROM CATEGORIA ORDER BY categoria_nome`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar categorias:', err);
      return res.status(500).json({ error: 'Erro ao buscar categorias', details: err });
    }
    res.json(results);
  });
});

//////////////////////////////
// Pagamentos
//////////////////////////////
app.get('/pagamentos', (req, res) => {
  db.query('SELECT * FROM PAGAMENTO', (err, results) => {
    if(err) res.status(500).send(err);
    else res.json(results);
  });
});

app.post('/pagamentos', (req, res) => {
  const { nome, forma_pagamento } = req.body;
  db.query(
    'INSERT INTO PAGAMENTO (pagamento_nome, pagamento_forma_pagamento) VALUES (?, ?)',
    [nome, forma_pagamento],
    (err) => {
      if(err) res.status(500).send(err);
      else res.json({ message: 'Pagamento criado' });
    }
  );
});

//////////////////////////////
// Agendamentos
//////////////////////////////
app.get('/agendamentos', (req, res) => {
  db.query('SELECT * FROM AGENDAMENTO', (err, results) => {
    if(err) res.status(500).send(err);
    else res.json(results);
  });
});

app.get('/agendamentos/:id', (req, res) => {
  db.query('SELECT * FROM AGENDAMENTO WHERE agendamento_id=?', [req.params.id], (err, results) => {
    if(err) res.status(500).send(err);
    else res.json(results[0]);
  });
});

app.post('/agendamentos', (req, res) => {
  const { cliente_id, profissional_id, categoria_nome, pagamento_id, agendamento_data_agendamento, agendamento_horario } = req.body;

  // Buscar o id da categoria pelo nome
  const sqlCategoria = 'SELECT categoria_id FROM CATEGORIA WHERE categoria_nome = ?';
  db.query(sqlCategoria, [categoria_nome], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length === 0) return res.status(400).json({ error: 'Categoria não encontrada' });

    const categoria_id = result[0].categoria_id;

    const sqlInsert = `
      INSERT INTO AGENDAMENTO
        (cliente_id, profissional_id, categoria_id, pagamento_id, agendamento_data_agendamento, agendamento_horario)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sqlInsert, [cliente_id, profissional_id, categoria_id, pagamento_id, agendamento_data_agendamento, agendamento_horario], (err) => {
      if(err) return res.status(500).send(err);
      res.json({ message: 'Agendamento criado' });
    });
  });
});

app.put('/agendamentos/:id', (req, res) => {
  const { cliente_id, profissional_id, categoria_id, pagamento_id, agendamento_data_agendamento, agendamento_horario } = req.body;
  db.query(
    'UPDATE AGENDAMENTO SET cliente_id=?, profissional_id=?, categoria_id=?, pagamento_id=?, agendamento_data_agendamento=?, agendamento_horario=? WHERE agendamento_id=?',
    [cliente_id, profissional_id, categoria_id, pagamento_id, agendamento_data_agendamento, agendamento_horario, req.params.id],
    (err) => {
      if(err) res.status(500).send(err);
      else res.json({ message: 'Agendamento atualizado' });
    }
  );
});

app.delete('/agendamentos/:id', (req, res) => {
  db.query('DELETE FROM AGENDAMENTO WHERE agendamento_id=?', [req.params.id], (err) => {
    if(err) res.status(500).send(err);
    else res.json({ message: 'Agendamento deletado' });
  });
});

//////////////////////////////
// Start
//////////////////////////////
app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
