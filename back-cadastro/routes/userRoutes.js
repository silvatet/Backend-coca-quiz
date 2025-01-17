const express = require('express');
const { saveUserData, listUsers, getUserByCPF, deleteUserByCPF } = require('../controllers/userController'); // Importa os controladores

const router = express.Router();

// Rota para salvar os dados
router.post('/submit', saveUserData);

// Rota para listar todos os usuários
router.get('/users', listUsers);

// Rota para buscar um usuário pelo CPF
router.get('/users/:cpf', getUserByCPF);

// Rota para deletar um usuário pelo CPF
router.delete('/users/:cpf', deleteUserByCPF);

// Exporta o roteador configurado
module.exports = router;


const path = require('path');
console.log(path.resolve(__dirname, '../controllers/userController'));
