import { ClassLesson, UserGamification } from '../types';

export const SAMPLE_LESSONS: ClassLesson[] = [
  {
    id: 'lesson-1',
    youtubeUrl: 'https://www.youtube.com/watch?v=aircAruvnKk',
    youtubeId: 'aircAruvnKk',
    title: 'Redes Neurais Artificiais e Deep Learning do Zero',
    channel: 'Curso de IA Aplicada',
    duration: '14:20',
    category: 'Tecnologia',
    summary: 'Nesta aula fundamental, o professor introduz os conceitos matemáticos e práticos por trás das Redes Neurais Artificiais (RNAs), Perceptrons, funções de ativação como ReLU e Sigmóide, o algoritmo de Backpropagation para ajuste de pesos e técnicas essenciais para evitar overfitting.',
    keyTakeaways: [
      'Entendimento biológico e matemático do Perceptron como unidade básica de cálculo.',
      'Importância das funções de ativação não-lineares para mapear problemas complexos.',
      'Funcionamento detalhado do algoritmo de Backpropagation no ajuste de gradiente descendente.',
      'Estratégia de Regularização (Dropout e L2) para manter a generalização do modelo.'
    ],
    timestamps: [
      {
        time: '00:00',
        seconds: 0,
        topic: 'Introdução aos Neurônios Artificiais',
        summary: 'Apresentação da estrutura do Perceptron, entradas ponderadas (pesos) e o termo de viés (bias).'
      },
      {
        time: '02:15',
        seconds: 135,
        topic: 'Funções de Ativação (ReLU e Sigmóide)',
        summary: 'Explicação visual de como a não-linearidade permite que redes profundas aprendam fronteiras de decisão complexas.'
      },
      {
        time: '04:20',
        seconds: 260,
        topic: 'Backpropagation & Algoritmo do Gradiente',
        summary: 'Momento chave: Como o erro calculado na saída retropropaga através da regra da cadeia para atualizar cada peso individual na rede.'
      },
      {
        time: '08:45',
        seconds: 525,
        topic: 'Overfitting e Dropout',
        summary: 'Identificação de sobreajuste aos dados de treino e como o desligamento aleatório de neurônios durante o treino melhora o teste.'
      },
      {
        time: '12:10',
        seconds: 730,
        topic: 'Aplicações Práticas e Próximos Passos',
        summary: 'Visão geral de Visão Computacional e Processamento de Linguagem Natural usando arquiteturas profundas.'
      }
    ],
    flashcards: [
      {
        id: 'fc-1-1',
        front: 'O que é o "Weight" (Peso) em uma Rede Neural?',
        back: 'É um valor numérico atribuído a uma conexão que determina a força e a relevância do sinal de entrada para o resultado do neurônio.',
        srsStage: 'learning',
        nextReviewDays: 1,
        lastReviewed: '2026-08-07'
      },
      {
        id: 'fc-1-2',
        front: 'O que é a função de ativação ReLU?',
        back: 'Rectified Linear Unit f(x) = max(0, x). Retorna 0 para entradas negativas e x para positivas, resolvendo o problema de desaparecimento do gradiente.',
        srsStage: 'new',
        nextReviewDays: 0,
        lastReviewed: null
      },
      {
        id: 'fc-1-3',
        front: 'Como o algoritmo de Backpropagation atualiza os pesos no minuto 04:20?',
        back: 'Ele utiliza a Regra da Cadeia do cálculo diferencial para propagar o erro da camada de saída de volta para as camadas ocultas.',
        srsStage: 'mastered',
        nextReviewDays: 7,
        lastReviewed: '2026-08-05'
      },
      {
        id: 'fc-1-4',
        front: 'Para que serve a técnica de Dropout?',
        back: 'Desliga aleatoriamente uma porcentagem de neurônios durante cada época de treinamento para evitar co-adaptação e combater o overfitting.',
        srsStage: 'learning',
        nextReviewDays: 3,
        lastReviewed: '2026-08-06'
      },
      {
        id: 'fc-1-5',
        front: 'O que representa o "Bias" (Viés) em um neurônio artificial?',
        back: 'Uma constante adicional que permite deslocar a curva da função de ativação para a esquerda ou direita, independente das entradas.',
        srsStage: 'new',
        nextReviewDays: 0,
        lastReviewed: null
      },
      {
        id: 'fc-1-6',
        front: 'Qual é o papel da taxa de aprendizado (Learning Rate)?',
        back: 'Determina o tamanho dos passos dados em direção ao mínimo da função de perda a cada iteração do gradiente descendente.',
        srsStage: 'new',
        nextReviewDays: 0,
        lastReviewed: null
      },
      {
        id: 'fc-1-7',
        front: 'O que é Overfitting?',
        back: 'Quando o modelo memoriza os ruídos dos dados de treinamento e falha ao generalizar para novos dados não vistos.',
        srsStage: 'learning',
        nextReviewDays: 1,
        lastReviewed: '2026-08-07'
      },
      {
        id: 'fc-1-8',
        front: 'Por que usamos Epochs (Épocas) no treinamento?',
        back: 'Uma época é uma passagem completa por todo o conjunto de dados de treinamento para permitir convergência do modelo.',
        srsStage: 'mastered',
        nextReviewDays: 14,
        lastReviewed: '2026-08-01'
      },
      {
        id: 'fc-1-9',
        front: 'O que é a Função de Perda (Loss Function)?',
        back: 'Métrica que quantifica o quão distante a previsão do modelo está do valor real esperado.',
        srsStage: 'new',
        nextReviewDays: 0,
        lastReviewed: null
      },
      {
        id: 'fc-1-10',
        front: 'Qual é a diferença entre Aprendizado Supervisionado e Não-Supervisionado?',
        back: 'No supervisionado os dados possuem rótulos (gabarito); no não-supervisionado o algoritmo descobre padrões sem rótulos.',
        srsStage: 'learning',
        nextReviewDays: 3,
        lastReviewed: '2026-08-06'
      },
      {
        id: 'fc-1-11',
        front: 'O que é a função de ativação Sigmóide?',
        back: 'Função que comprime valores reais no intervalo entre 0 e 1, útil para probabilidades na saída.',
        srsStage: 'new',
        nextReviewDays: 0,
        lastReviewed: null
      },
      {
        id: 'fc-1-12',
        front: 'O que é a técnica de Early Stopping?',
        back: 'Parar o treinamento assim que a perda no conjunto de validação começar a aumentar, prevenindo overfitting.',
        srsStage: 'new',
        nextReviewDays: 0,
        lastReviewed: null
      },
      {
        id: 'fc-1-13',
        front: 'O que é um Batch (Lote) de treinamento?',
        back: 'Subconjunto de amostras processadas juntas antes de atualizar os pesos do modelo.',
        srsStage: 'learning',
        nextReviewDays: 1,
        lastReviewed: '2026-08-07'
      },
      {
        id: 'fc-1-14',
        front: 'O que significa Desaparecimento do Gradiente (Vanishing Gradient)?',
        back: 'Quando os gradientes ficam tão pequenos nas primeiras camadas que os pesos deixam de ser atualizados.',
        srsStage: 'new',
        nextReviewDays: 0,
        lastReviewed: null
      },
      {
        id: 'fc-1-15',
        front: 'O que é o Perceptron de Camada Única (Single-Layer Perceptron)?',
        back: 'O modelo de rede neural mais simples, capaz de resolver apenas problemas linearmente separáveis.',
        srsStage: 'new',
        nextReviewDays: 0,
        lastReviewed: null
      },
      {
        id: 'fc-1-16',
        front: 'O que é uma Camada Oculta (Hidden Layer)?',
        back: 'Camada intermediária entre a entrada e a saída onde ocorrem extrações de características abstratas.',
        srsStage: 'mastered',
        nextReviewDays: 10,
        lastReviewed: '2026-08-02'
      },
      {
        id: 'fc-1-17',
        front: 'O que é a Regularização L2 (Ridge)?',
        back: 'Adiciona uma penalidade proporcional ao quadrado dos pesos na função de perda para evitar pesos gigantes.',
        srsStage: 'new',
        nextReviewDays: 0,
        lastReviewed: null
      },
      {
        id: 'fc-1-18',
        front: 'O que é a matriz de confusão (Confusion Matrix)?',
        back: 'Tabela usada para avaliar o desempenho de um modelo de classificação mostrando acertos e erros.',
        srsStage: 'learning',
        nextReviewDays: 2,
        lastReviewed: '2026-08-06'
      },
      {
        id: 'fc-1-19',
        front: 'O que é o algoritmo Adam (Adaptive Moment Estimation)?',
        back: 'Otimizador popular que combina taxa de aprendizado adaptativa com momento para convergência rápida.',
        srsStage: 'new',
        nextReviewDays: 0,
        lastReviewed: null
      },
      {
        id: 'fc-1-20',
        front: 'Qual a diferença entre Dados de Treino, Validação e Teste?',
        back: 'Treino ajusta pesos; Validação ajusta hiperparâmetros; Teste mede o desempenho final real.',
        srsStage: 'mastered',
        nextReviewDays: 12,
        lastReviewed: '2026-08-03'
      }
    ],
    quiz: [
      {
        id: 'q-1-1',
        question: 'No min 00:00 da aula (Introdução aos Neurônios Artificiais), qual elemento do Perceptron define a relevância de cada entrada?',
        options: [
          'A taxa de transmissão de dados',
          'Os pesos (Weights) atribuídos às conexões',
          'A resolução da tela do monitor',
          'A cor do gráfico de saída'
        ],
        correctAnswer: 1,
        explanation: 'Os pesos numéricos determinam a relevância matemática de cada variável de entrada no cálculo do Perceptron.',
        timestampRef: '00:00'
      },
      {
        id: 'q-1-2',
        question: 'Ainda sobre a referência de 00:00, qual é a função do termo de viés (Bias)?',
        options: [
          'Multiplicar o tempo de aula por dois',
          'Permitir o deslocamento da função de ativação independentemente dos valores de entrada',
          'Remover as camadas ocultas do modelo',
          'Bloquear conexões com sinal negativo'
        ],
        correctAnswer: 1,
        explanation: 'O Bias fornece flexibilidade ao modelo adicionando um valor constante que desloca a curva de decisão.',
        timestampRef: '00:00'
      },
      {
        id: 'q-1-3',
        question: 'Na referência do minuto 02:15 (Funções de Ativação), por que a ReLU é preferida em redes profundas?',
        options: [
          'Porque ela comprime todos os números entre 0 e 1',
          'Porque evita o desaparecimento do gradiente para valores positivos f(x) = max(0, x)',
          'Porque ela exige cálculos de exponencial complexos',
          'Porque elimina a necessidade de treinar com dados'
        ],
        correctAnswer: 1,
        explanation: 'A derivada da ReLU para x > 0 é constante igual a 1, mantendo o gradiente forte em redes profundas.',
        timestampRef: '02:15'
      },
      {
        id: 'q-1-4',
        question: 'Qual é o principal problema da função Sigmóide em redes com muitas camadas (explicado em 02:15)?',
        options: [
          'Ela gera respostas negativas infinitas',
          'Saturação de valores extremos levando ao desaparecimento do gradiente',
          'Impossibilidade de ser calculada por computadores',
          'Funcionar apenas em problemas de regressão linear'
        ],
        correctAnswer: 1,
        explanation: 'Entradas altas ou baixas na Sigmóide têm derivada quase zero, travando o aprendizado das primeiras camadas.',
        timestampRef: '02:15'
      },
      {
        id: 'q-1-5',
        question: 'Qual é a principal função da regra da cadeia no algoritmo Backpropagation (discutido no minuto 04:20)?',
        options: [
          'Aumentar o número de neurônios na camada de entrada',
          'Calcular a derivada parcial do erro em relação a cada peso nas camadas anteriores',
          'Eliminar ruídos do conjunto de dados de teste',
          'Converter saídas contínuas em variáveis binárias de 0 e 1'
        ],
        correctAnswer: 1,
        explanation: 'A regra da cadeia permite decompor a derivada da função de perda global para determinar como cada peso individual afetou o erro final.',
        timestampRef: '04:20'
      },
      {
        id: 'q-1-6',
        question: 'Ainda na referência de 04:20 (Gradiente Descendente), o que acontece se a Taxa de Aprendizado (Learning Rate) for alta demais?',
        options: [
          'O modelo aprende 10 vezes mais rápido com precisão perfeita',
          'O modelo oscila descontroladamente e pode divergirdo mínimo da função de erro',
          'O vídeo do YouTube pausa automaticamente',
          'A rede neural apaga os pesos das entradas'
        ],
        correctAnswer: 1,
        explanation: 'Passos gigantes no gradiente fazem o algoritmo ultrapassar o ponto mínimo sem conseguir convergir.',
        timestampRef: '04:20'
      },
      {
        id: 'q-1-7',
        question: 'O que acontece quando aplicamos o Dropout durante a fase de treinamento (referência 08:45)?',
        options: [
          'Os pesos da rede são permanentemente zerados e apagados do disco',
          'Uma porcentagem aleatória de unidades neurais é temporariamente desativada',
          'A taxa de aprendizado aumenta exponencialmente a cada época',
          'O modelo para de atualizar o Bias em todas as épocas'
        ],
        correctAnswer: 1,
        explanation: 'Ao desligar neurônios aleatoriamente a cada lote, força-se a rede a aprender representações redundantes e robustas sem depender de um único neurônio.',
        timestampRef: '08:45'
      },
      {
        id: 'q-1-8',
        question: 'Qual é a principal consequência prática do Overfitting em um modelo de Machine Learning (referência 08:45)?',
        options: [
          'O modelo obtém excelente precisão nos dados de treino, mas falha gravemente em dados novos',
          'O modelo passa a gastar 0% de CPU',
          'Os gráficos de perda começam a mostrar números negativos',
          'A rede neural apaga automaticamente seus dados ao fechar o navegador'
        ],
        correctAnswer: 0,
        explanation: 'O overfitting significa memorização exata dos dados de treino (incluindo ruídos), perdendo a capacidade de generalizar.',
        timestampRef: '08:45'
      },
      {
        id: 'q-1-9',
        question: 'Na referência do minuto 12:10 (Aplicações Práticas), qual tipo de arquitetura é ideal para Visão Computacional?',
        options: [
          'Redes Neurais Convolucionais (CNNs)',
          'Algoritmos de ordenação de tabelas',
          'Sistemas de arquivos relacionais',
          'Filtros de e-mail simples'
        ],
        correctAnswer: 0,
        explanation: 'As CNNs utilizam filtros de convolução espacial perfeitos para processamento de imagens e vídeo.',
        timestampRef: '12:10'
      },
      {
        id: 'q-1-10',
        question: 'Encerrando a aula em 12:10, qual é o passo essencial recomendado para validar o desempenho real da rede neural?',
        options: [
          'Testar o modelo exclusivamente com as imagens usadas no treinamento',
          'Avaliar o modelo com um conjunto de testes virgem (dados nunca vistos)',
          'Aumentar o número de épocas para 1 milhão sem monitoramento',
          'Desativar todas as funções de ativação'
        ],
        correctAnswer: 1,
        explanation: 'Apenas os dados de teste virgem medem a real capacidade de generalização do modelo no mundo real.',
        timestampRef: '12:10'
      }
    ],
    createdAt: '2026-08-05T10:00:00Z',
    lastStudiedAt: '2026-08-08T12:30:00Z',
    progress: 75
  },
  {
    id: 'lesson-2',
    youtubeUrl: 'https://www.youtube.com/watch?v=Q1YqgPAtzho',
    youtubeId: 'Q1YqgPAtzho',
    title: 'Física Quântica: O Experimento da Fenda Dupla Explicado',
    channel: 'Física Sem Mistérios',
    duration: '11:50',
    category: 'Exatas',
    summary: 'Uma explicação didática sobre a dualidade onda-partícula da matéria e da luz, o comportamento dos elétrons diante do experimento da fenda dupla, o efeito da medição e a interpretação de Copenhague sobre a função de onda.',
    keyTakeaways: [
      'Dualidade onda-partícula demonstrada no padrão de interferência com elétrons.',
      'O papel do observador e como a medição causa o colapso da função de onda.',
      'Princípio da incerteza de Heisenberg e superposição quântica.'
    ],
    timestamps: [
      {
        time: '00:00',
        seconds: 0,
        topic: 'Luz como Onda e Padrão de Interferência',
        summary: 'Demonstração de Young com feixes de luz criando franjas claras e escuras.'
      },
      {
        time: '02:30',
        seconds: 150,
        topic: 'Elétrons na Fenda Dupla',
        summary: 'Lançando partículas individuais de matéria e o surgimento surpreendente do mesmo padrão ondulatório.'
      },
      {
        time: '04:20',
        seconds: 260,
        topic: 'O Efeito do Observador & Colapso da Função de Onda',
        summary: 'Explicado no min 04:20: Ao colocar um detector para saber por qual fenda o elétron passa, a interferência desaparece e o elétron age puramente como partícula clássica!'
      },
      {
        time: '08:10',
        seconds: 490,
        topic: 'Princípio da Incerteza e Conclusões',
        summary: 'A imposição da natureza sobre os limites da medição simultânea de posição e momento.'
      }
    ],
    flashcards: [
      {
        id: 'fc-2-1',
        front: 'O que é a Dualidade Onda-Partícula?',
        back: 'A propriedade em que entes quânticos (como fótons e elétrons) exibem comportamentos tanto de partículas pontuais quanto de ondas distribuídas.',
        srsStage: 'learning',
        nextReviewDays: 1,
        lastReviewed: '2026-08-07'
      },
      {
        id: 'fc-2-2',
        front: 'O que acontece no min 04:20 quando colocamos um detector na fenda?',
        back: 'O padrão de interferência desaparece instantaneamente e os elétrons voltam a se comportar como projéteis clássicos de duas faixas.',
        srsStage: 'mastered',
        nextReviewDays: 7,
        lastReviewed: '2026-08-04'
      },
      {
        id: 'fc-2-3',
        front: 'O que é a Superposição Quântica?',
        back: 'Estado em que uma partícula quântica existe simultaneamente em múltiplos estados ou trajetórias até que uma medição seja realizada.',
        srsStage: 'new',
        nextReviewDays: 0,
        lastReviewed: null
      },
      {
        id: 'fc-2-4',
        front: 'Qual o significado físico da Função de Onda (Psi)?',
        back: 'Representa a amplitude de probabilidade de encontrar a partícula em uma determinada posição no espaço.',
        srsStage: 'learning',
        nextReviewDays: 3,
        lastReviewed: '2026-08-06'
      },
      {
        id: 'fc-2-5',
        front: 'Quem formulou a equação fundamental de onda da física quântica não-relativística?',
        back: 'Erwin Schrödinger em 1925.',
        srsStage: 'new',
        nextReviewDays: 0,
        lastReviewed: null
      },
      {
        id: 'fc-2-6',
        front: 'O que afirma o Princípio da Incerteza de Heisenberg?',
        back: 'É impossível determinar simultaneamente e com precisão arbitrária a posição e o momento linear de uma partícula.',
        srsStage: 'new',
        nextReviewDays: 0,
        lastReviewed: null
      },
      {
        id: 'fc-2-7',
        front: 'O que é o Colapso da Função de Onda?',
        back: 'A transição de um estado quântico de superposição contínua para um único estado definido devido à medição.',
        srsStage: 'learning',
        nextReviewDays: 1,
        lastReviewed: '2026-08-07'
      },
      {
        id: 'fc-2-8',
        front: 'Como se formam as franjas de interferência construtiva?',
        back: 'Quando as cristas de duas ondas se alinham, somando suas amplitudes.',
        srsStage: 'new',
        nextReviewDays: 0,
        lastReviewed: null
      },
      {
        id: 'fc-2-9',
        front: 'Como se formam as franjas destrutivas?',
        back: 'Quando a crista de uma onda encontra o vale de outra, cancelando-se mutuamente.',
        srsStage: 'new',
        nextReviewDays: 0,
        lastReviewed: null
      },
      {
        id: 'fc-2-10',
        front: 'Qual é a Interpretação de Copenhague?',
        back: 'Formulação clássica desenvolvida por Bohr e Heisenberg que aceita a natureza probabilística da mecânica quântica.',
        srsStage: 'new',
        nextReviewDays: 0,
        lastReviewed: null
      },
      {
        id: 'fc-2-11',
        front: 'O que foi o experimento histórico de Thomas Young em 1801?',
        back: 'Primeira demonstração do caráter ondulatório da luz usando luz solar e duas fendas estreitas.',
        srsStage: 'new',
        nextReviewDays: 0,
        lastReviewed: null
      },
      {
        id: 'fc-2-12',
        front: 'O que é o comprimento de onda de De Broglie?',
        back: 'Relação λ = h/p que atribui um comprimento de onda a qualquer partícula com momento p.',
        srsStage: 'learning',
        nextReviewDays: 2,
        lastReviewed: '2026-08-06'
      },
      {
        id: 'fc-2-13',
        front: 'O que é o efeito fotoelétrico?',
        back: 'Emissão de elétrons de um material atingido por luz com frequência acima de um limiar, provando a natureza corpuscular da luz (fótons).',
        srsStage: 'mastered',
        nextReviewDays: 10,
        lastReviewed: '2026-08-01'
      },
      {
        id: 'fc-2-14',
        front: 'Por que elétrons mostram interferência na fenda dupla?',
        back: 'Porque a probabilidade de um único elétron se comporta como uma onda que passa pelas duas fendas ao mesmo tempo.',
        srsStage: 'new',
        nextReviewDays: 0,
        lastReviewed: null
      },
      {
        id: 'fc-2-15',
        front: 'O que é Decoerência Quântica?',
        back: 'Perda do estado de superposição quântica por interação do sistema com o ambiente externo.',
        srsStage: 'new',
        nextReviewDays: 0,
        lastReviewed: null
      },
      {
        id: 'fc-2-16',
        front: 'Qual a constante fundamental envolvida na física quântica?',
        back: 'Constante de Planck (h ≈ 6,626 × 10^-34 J·s).',
        srsStage: 'mastered',
        nextReviewDays: 14,
        lastReviewed: '2026-07-30'
      },
      {
        id: 'fc-2-17',
        front: 'O que representa o famoso experimento mental do Gato de Schrödinger?',
        back: 'Uma ilustração do paradoxo da superposição quântica aplicada a objetos macroscópicos.',
        srsStage: 'new',
        nextReviewDays: 0,
        lastReviewed: null
      },
      {
        id: 'fc-2-18',
        front: 'O que é Emaranhamento Quântico?',
        back: 'Fenômeno onde o estado de duas partículas fica correlacionado de modo instantâneo, independentemente da distância.',
        srsStage: 'learning',
        nextReviewDays: 1,
        lastReviewed: '2026-08-07'
      },
      {
        id: 'fc-2-19',
        front: 'O que ocorre quando a luz tem intensidade muito fraca na fenda dupla?',
        back: 'Os fótons continuam acumulando o mesmo padrão de interferência acumulativo na tela ao longo do tempo.',
        srsStage: 'new',
        nextReviewDays: 0,
        lastReviewed: null
      },
      {
        id: 'fc-2-20',
        front: 'Qual o papel da matriz de densidade na mecânica quântica?',
        back: 'Ferramenta matemática para descrever sistemas quânticos em estados mistos ou estatísticos.',
        srsStage: 'new',
        nextReviewDays: 0,
        lastReviewed: null
      }
    ],
    quiz: [
      {
        id: 'q-2-1',
        question: 'No min 00:00 da aula (Luz como Onda), o que o experimento de Young provou sobre a luz?',
        options: [
          'Que a luz viaja em linha reta como pedras',
          'Que a luz forma franjas de interferência comprovando sua natureza ondulatória',
          'Que a luz diminui de velocidade ao passar pelo papel',
          'Que a luz não possui energia'
        ],
        correctAnswer: 1,
        explanation: 'As franjas claras (interferência construtiva) e escuras (destrutiva) são características exclusivas de fenômenos ondulatórios.',
        timestampRef: '00:00'
      },
      {
        id: 'q-2-2',
        question: 'Ainda em 00:00, o que cria as faixas totalmente escuras na tela de projeção?',
        options: [
          'Cancelamento mútuo quando a crista de uma onda encontra o vale de outra (interferência destrutiva)',
          'Sombra das fendas de madeira',
          'Falta de energia no gerador de luz',
          'A absorção total pelo detector'
        ],
        correctAnswer: 0,
        explanation: 'A interferência destrutiva anula a amplitude da onda produzindo intensidade zero de luz (pontos escuros).',
        timestampRef: '00:00'
      },
      {
        id: 'q-2-3',
        question: 'Na referência do minuto 02:30 (Elétrons na Fenda Dupla), o que surpreendeu os físicos ao disparar elétrons um a um?',
        options: [
          'Os elétrons ricochetearam e voltaram para o canhão',
          'Mesmo sendo partículas de matéria, formaram o mesmo padrão de interferência ondulatória',
          'Os elétrons derreteram a placa de metal',
          'O experimento não gerou nenhum sinal na tela'
        ],
        correctAnswer: 1,
        explanation: 'Isso provou que partículas massivas como elétrons também possuem comprimento de onda de De Broglie.',
        timestampRef: '02:30'
      },
      {
        id: 'q-2-4',
        question: 'Ainda sobre a referência 02:30, por que dizemos que o elétron passa "pelas duas fendas ao mesmo tempo"?',
        options: [
          'Porque ele se divide fisicamente em dois elétrons menores',
          'Porque sua função de onda de probabilidade está em estado de superposição quântica',
          'Porque ele anda em formato de zigue-zague ultra rápido',
          'Porque o professor manipulou o vídeo no YouTube'
        ],
        correctAnswer: 1,
        explanation: 'A amplitude de probabilidade do estado quântico passa por ambas as trajetórias até haver uma medição.',
        timestampRef: '02:30'
      },
      {
        id: 'q-2-5',
        question: 'No min 04:20 da aula, o que ocorre quando um observador tenta medir por qual fenda o elétron passou?',
        options: [
          'A luz fica 100 vezes mais brilhante',
          'O padrão de interferência quântica é destruído e surge uma distribuição de partículas clássicas',
          'O elétron multiplica-se em três partes',
          'O tempo dentro do laboratório diminui'
        ],
        correctAnswer: 1,
        explanation: 'A medição força o colapso da função de onda de superposição em uma única trajetória clássica definida.',
        timestampRef: '04:20'
      },
      {
        id: 'q-2-6',
        question: 'O que o quadrado do módulo da função de onda |Ψ|² representa na física quântica (explicado em 04:20)?',
        options: [
          'A velocidade exata do elétron em km/h',
          'A densidade de probabilidade de encontrar a partícula em determinado ponto',
          'A carga elétrica total da rede',
          'A temperatura do feixe de luz'
        ],
        correctAnswer: 1,
        explanation: 'Postulado por Max Born: o quadrado da amplitude representa a probabilidade de localização.',
        timestampRef: '04:20'
      },
      {
        id: 'q-2-7',
        question: 'Na referência do minuto 08:10 (Princípio da Incerteza), de acordo com Heisenberg, quanto mais precisamente medimos a posição de um elétron...',
        options: [
          'Menos precisamente podemos conhecer seu momento linear (velocidade)',
          'Mais precisamente conhecemos sua massa',
          'Mais rápido ele se transforma em um próton',
          'Mais fácil fica fotografá-lo sem flash'
        ],
        correctAnswer: 0,
        explanation: 'Δx · Δp ≥ ℏ/2. Existe uma limitação fundamental da natureza na medição simultânea dessas variáveis conjugadas.',
        timestampRef: '08:10'
      },
      {
        id: 'q-2-8',
        question: 'Ainda em 08:10, por que essa incerteza não se deve a defeitos nos instrumentos de medição?',
        options: [
          'Porque é uma propriedade intrínseca da natureza ondulatória dos sistemas quânticos',
          'Porque os lasers eram de baixa potência no século XIX',
          'Porque o vácuo dentro do tubo continha poeira',
          'Porque a mecânica quântica não aceita medições'
        ],
        correctAnswer: 0,
        explanation: 'A incerteza não é uma falha tecnológica, mas um limite matemático e físico fundamental do universo.',
        timestampRef: '08:10'
      },
      {
        id: 'q-2-9',
        question: 'Qual é a principal lição filosófica e científica do experimento da fenda dupla?',
        options: [
          'Que a física clássica explica 100% de todos os fenômenos atômicos',
          'Que o ato de observar altera o estado físico do sistema quântico medido',
          'Que elétrons não possuem carga elétrica',
          'Que fótons são mais pesados que prótons'
        ],
        correctAnswer: 1,
        explanation: 'A medição não é um ato passivo na mecânica quântica; interagir com o sistema modifica seu estado fundamental.',
        timestampRef: '04:20'
      },
      {
        id: 'q-2-10',
        question: 'Qual cientista propôs que matérias em movimento também possuem um comprimento de onda associado?',
        options: [
          'Louis de Broglie em 1924',
          'Galileu Galilei em 1610',
          'Michael Faraday em 1831',
          'Nikola Tesla em 1895'
        ],
        correctAnswer: 0,
        explanation: 'De Broglie postulou a hipótese das ondas de matéria, estendendo a dualidade onda-partícula para todos os elétrons.',
        timestampRef: '02:30'
      }
    ],
    createdAt: '2026-08-06T15:30:00Z',
    lastStudiedAt: '2026-08-08T09:15:00Z',
    progress: 40
  }
];

