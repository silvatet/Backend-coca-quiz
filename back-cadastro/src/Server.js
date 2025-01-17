const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('../routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para interpretar JSON
app.use(bodyParser.json());

// Rotas
app.use('/api', userRoutes);

// Inicia o servidor
const server = app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// Listener para tratar erro "EADDRINUSE"
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`A porta ${PORT} já está em uso. Tentando outra porta...`);
        const newPort = PORT + 1;
        app.listen(newPort, () => {
            console.log(`Servidor rodando na nova porta ${newPort}`);
        });
    } else {
        console.error('Erro no servidor:', err);
    }
});
