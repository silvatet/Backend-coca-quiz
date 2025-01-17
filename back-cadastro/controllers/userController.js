const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path');

// Caminho do arquivo Excel
const excelFilePath = path.join(__dirname, '../data/users.xlsx');

// Função para validar CPF
const isValidCPF = (cpf) => /^\d{11}$/.test(cpf); // Verifica se tem 11 dígitos numéricos

// Função para validar e-mail
const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email); // Verifica se contém "@" e um domínio válido

// Função para salvar os dados do usuário
const saveUserData = (req, res) => {
    try {
        const { name, email, cpf, phone } = req.body;

        // Validações básicas
        if (!name || !email || !cpf || !phone) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }
        if (!isValidCPF(cpf)) {
            return res.status(400).json({ error: 'CPF inválido. Deve conter 11 dígitos numéricos.' });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'E-mail inválido.' });
        }

        // Novo usuário a ser salvo
        const newUser = { Name: name, Email: email, CPF: cpf, Phone: phone };

        // Lê o arquivo Excel existente ou cria um novo
        let workbook;
        const sheetName = 'Users';

        if (fs.existsSync(excelFilePath)) {
            workbook = xlsx.readFile(excelFilePath);
        } else {
            workbook = xlsx.utils.book_new();
        }

        // Lê ou cria a planilha
        let worksheet = workbook.Sheets[sheetName];
        let data = worksheet ? xlsx.utils.sheet_to_json(worksheet) : [];

        // Verifica se o CPF já existe na planilha
        const cpfExists = data.some((user) => user.CPF === cpf);
        if (cpfExists) {
            return res.status(400).json({ error: 'CPF já cadastrado.' });
        }

        // Adiciona o novo usuário à lista
        data.push(newUser);

        // Atualiza a planilha com os dados
        worksheet = xlsx.utils.json_to_sheet(data);
        workbook.Sheets[sheetName] = worksheet;
        workbook.SheetNames = [sheetName];

        // Salva o arquivo Excel
        xlsx.writeFile(workbook, excelFilePath);

        res.status(201).json({ message: 'Dados salvos com sucesso!' });
    } catch (error) {
        console.error('Erro ao salvar os dados:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

// Função para listar todos os usuários
const listUsers = (req, res) => {
    try {
        if (!fs.existsSync(excelFilePath)) {
            return res.status(404).json({ error: 'Nenhum dado encontrado.' });
        }

        const workbook = xlsx.readFile(excelFilePath);
        const worksheet = workbook.Sheets['Users'];
        const data = worksheet ? xlsx.utils.sheet_to_json(worksheet) : [];

        res.status(200).json(data);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

// Função para buscar usuário por CPF
const getUserByCPF = (req, res) => {
    try {
        const { cpf } = req.params;

        if (!isValidCPF(cpf)) {
            return res.status(400).json({ error: 'CPF inválido. Deve conter 11 dígitos numéricos.' });
        }

        if (!fs.existsSync(excelFilePath)) {
            return res.status(404).json({ error: 'Nenhum dado encontrado.' });
        }

        const workbook = xlsx.readFile(excelFilePath);
        const worksheet = workbook.Sheets['Users'];
        const data = worksheet ? xlsx.utils.sheet_to_json(worksheet) : [];

        const user = data.find((user) => user.CPF === cpf);

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

// Função para deletar usuário por CPF
const deleteUserByCPF = (req, res) => {
    try {
        const { cpf } = req.params;

        if (!isValidCPF(cpf)) {
            return res.status(400).json({ error: 'CPF inválido. Deve conter 11 dígitos numéricos.' });
        }

        if (!fs.existsSync(excelFilePath)) {
            return res.status(404).json({ error: 'Nenhum dado encontrado.' });
        }

        const workbook = xlsx.readFile(excelFilePath);
        const worksheet = workbook.Sheets['Users'];
        let data = worksheet ? xlsx.utils.sheet_to_json(worksheet) : [];

        const initialLength = data.length;
        data = data.filter((user) => user.CPF !== cpf);

        if (data.length === initialLength) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        // Atualiza a planilha com os dados restantes
        const newWorksheet = xlsx.utils.json_to_sheet(data);
        workbook.Sheets['Users'] = newWorksheet;
        workbook.SheetNames = ['Users'];
        xlsx.writeFile(workbook, excelFilePath);

        res.status(200).json({ message: 'Usuário deletado com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

module.exports = { saveUserData, listUsers, getUserByCPF, deleteUserByCPF };
