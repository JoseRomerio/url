require('dotenv').config();
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Configuração do ngrok
const NGROK_API_KEY = process.env.NGROK_API_KEY;

async function getNgrokUrl() {
    try {
        const response = await axios.get('https://api.ngrok.com/tunnels', {
            headers: {
                'Authorization': `Bearer ${NGROK_API_KEY}`,
                'Ngrok-Version': '2'
            }
        });

        const tunnels = response.data.tunnels;
        if (tunnels && tunnels.length > 0) {
            // Pega a primeira URL pública disponível
            return tunnels[0].public_url;
        }
        throw new Error('Nenhum túnel ativo encontrado');
    } catch (error) {
        console.error('Erro ao buscar URL do ngrok:', error.message);
        throw error;
    }
}

async function updateHtmlFile(url) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0;url=${url}">
    <title>Redirecting...</title>
</head>
<body>
    <p>Redirecionando para ${url}...</p>
</body>
</html>`;

    await fs.writeFile(path.join(__dirname, 'docs/index.html'), html);
}

async function main() {
    try {
        const ngrokUrl = await getNgrokUrl();
        await updateHtmlFile(ngrokUrl);
        console.log('HTML atualizado com sucesso!');
    } catch (error) {
        console.error('Erro:', error.message);
        process.exit(1);
    }
}

main();