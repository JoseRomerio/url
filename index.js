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
    // Ensure the URL is properly formatted
    const cleanUrl = url.replace(/:443$/, '').replace(/^http:/, 'https:');
    
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0;url=${cleanUrl}">
    <title>Redirecting to Ngrok URL</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
        }
        .container {
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            background-color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Redirecionando...</h1>
        <p>Você será redirecionado para: <br><strong>${cleanUrl}</strong></p>
    </div>
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