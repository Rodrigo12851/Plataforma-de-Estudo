import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to extract YouTube ID
function extractYouTubeId(url: string): string {
  if (!url) return 'aircAruvnKk';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : url.length === 11 ? url : 'aircAruvnKk';
}

// Route 1: Process YouTube Video with Gemini AI
app.post('/api/process-video', async (req, res) => {
  try {
    const { youtubeUrl, category, customTitle } = req.body;
    const videoId = extractYouTubeId(youtubeUrl);

    if (!process.env.GEMINI_API_KEY) {
      // Fallback fallback simulated generated output if no API key set
      return res.json({
        id: `lesson-${Date.now()}`,
        youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
        youtubeId: videoId,
        title: customTitle || `Aula do YouTube (${videoId})`,
        channel: 'Canal Educacional',
        duration: '12:30',
        category: category || 'Geral',
        summary: 'Esta aula aborda os princípios fundamentais do tema selecionado, fornecendo conceitos-chave, demonstrações práticas, explicações passo a passo e resumos para estudo.',
        keyTakeaways: [
          'Conceitos fundamentais explicados nos minutos iniciais.',
          'Demonstração prática dos tópicos principais no meio do vídeo.',
          'Estratégias de consolidação e revisão ao final.'
        ],
        timestamps: [
          { time: '00:00', seconds: 0, topic: 'Introdução e Visão Geral', summary: 'Apresentação do tema e objetivos da aula.' },
          { time: '02:15', seconds: 135, topic: 'Conceito Teórico Chave', summary: 'Detalhamento da teoria e fórmulas fundamentais.' },
          { time: '04:20', seconds: 260, topic: 'Exemplo Prático & Momento Crucial', summary: 'Resolução passo a passo e análise dos pontos mais cobrados.' },
          { time: '08:10', seconds: 490, topic: 'Aplicações no Mundo Real', summary: 'Casos práticos de uso do conhecimento.' },
          { time: '11:00', seconds: 660, topic: 'Conclusão e Dicas de Estudo', summary: 'Recapitulando os pontos essenciais da aula.' }
        ],
        flashcards: Array.from({ length: 20 }).map((_, i) => ({
          id: `fc-gen-${Date.now()}-${i}`,
          front: `Pergunta de Estudo ${i + 1}: Qual é o conceito chave abordado no tópico ${i + 1}?`,
          back: `Resposta do conceito ${i + 1}: Explicação didática clara para memorização e consolidação no sistema SRS.`,
          srsStage: 'new' as const,
          nextReviewDays: 0,
          lastReviewed: null
        })),
        quiz: Array.from({ length: 10 }).map((_, i) => ({
          id: `q-gen-${Date.now()}-${i}`,
          question: `Questão de Referência ${i + 1}: Sobre a explicação do professor na aula (referência do minuto ${i % 2 === 0 ? '02:15' : '04:20'}), qual alternativa está correta?`,
          options: [
            `A alternativa A apresenta a explicação precisa do professor.`,
            `A alternativa B é uma afirmação incorreta.`,
            `A alternativa C refere-se a um detalhe irrelevante.`,
            `A alternativa D é um distrator conceitual.`
          ],
          correctAnswer: 0,
          explanation: `A alternativa A é correta pois resume fielmente o que foi ensinado pelo professor durante este trecho da aula.`,
          timestampRef: i % 2 === 0 ? '02:15' : '04:20'
        })),
        createdAt: new Date().toISOString(),
        lastStudiedAt: new Date().toISOString(),
        progress: 0
      });
    }

    const prompt = `Você é um tutor pedagógico de inteligência artificial.
Analise e processe o conteúdo sobre o vídeo do YouTube ID: "${videoId}" / URL: "${youtubeUrl}".
Se a URL contiver um tema específico ou o título for "${customTitle}", use esse tópico para gerar o material de aula.
Caso não conheça a transcrição exata, crie um plano de estudo profundo, verossímil e didático como se fosse uma aula completa sobre este assunto.

Forneça rigorosamente o JSON com:
- title: Título atrativo e profissional da aula
- channel: Nome verossímil do canal do professor/instituição
- duration: Duração aproximada em formato MM:SS (ex: 15:40)
- category: Escolha exatamente uma destas: "Exatas", "Humanas", "Tecnologia", "Idiomas", "Geral"
- summary: Um resumo didático detalhado da aula (2 a 4 parágrafos em português).
- keyTakeaways: Array com 4 pontos principais aprendidos.
- timestamps: Array com exatamente 5 a 6 marcadores de tempo contendo { "time": "MM:SS", "seconds": numero, "topic": string, "summary": string }. OBRIGATÓRIO incluir um timestamp no tempo "04:20" (260 segundos) com um momento explicativo marcante!
- flashcards: Array com EXATAMENTE 20 flashcards didáticos com { "front": string, "back": string }.
- quiz: Array com EXATAMENTE 10 questões de múltipla escolha com { "question": string, "options": [4 strings], "correctAnswer": indice 0 a 3, "explanation": string, "timestampRef": "MM:SS (de acordo com os marcadores de tempo de referência do vídeo)" }.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            channel: { type: Type.STRING },
            duration: { type: Type.STRING },
            category: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            timestamps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  seconds: { type: Type.INTEGER },
                  topic: { type: Type.STRING },
                  summary: { type: Type.STRING }
                },
                required: ['time', 'seconds', 'topic', 'summary']
              }
            },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING },
                  back: { type: Type.STRING }
                },
                required: ['front', 'back']
              }
            },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswer: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  timestampRef: { type: Type.STRING }
                },
                required: ['question', 'options', 'correctAnswer', 'explanation']
              }
            }
          },
          required: ['title', 'channel', 'duration', 'category', 'summary', 'keyTakeaways', 'timestamps', 'flashcards', 'quiz']
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');

    const lessonData = {
      id: `lesson-${Date.now()}`,
      youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
      youtubeId: videoId,
      title: parsedData.title || customTitle || 'Aula do YouTube',
      channel: parsedData.channel || 'Canal Educacional',
      duration: parsedData.duration || '12:00',
      category: parsedData.category || category || 'Geral',
      summary: parsedData.summary || 'Resumo da aula processada.',
      keyTakeaways: parsedData.keyTakeaways || [],
      timestamps: parsedData.timestamps || [
        { time: '00:00', seconds: 0, topic: 'Início da Aula', summary: 'Introdução aos conceitos gerais.' },
        { time: '04:20', seconds: 260, topic: 'Ponto Central da Aula', summary: 'Detalhamento importante do conteúdo.' }
      ],
      flashcards: (parsedData.flashcards || []).map((fc: any, idx: number) => ({
        id: `fc-${Date.now()}-${idx}`,
        front: fc.front,
        back: fc.back,
        srsStage: 'new' as const,
        nextReviewDays: 0,
        lastReviewed: null
      })),
      quiz: (parsedData.quiz || []).map((q: any, idx: number) => ({
        id: `q-${Date.now()}-${idx}`,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer ?? 0,
        explanation: q.explanation || '',
        timestampRef: q.timestampRef || '04:20'
      })),
      createdAt: new Date().toISOString(),
      lastStudiedAt: new Date().toISOString(),
      progress: 0
    };

    return res.json(lessonData);
  } catch (error: any) {
    console.error('Error in /api/process-video:', error);
    return res.status(500).json({ error: 'Falha ao processar o vídeo com a API do Gemini.', details: error.message });
  }
});

// Route 2: Chatbot Tutor na Aula (AI Classroom Tutor with Timestamps)
app.post('/api/tutor', async (req, res) => {
  try {
    const { lessonTitle, lessonSummary, timestamps, currentTimestamp, query } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      // Friendly fallback if no key
      return res.json({
        reply: `Com base na aula "${lessonTitle}", no minuto ${currentTimestamp || '04:20'}, o professor explicou este conceito de forma didática. A ideia central é relacionar a teoria prática com o contexto da aula. Dica: você pode clicar no timestamp para rever o trecho do vídeo!`,
        timestampRef: currentTimestamp || '04:20'
      });
    }

    const systemPrompt = `Você é o "Tutor IA da Aula" (Tira-dúvidas inteligente).
O aluno está assistindo à aula intitulada: "${lessonTitle}".
Resumo da aula: ${lessonSummary}
Marcadores de tempo da aula: ${JSON.stringify(timestamps || [])}
Momento atual da aula selecionado pelo aluno: "${currentTimestamp || '04:20'}".

INSTRUÇÕES:
1. Responda à dúvida do aluno de forma extremamente clara, didática, empática e em português empolgante.
2. Se o aluno perguntar algo como "O que o professor quis dizer no minuto 04:20?" ou citar um minuto específico, refira-se expressamente a esse minuto e forneça a explicação exata baseada nos marcadores e resumo da aula.
3. Mantenha a resposta com formatação limpa (pode usar marcações curtas ou tópicos).
4. Termine com uma breve pergunta instigante ou palavra de incentivo ao estudo.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `${systemPrompt}\n\nPergunta do aluno: ${query}`,
    });

    return res.json({
      reply: response.text || 'Desculpe, não consegui gerar a resposta neste momento.',
      timestampRef: currentTimestamp || '04:20'
    });
  } catch (error: any) {
    console.error('Error in /api/tutor:', error);
    return res.status(500).json({ error: 'Erro no Chatbot Tutor', details: error.message });
  }
});

// Start Vite or serve dist
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TubeStudy AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
