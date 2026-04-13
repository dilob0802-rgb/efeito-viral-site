require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
    console.log('--- Testando Conexão com Gemini ---');
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error('ERRO: GEMINI_API_KEY não encontrada no .env');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent("Diga 'Conexão OK' se estiver funcionando.");
        const response = await result.response;
        console.log('Resposta:', response.text());
        console.log('✅ Tudo certo com o Gemini!');
    } catch (err) {
        console.error('❌ Erro na conexão:', err.message);
    }
}

testGemini();