export const INITIAL_GAMIFICATION: UserGamification = {
  streakDays: 4,
  lastStudiedDate: '2026-08-08',
  xp: 480,
  level: 3,
  totalFlashcardsMastered: 12,
  totalQuizzesCompleted: 3,
  totalMinutesFocused: 75,
  achievements: [
    {
      id: 'ach-1',
      title: 'Primeira Aula',
      description: 'Adicionou e estudou sua primeira aula em vídeo.',
      iconName: 'PlayCircle',
      unlocked: true,
      unlockedAt: '2026-08-05'
    },
    {
      id: 'ach-2',
      title: 'Ofensiva de 3 Dias',
      description: 'Estudou por 3 dias consecutivos sem interromper a sequência.',
      iconName: 'Flame',
      unlocked: true,
      unlockedAt: '2026-08-07'
    },
    {
      id: 'ach-3',
      title: 'Mestre do Flashcard',
      description: 'Dominou 10 ou mais flashcards no sistema SRS.',
      iconName: 'Brain',
      unlocked: true,
      unlockedAt: '2026-08-08'
    },
    {
      id: 'ach-4',
      title: 'Foco Inabalável',
      description: 'Completou 2 sessões seguidas do Timer Pomodoro.',
      iconName: 'Timer',
      unlocked: false
    },
    {
      id: 'ach-5',
      title: 'Gabarito Perfeito',
      description: 'Acertou 100% das questões em um Quiz de aula.',
      iconName: 'Award',
      unlocked: false
    },
    {
      id: 'ach-6',
      title: 'Polímata',
      description: 'Estudou aulas em 3 categorias diferentes de conhecimento.',
      iconName: 'Sparkles',
      unlocked: false
    }
  ]
};
