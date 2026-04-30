const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'produtos.json');

// Lê os produtos do arquivo JSON
function lerProdutos() {
const conteudo = fs.readFileSync(DATA_FILE, 'utf-8');
return JSON.parse(conteudo);
}

// Salva os produtos no arquivo JSON
function salvarProdutos(produtos) {
fs.writeFileSync(DATA_FILE, JSON.stringify(produtos, null, 2), 'utf-8');
}

// Gera um novo ID único baseado no maior ID existente
function gerarId(produtos) {
if (produtos.length === 0) return 1;
const maiorId = Math.max(...produtos.map(p => p.id));
return maiorId + 1;
}

// GET /produtos - listar todos
router.get('/', (req, res) => {
try {
const produtos = lerProdutos();
res.json(produtos);
} catch (erro) {
res.status(500).json({ erro: 'Erro ao ler os dados dos produtos.' });
}
});

// GET /produtos/:id - buscar por ID
router.get('/:id', (req, res) => {
try {
const id = Number(req.params.id);
const produtos = lerProdutos();

const produto = produtos.find(p => p.id === id);

if (!produto) {
return res.status(404).json({ erro: `Produto com id ${id} não encontrado.` });
}

res.json(produto);
} catch (erro) {
res.status(500).json({ erro: 'Erro ao buscar o produto.' });
}
});

// POST /produtos - cadastrar novo produto
router.post('/', (req, res) => {
try {
const { nome, descricao, preco, quantidade, categoria } = req.body;

if (!nome || nome.trim() === '') {
return res.status(400).json({ erro: 'O campo "nome" é obrigatório.' });
}

if (preco === undefined || preco === null) {
return res.status(400).json({ erro: 'O campo "preco" é obrigatório.' });
}

if (typeof preco !== 'number' || preco <= 0) {
return res.status(400).json({ erro: 'O campo "preco" deve ser um número maior que zero.' });
}

if (quantidade !== undefined && (!Number.isInteger(quantidade) || quantidade < 0)) {
return res.status(400).json({ erro: 'O campo "quantidade" deve ser um inteiro >= 0.' });
}

const produtos = lerProdutos();

const novoProduto = {
id: gerarId(produtos),
nome: nome.trim(),
descricao: descricao || '',
preco: preco,
quantidade: quantidade !== undefined ? quantidade : 0,
categoria: categoria || ''
};

produtos.push(novoProduto);
salvarProdutos(produtos);

res.status(201).json(novoProduto);
} catch (erro) {
res.status(500).json({ erro: 'Erro ao cadastrar o produto.' });
}
});

// PUT /produtos/:id - atualizar produto existente
router.put('/:id', (req, res) => {
try {
const id = Number(req.params.id);
const produtos = lerProdutos();

const index = produtos.findIndex(p => p.id === id);

if (index === -1) {
return res.status(404).json({ erro: `Produto com id ${id} não encontrado.` });
}

const { nome, descricao, preco, quantidade, categoria } = req.body;

if (preco !== undefined && (typeof preco !== 'number' || preco <= 0)) {
return res.status(400).json({ erro: 'O campo "preco" deve ser um número maior que zero.' });
}

if (quantidade !== undefined && (!Number.isInteger(quantidade) || quantidade < 0)) {
return res.status(400).json({ erro: 'O campo "quantidade" deve ser um inteiro >= 0.' });
}

const produtoAtualizado = {
...produtos[index],
...(nome !== undefined && { nome: nome.trim() }),
...(descricao !== undefined && { descricao }),
...(preco !== undefined && { preco }),
...(quantidade !== undefined && { quantidade }),
...(categoria !== undefined && { categoria })
};

produtos[index] = produtoAtualizado;
salvarProdutos(produtos);

res.json(produtoAtualizado);
} catch (erro) {
res.status(500).json({ erro: 'Erro ao atualizar o produto.' });
}
});

// DELETE /produtos/:id - remover produto
router.delete('/:id', (req, res) => {
try {
const id = Number(req.params.id);
const produtos = lerProdutos();

const index = produtos.findIndex(p => p.id === id);

if (index === -1) {
return res.status(404).json({ erro: `Produto com id ${id} não encontrado.` });
}

const produtoRemovido = produtos[index];

produtos.splice(index, 1);
salvarProdutos(produtos);

res.json({ mensagem: `Produto "${produtoRemovido.nome}" removido com sucesso.` });
} catch (erro) {
res.status(500).json({ erro: 'Erro ao remover o produto.' });
}
});

module.exports = router;