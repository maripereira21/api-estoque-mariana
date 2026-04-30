const express = require('express');
const app = express();
const produtosRouter = require('./routes/produtos');

// Middleware para a API entender JSON no corpo das requisições (req.body)
app.use(express.json());

// Uso das rotas de produtos
app.use('/produtos', produtosRouter);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});