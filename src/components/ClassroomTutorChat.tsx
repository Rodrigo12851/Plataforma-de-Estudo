import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MessageSquare, Clock, ArrowRight, CornerDownLeft, Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { ClassLesson, ChatMessage } from '../types';

interface ClassroomTutorChatProps {
  lesson: ClassLesson;
  onSeekToTimestamp: (timeStr: string) => void;
  initialPrompt?: string | null;
}

export const ClassroomTutorChat: React.FC<ClassroomTutorChatProps> = ({
  lesson,
  onSeekToTimestamp,
  initialPrompt
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'tutor',
      text: `Olá! Sou seu Tutor de IA para a aula "${lesson.title}". Tem alguma dúvida sobre o conteúdo? Você pode digitar ou clicar no microfone para perguntar em áudio!`,
      createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [selectedTimestamp, setSelectedTimestamp] = useState<string>('04:20');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle Speech Recognition for Audio Input
  const toggleListening = () => {
    setMicError(null);
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Seu navegador não suporta a API de Reconhecimento de Voz nativa. Tente usar o Google Chrome ou Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Erro no reconhecimento de voz:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setMicError('Permissão do microfone negada. Clique no ícone de cadeado do navegador para permitir o uso do microfone ou digite sua pergunta por texto.');
        } else {
          setMicError('Não foi possível capturar o áudio. Tente falar novamente ou digite por texto.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Falha ao iniciar reconhecimento de voz:', err);
      setIsListening(false);
    }
  };

  // Text-To-Speech (audio playback for tutor responses)
  const handleSpeakText = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonTitle: lesson.title,
          lessonSummary: lesson.summary,
          timestamps: lesson.timestamps,
          currentTimestamp: selectedTimestamp,
          query: textToSend
        })
      });

      const data = await response.json();

      const tutorMsg: ChatMessage = {
        id: `tut-${Date.now()}`,
        sender: 'tutor',
        text: data.reply || 'Desculpe, tive um contratempo ao consultar os dados da aula.',
        timestampRef: data.timestampRef || selectedTimestamp,
        createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, tutorMsg]);
      if (autoSpeak) {
        handleSpeakText(tutorMsg.id, tutorMsg.text);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'tutor',
        text: `No minuto ${selectedTimestamp}, o professor destaca os pontos centrais da matéria. Tente reformular sua pergunta ou selecione outro marcador!`,
        timestampRef: selectedTimestamp,
        createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      if (autoSpeak) {
        handleSpeakText(fallbackMsg.id, fallbackMsg.text);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl flex flex-col h-[550px] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>Chatbot Tutor com Voz</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className="text-[11px] text-slate-500">Pergunte por texto ou por áudio pelo microfone</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice Response Toggle */}
          <button
            onClick={() => {
              if (autoSpeak && speakingMsgId) {
                window.speechSynthesis?.cancel();
                setSpeakingMsgId(null);
              }
              setAutoSpeak(!autoSpeak);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
              autoSpeak
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800'
            }`}
            title={autoSpeak ? 'Resposta falada automaticamente ativada' : 'Ativar voz automática para respostas'}
          >
            {autoSpeak ? <Volume2 className="w-3.5 h-3.5 text-indigo-600" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{autoSpeak ? 'Voz Ativa' : 'Mudo'}</span>
          </button>

          {/* Timestamp selector badge */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <select
              value={selectedTimestamp}
              onChange={(e) => setSelectedTimestamp(e.target.value)}
              className="bg-transparent text-xs font-mono font-bold text-indigo-700 focus:outline-none cursor-pointer"
            >
              {lesson.timestamps.map((ts, idx) => (
                <option key={idx} value={ts.time} className="bg-white text-slate-800">
                  Minuto {ts.time}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Suggested Quick Question Prompts */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
        <span className="text-slate-500 font-semibold shrink-0">Exemplos:</span>
        <button
          onClick={() => handleSendMessage(`O que o professor quis dizer no minuto ${selectedTimestamp}?`)}
          className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-indigo-700 border border-slate-200 shrink-0 transition-all font-medium shadow-2xs"
        >
          O que o professor quis dizer no minuto {selectedTimestamp}?
        </button>
        <button
          onClick={() => handleSendMessage('Explique o conceito principal dessa aula de forma simples.')}
          className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shrink-0 transition-all font-medium shadow-2xs"
        >
          Explique de forma simples
        </button>
        <button
          onClick={() => handleSendMessage('Me dê um exercício prático com gabarito sobre essa aula.')}
          className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shrink-0 transition-all font-medium shadow-2xs"
        >
          Exercício prático
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : 'AI'}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs md:text-sm leading-relaxed shadow-sm relative group ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <p className="whitespace-pre-line flex-1">{msg.text}</p>
                {msg.sender === 'tutor' && (
                  <button
                    onClick={() => handleSpeakText(msg.id, msg.text)}
                    className="p-1 text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                    title={speakingMsgId === msg.id ? 'Pausar áudio' : 'Ouvir resposta em áudio'}
                  >
                    {speakingMsgId === msg.id ? (
                      <VolumeX className="w-4 h-4 text-indigo-600 animate-pulse" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {/* Timestamp Citation Link */}
              {msg.timestampRef && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono text-[10px]">{msg.createdAt}</span>
                  <button
                    onClick={() => onSeekToTimestamp(msg.timestampRef!)}
                    className="text-indigo-700 hover:underline font-mono font-bold flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100"
                  >
                    <Clock className="w-3 h-3 text-indigo-600" />Ir para o minuto <span className="font-bold text-indigo-600">{msg.timestampRef}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs italic">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Tutor analisando a transcrição e o minuto {selectedTimestamp}...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-slate-100 space-y-2">
        {micError && (
          <div className="flex items-center justify-between gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
            <span>{micError}</span>
            <button
              type="button"
              onClick={() => setMicError(null)}
              className="text-amber-600 hover:text-amber-900 font-bold shrink-0 text-[10px]"
            >
              Fechar
            </button>
          </div>
        )}

        {isListening && (
          <div className="flex items-center gap-2 text-xs text-rose-600 font-bold bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            <span>Ouvindo sua voz... Fale sua pergunta para o tutor.</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={isListening ? 'Fale sua pergunta em áudio...' : 'Pergunte por texto ou clique no microfone...'}
            className="flex-1 bg-transparent px-3 py-2 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />

          {/* Voice Input Microphone Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2.5 rounded-lg transition-all ${
              isListening
                ? 'bg-rose-600 text-white animate-bounce shadow-sm'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
            title={isListening ? 'Parar de gravar' : 'Perguntar por áudio (Voz)'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-all shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
