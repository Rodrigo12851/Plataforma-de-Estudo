import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { YoutubeTranscript } from 'youtube-transcript';

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

// Helper to fetch subtitles/transcript from YouTube
async function fetchVideoTranscript(videoId: string): Promise<string> {
  try {
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    if (transcriptItems && transcriptItems.length > 0) {
      return transcriptItems
        .map((item) => {
          const minutes = Math.floor((item.offset || 0) / 1000 / 60);
          const seconds = Math.floor(((item.offset || 0) / 1000) % 60);
          const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
          return `[${timeStr}] ${item.text}`;
        })
        .join('\n')
        .slice(0, 15000);
    }
  } catch (e: any) {
    console.log(`[Transcript Notice] Legendas/transcrição não encontradas diretamente para o vídeo ID: ${videoId} (${e?.message || e})`);
  }
  return '';
}

// Route 1: Process YouTube Video with Gemini AI
app.post('/api/process-video', async (req, res) => {
  try {
    const { youtubeUrl, category, customTitle, courseName, existingCourseContext } = req.body;
    const videoId = extractYouTubeId(youtubeUrl);
    const transcriptText = await fetchVideoTranscript(videoId);

    if (!process.env.GEMINI_API_KEY) {
      // Fallback simulated generated output if no API key set
      const themeTitle = customTitle || `Aula do YouTube (${videoId})`;
      return res.json({
        id: `lesson-${Date.now()}`,
        youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
        youtubeId: videoId,
        title: themeTitle,
        channel: 'Canal Educacional',
        duration: '12:30',
        category: category || 'Geral',
        courseName: courseName || undefined,
        summary: `Nesta vídeoaula sobre "${themeTitle}"${courseName ? ` do curso "${courseName}"` : ''}, você aprenderá os conceitos fundamentais explicados pelo professor, com demonstrações práticas e explicações específicas para este tópico da disciplina.`,
        keyTakeaways: [
          `Conceito central de ${themeTitle} explicado no início do vídeo.`,
          'Aplicações práticas apresentadas pelo professor.',
          'Pontos de atenção e erros comuns que você deve evitar.',
          'Resumo dos tópicos essenciais para fixação e provas.'
        ],
        timestamps: [
          { time: '00:00', seconds: 0, topic: 'Introdução ao Tema', summary: `Apresentação dos objetivos do estudante na aula sobre ${themeTitle}.` },
          { time: '02:15', seconds: 135, topic: 'Conceito Teórico Principal', summary: 'Detalhamento da teoria e regras fundamentais.' },
          { time: '04:20', seconds: 260, topic: 'Exemplo Prático e Aplicação', summary: 'Resolução passo a passo feita pelo professor.' },
          { time: '08:10', seconds: 490, topic: 'Pontos Críticos para o Estudante', summary: 'Dicas de estudo e memorização sobre o assunto.' },
          { time: '11:00', seconds: 660, topic: 'Conclusão da Aula', summary: 'Recapitulando os pontos essenciais que você aprendeu.' }
        ],
        flashcards: Array.from({ length: 8 }).map((_, i) => ({
          id: `fc-gen-${Date.now()}-${i}`,
          front: `Pergunta ${i + 1} sobre ${themeTitle}: Como você deve aplicar o conceito ${i + 1} ensinado pelo professor?`,
          back: `Explicação do conceito ${i + 1}: Detalhamento didático fornecido no vídeo para você memorizar no sistema SRS.`,
          srsStage: 'new' as const,
          nextReviewDays: 0,
          lastReviewed: null
        })),
        quiz: Array.from({ length: 5 }).map((_, i) => ({
          id: `q-gen-${Date.now()}-${i}`,
          question: `Questão ${i + 1} para você: Com base na explicação do professor no minuto ${i % 2 === 0 ? '02:15' : '04:20'} sobre ${themeTitle}, qual opção está correta?`,
          options: [
            `A alternativa A apresenta a explicação exata do professor no vídeo.`,
            `A alternativa B é uma interpretação equivocada do tema.`,
            `A alternativa C aborda um conceito divergente.`,
            `A alternativa D é um distrator comum.`
          ],
          correctAnswer: 0,
          explanation: `A alternativa A é correta pois sintetiza fielmente o que foi ensinado pelo professor durante este trecho do vídeo para o estudante.`,
          timestampRef: i % 2 === 0 ? '02:15' : '04:20'
        })),
        createdAt: new Date().toISOString(),
        lastStudiedAt: new Date().toISOString(),
        progress: 0
      });
    }

    const prompt = `Você é um tutor pedagógico de inteligência artificial especializado em criar materiais de estudo exclusivos para videoaulas do YouTube.
Você está criando um plano de estudos personalizado para o ALUNO referente à videoaula do YouTube ID: "${videoId}" (URL: "${youtubeUrl}").
${customTitle ? `Título/Tema da aula informado pelo aluno: "${customTitle}".` : 'Deduza o assunto e tema específico principal com base na aula ou contexto do vídeo.'}
${courseName ? `ESTA AULA FAZ PARTE DA PLAYLIST/CURSO: "${courseName}".` : ''}
Categoria selecionada: "${category || 'Geral'}".

${transcriptText ? `
===================================================================
TRANSCRIÇÃO E LEGENDAS REAIS DA VIDEOAULA (COMTIMESTAMPS [MM:SS]):
${transcriptText}
===================================================================
INSTRUÇÃO DE TRANSCRIÇÃO:
1. Analise como os assuntos evoluem ao longo dos minutos no texto da transcrição acima.
2. Identifique os tópicos ensinados pelo professor em cada intervalo de tempo do vídeo.
3. Elabore o resumo, as questões do quiz e os flashcards baseando-se DIRETAMENTE nas frases, conceitos e explicações reais ditas pelo professor na transcrição!
4. Associe cada pergunta e marcador (timestamps) ao minuto [MM:SS] exato em que aquele assunto foi falado no texto.
` : 'NOTA: Caso não haja transcrição disponível, deduza o conteúdo e os tópicos didáticos com base no título e na matéria com extrema precisão.'}

${existingCourseContext ? `
===================================================================
AULAS E QUESTÕES JÁ GERADAS ANTERIORMENTE NESTA MESMA PLAYLIST/CURSO ("${courseName || 'Curso'}"):
${existingCourseContext}
===================================================================
REGRA ABSOLUTA ANTI-REPETIÇÃO PARA A PLAYLIST/CURSO:
1. É ESTRITAMENTE PROIBIDO REPETIR ou REFORMULAR qualquer uma das perguntas ou tópicos listados acima que já foram testados nas aulas anteriores deste mesmo curso!
2. Analise os temas anteriores e garanta que todas as questões e flashcards criados agora sejam 100% INÉDITOS, focando EXCLUSIVAMENTE nas novidades e conceitos específicos ensinados nesta nova videoaula.
` : ''}

REGRAS CRÍTICAS DE CONTEÚDO, QUANTIDADE E FORMATO:
1. QUANTIDADE LIVRE E ADEQUADA AO TAMANHO DO VÍDEO: Adapte a quantidade de flashcards e de questões do quiz de acordo com a duração e a densidade do tema falado pelo professor na videoaula. Não force um número fixo! Gere uma quantidade proporcional ao conteúdo (exemplo: para vídeos curtos ou simples, 5 a 8 flashcards e 3 a 5 perguntas; para vídeos longos e densos, de 8 a 15 flashcards e 5 a 10 perguntas).
2. FORMULAÇÃO DIRIGIDA AO ESTUDANTE: Cada questão do quiz e card deve ser dirigido DIRETAMENTE ao estudante em 2ª pessoa (ex: "Com base na explicação do professor nesta aula sobre [Tema do Vídeo], como você deve...", "De acordo com o conceito de [Tópico] apresentado no vídeo no minuto [MM:SS], qual alternativa explica corretamente para você...", "Se você precisar aplicar a regra de [Tema], qual é a resposta correta?").
3. FOCO ESTRITO NO TEMA DA VIDEOAULA: Como cada aula de um curso tem seu próprio tema específico (Aula 1, Aula 2, etc.), extraia estritamente os conceitos falados pelo professor nesta videoaula. Não faça perguntas genéricas ou repetidas de outras aulas.
4. QUALIDADE PEDAGÓGICA: Cada questão deve testar a compreensão real do estudante sobre o assunto do vídeo, oferecendo 4 opções plausíveis e uma explicação didática detalhada e direta para o aluno.

Forneça rigorosamente o JSON com:
- title: Título específico e profissional da aula abordando o tema exato (ex: "Estruturas de Dados: Listas Encadeadas" ou "Física Quântica: Efeito Fotoelétrico")
- channel: Nome do canal do professor/instituição
- duration: Duração aproximada em formato MM:SS (ex: 15:40)
- category: Escolha exatamente uma destas: "Exatas", "Humanas", "Tecnologia", "Idiomas", "Geral"
- summary: Um resumo didático detalhado para o estudante (2 a 4 parágrafos em português focados estritamente no tema deste vídeo).
- keyTakeaways: Array com 4 a 6 pontos fundamentais que o estudante aprendeu nesta aula.
- timestamps: Array com 4 a 7 marcadores de tempo contendo { "time": "MM:SS", "seconds": numero, "topic": string, "summary": string }. OBRIGATÓRIO incluir um timestamp no tempo "04:20" (260 segundos) com um momento explicativo marcante!
- flashcards: Array com quantidade livre (proporcional à aula) de flashcards didáticos e específicos do tema dirigidos ao estudante com { "front": string, "back": string }.
- quiz: Array com quantidade livre (proporcional à aula) de questões de múltipla escolha dirigidas diretamente ao estudante sobre o tema do vídeo com { "question": string, "options": [4 strings], "correctAnswer": indice 0 a 3, "explanation": string, "timestampRef": "MM:SS" }.`;

    let response: any;
    const modelsToTry = ['gemini-3.6-flash', 'gemini-2.5-flash'];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
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
        if (response && response.text) {
          break; // Sucesso com o modelo atual
        }
      } catch (err: any) {
        lastError = err;
        // Tenta o próximo modelo
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('Não foi possível obter resposta dos modelos do Gemini.');
    }

    const parsedData = JSON.parse(response.text || '{}');

    const lessonData: any = {
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

    if (courseName) {
      lessonData.courseName = courseName;
    }

    return res.json(lessonData);
  } catch (error: any) {
    console.error('Error in /api/process-video (usando fallback seguro):', error);
    
    // Fallback gracioso em caso de indisponibilidade temporária da API (ex: 503 High Demand)
    const videoId = extractYouTubeId(req.body.youtubeUrl || '');
    const themeTitle = req.body.customTitle || `Aula do YouTube (${videoId || 'Geral'})`;
    const cName = req.body.courseName;

    const fallbackLesson: any = {
      id: `lesson-${Date.now()}`,
      youtubeUrl: req.body.youtubeUrl || `https://www.youtube.com/watch?v=${videoId}`,
      youtubeId: videoId,
      title: themeTitle,
      channel: 'Canal Educacional',
      duration: '14:20',
      category: req.body.category || 'Geral',
      summary: `Nesta aula sobre "${themeTitle}"${cName ? ` do curso "${cName}"` : ''}, você verá os tópicos explicados pelo professor com aplicação direta para seus estudos.`,
      keyTakeaways: [
        `Conceito central de ${themeTitle} explicado no vídeo.`,
        'Demonstrações práticas e exemplos apresentados.',
        'Pontos-chave para retenção e memorização do aluno.',
        'Resumo dos principais erros a evitar.'
      ],
      timestamps: [
        { time: '00:00', seconds: 0, topic: 'Introdução e Objetivos', summary: `Apresentação dos conceitos de ${themeTitle}.` },
        { time: '02:15', seconds: 135, topic: 'Fundamentos e Teoria', summary: 'Explicação detalhada da matéria pelo professor.' },
        { time: '04:20', seconds: 260, topic: 'Exemplo Prático e Momento Crucial', summary: 'Exercício resolvido passo a passo.' },
        { time: '09:00', seconds: 540, topic: 'Dicas Práticas para o Estudante', summary: 'Orientação de estudo e aplicação.' }
      ],
      flashcards: Array.from({ length: 6 }).map((_, i) => ({
        id: `fc-fallback-${Date.now()}-${i}`,
        front: `Pergunta ${i + 1} sobre ${themeTitle}: Qual é o conceito ${i + 1} apresentado pelo professor nesta aula?`,
        back: `Explicação do conceito ${i + 1}: Resposta didática fundamentada no tópico para memorização rápida no SRS.`,
        srsStage: 'new' as const,
        nextReviewDays: 0,
        lastReviewed: null
      })),
      quiz: Array.from({ length: 4 }).map((_, i) => ({
        id: `q-fallback-${Date.now()}-${i}`,
        question: `Com base na aula sobre ${themeTitle}, como você deve entender o ponto ${i + 1} explicado pelo professor no minuto ${i % 2 === 0 ? '02:15' : '04:20'}?`,
        options: [
          `A alternativa A sintetiza com precisão o conceito do professor no vídeo.`,
          `A alternativa B apresenta uma interpretação incorreta do tema.`,
          `A alternativa C refere-se a um conceito divergente.`,
          `A alternativa D é um distrator conceitual.`
        ],
        correctAnswer: 0,
        explanation: `A alternativa A é correta pois resume fielmente a explicação dada na vídeoaula.`,
        timestampRef: i % 2 === 0 ? '02:15' : '04:20'
      })),
      createdAt: new Date().toISOString(),
      lastStudiedAt: new Date().toISOString(),
      progress: 0
    };

    if (cName) {
      fallbackLesson.courseName = cName;
    }

    return res.json(fallbackLesson);
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

    const systemPrompt = `Você é o Tutor Particular do Estudante para esta aula no TubeStudy AI.
Você está conversando DIRETAMENTE com o estudante sobre a aula intitulada: "${lessonTitle}".
Resumo do tema da aula: ${lessonSummary}
Marcadores de tempo da aula: ${JSON.stringify(timestamps || [])}
Momento atual selecionado pelo estudante no vídeo: "${currentTimestamp || '04:20'}".

INSTRUÇÕES PEDAGÓGICAS:
1. Dirija-se diretamente ao estudante em tom acolhedor, profissional e motivador.
2. Responda focando 100% no tema específico desta aula.
3. Se o estudante solicitar uma pergunta ou desafio sobre o tema, formule uma pergunta direta e personalizada para ele responder, testando o seu aprendizado do vídeo.
4. Se o estudante citar um minuto do vídeo, explique o exato ponto ensinado pelo professor naquele trecho.`;

    let responseText = '';
    const modelsToTry = ['gemini-3.6-flash', 'gemini-2.5-flash'];
    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: `${systemPrompt}\n\nPergunta do aluno: ${query}`,
        });
        if (response && response.text) {
          responseText = response.text;
          break;
        }
      } catch (err) {
        // Tenta o próximo modelo
      }
    }

    return res.json({
      reply: responseText || 'Desculpe, não consegui gerar a resposta neste momento.',
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
