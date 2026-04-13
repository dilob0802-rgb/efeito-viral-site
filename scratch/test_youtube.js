require('dotenv').config();

async function testYouTube() {
    console.log('--- Testando Conexão com YouTube API ---');
    const key = process.env.YOUTUBE_API_KEY;
    if (!key) {
        console.error('ERRO: YOUTUBE_API_KEY não encontrada no .env');
        return;
    }

    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=BR&maxResults=1&key=${key}`);
        const data = await response.json();
        
        if (data.error) {
            console.error('❌ Erro na conexão YouTube:', data.error.message);
        } else if (data.items) {
            console.log('Sucesso! Vídeo mais popular agora:', data.items[0].snippet.title);
            console.log('✅ Tudo certo com o YouTube!');
        }
    } catch (err) {
        console.error('❌ Erro inesperado:', err.message);
    }
}

testYouTube();
