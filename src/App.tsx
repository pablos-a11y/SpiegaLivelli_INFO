import React, { useState, useRef, useEffect } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  Send, 
  Upload, 
  RefreshCw, 
  FileText, 
  Image as ImageIcon, 
  ArrowRight, 
  CheckCircle, 
  BookOpen, 
  X,
  AlertTriangle,
  Lightbulb,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LevelId, LevelConfig, AttachedFile, ChatMessage } from './types';

// Let's configure the level configurations with precise Italian terms and colors aligned to Elegant Dark theme
const LEVELS: LevelConfig[] = [
  {
    id: 'BIENNIO',
    label: 'Biennio',
    subtitle: 'Primo approccio al concetto: linguaggio semplice e analogie quotidiane.',
    badge: '14-16 ANNI',
    colorName: 'green',
    colorHex: '#22c55e',
    emoji: '🟢',
    prefix: '[🟢 BIENNIO]',
    badgeBg: 'bg-green-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase',
    badgeText: 'text-green-400',
    activeBorderClass: 'border-green-500 ring-4 ring-green-500/10',
    activeBgClass: 'bg-green-500/10 border-green-500 shadow-lg shadow-green-500/10',
    hoverClass: 'hover:border-green-500/50 bg-slate-800/30 border-2 border-slate-700/50 transition-colors',
    textPrimaryClass: 'text-green-400'
  },
  {
    id: 'TRIENNIO',
    label: 'Triennio',
    subtitle: 'Ha già le basi della materia: terminologia corretta e connessioni.',
    badge: '16-18 ANNI',
    colorName: 'amber',
    colorHex: '#f59e0b',
    emoji: '🟡',
    prefix: '[🟡 TRIENNIO]',
    badgeBg: 'bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase',
    badgeText: 'text-amber-400',
    activeBorderClass: 'border-amber-500 ring-4 ring-amber-500/10',
    activeBgClass: 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10',
    hoverClass: 'hover:border-amber-500/50 bg-slate-800/30 border-2 border-slate-700/50 transition-colors',
    textPrimaryClass: 'text-amber-400'
  },
  {
    id: 'MATURITA',
    label: 'Maturità',
    subtitle: "Verso l'esame di stato: specialistica, autori e collegamenti.",
    badge: 'QUINTO ANNO',
    colorName: 'red',
    colorHex: '#ef4444',
    emoji: '🔴',
    prefix: '[🔴 MATURITÀ]',
    badgeBg: 'bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase',
    badgeText: 'text-red-400',
    activeBorderClass: 'border-red-500 ring-4 ring-red-500/10',
    activeBgClass: 'bg-red-500/10 border-red-500 shadow-lg shadow-red-500/10',
    hoverClass: 'hover:border-red-500/50 bg-slate-800/30 border-2 border-slate-700/50 transition-colors',
    textPrimaryClass: 'text-red-400'
  }
];

// Starter prompts to quickly hook the student with practical Italian subject concepts
const STARTER_CONCEPTS = [
  { text: "Come funziona una VPN e a cosa serve", subject: "Reti & Sicurezza", tag: "VPN" },
  { text: "Cos'è il Phishing e come difendersi", subject: "Sicurezza Informatica", tag: "Phishing" },
  { text: "Spiega la differenza tra HTTP e HTTPS", subject: "Sistemi e Reti", tag: "Protocolli" },
  { text: "Come funziona la crittografia a chiave pubblica", subject: "Crittografia", tag: "Sicurezza" },
  { text: "A cosa serve e come funziona un Firewall", subject: "Sistemi di Rete", tag: "Firewall" },
  { text: "Che cos'è l'autenticazione MFA (a più fattori)", subject: "Cybersecurity", tag: "Identità" }
];

export default function App() {
  const [activeLevelId, setActiveLevelId] = useState<LevelId>('BIENNIO');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const currentLevelConfig = LEVELS.find(l => l.id === activeLevelId)!;

  // Auto scroll to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle Drag Events for beautiful and responsive drop overlays
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Process File safely and check PDF/Image MIME types
  const processFile = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';

    if (!isImage && !isPDF) {
      triggerError("Formato non supportato. Carica un'immagine (PNG, JPG) o un file PDF.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      triggerError("Il file è troppo grande! La dimensione massima consentita è 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resultString = reader.result as string;
      const base64 = resultString.split(',')[1];
      setAttachedFile({
        name: file.name,
        base64,
        mimeType: file.type || 'application/octet-stream',
        size: (file.size / 1024).toFixed(1) + ' KB'
      });
      setErrorMessage(null); // Clear errors
    };
    reader.onerror = () => {
      triggerError("Errore durante la lettura del file.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => {
      setErrorMessage(prev => prev === msg ? null : prev);
    }, 6000);
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResetConversation = () => {
    setMessages([]);
    setAttachedFile(null);
    setErrorMessage(null);
    setInputText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit trigger
  const handleSend = async (textToSend: string) => {
    const prompt = textToSend.trim();
    if (!prompt && !attachedFile) return;

    // Build user message
    const userMsgId = Date.now().toString();
    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text: prompt,
      level: activeLevelId,
      timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      attachedFile: attachedFile ? {
        name: attachedFile.name,
        mimeType: attachedFile.mimeType,
        size: attachedFile.size
      } : undefined
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInputText('');
    const tempFile = attachedFile;
    setAttachedFile(null);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Automatic prefix append required by the instructions: e.g. [🟢 BIENNIO] la fotosintesi
      const prefix = currentLevelConfig.prefix;
      
      // When mapping to backend messages to send to Gemini, prepending the level tag into user text payload
      const backendMessages = updatedMessages.map((msg, index) => {
        if (msg.role === 'user') {
          const config = LEVELS.find(l => l.id === msg.level) || currentLevelConfig;
          const levelTag = config.prefix;
          
          return {
            role: 'user',
            // Prepend the bracket tag, ONLY if not already prepended
            text: msg.text.startsWith('[') ? msg.text : `${levelTag} ${msg.text || "Spiega il file allegato"}`
          };
        } else {
          return {
            role: 'assistant',
            text: msg.text
          };
        }
      });

      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: backendMessages,
          file: tempFile ? {
            base64: tempFile.base64,
            mimeType: tempFile.mimeType,
            name: tempFile.name
          } : undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Errore nella comunicazione con l'assistente.");
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: data.text,
          level: activeLevelId,
          timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
        }
      ]);

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Impossibile collegarsi al server scolastico.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputText);
  };

  const handleSelectStarter = (concept: string) => {
    setInputText(concept);
  };

  // Smart Markdown parser implementation
  function SmartMarkdown({ text }: { text: string }) {
    const lines = text.split('\n');
    return (
      <div className="space-y-3 text-slate-200 leading-relaxed text-[15px] sm:text-base">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1.5" />;

          // Check level prefixes to beautifully highlight them or make them styled badge instead of raw brackets
          let formattedLine = line;
          const levelBadgeMatch = LEVELS.find(l => trimmed.startsWith(l.prefix));
          if (levelBadgeMatch) {
            // strip the bracket tag since we will render a modern visual badge in the header of the bubble
            formattedLine = trimmed.substring(levelBadgeMatch.prefix.length).trim();
          }

          if (formattedLine.startsWith('### ')) {
            return (
              <h4 key={idx} className="text-base font-bold text-slate-100 mt-3 pt-1 tracking-tight flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-slate-500 rounded-full inline-block"></span>
                {parseInline(formattedLine.substring(4))}
              </h4>
            );
          }
          if (formattedLine.startsWith('## ')) {
            return (
              <h3 key={idx} className="text-lg font-bold text-slate-50 mt-4 pt-1 tracking-tight flex items-center gap-2">
                <span className="w-2 h-4 bg-slate-400 rounded"></span>
                {parseInline(formattedLine.substring(3))}
              </h3>
            );
          }
          if (formattedLine.startsWith('# ')) {
            return (
              <h2 key={idx} className="text-xl font-bold text-white mt-5 mb-2 border-b border-slate-800 pb-1.5 tracking-tight">
                {parseInline(formattedLine.substring(2))}
              </h2>
            );
          }

          // Bullet points
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            // Strip possible list characters
            const bulletText = trimmed.substring(2);
            return (
              <div key={idx} className="flex items-start gap-2.5 ml-2 mr-1">
                <span className="text-slate-500 shrink-0 select-none mt-1.5">•</span>
                <p className="flex-1 text-slate-300">{parseInline(bulletText)}</p>
              </div>
            );
          }

          // Numbered lists
          const numListMatch = trimmed.match(/^(\d+)\.\s(.*)/);
          if (numListMatch) {
            const num = numListMatch[1];
            const numText = numListMatch[2];
            return (
              <div key={idx} className="flex items-start gap-2.5 ml-2 mr-1">
                <span className="font-mono text-xs font-semibold text-slate-500 shrink-0 select-none mt-1.5">{num}.</span>
                <p className="flex-1 text-slate-300">{parseInline(numText)}</p>
              </div>
            );
          }

          // Quotes
          if (trimmed.startsWith('> ')) {
            return (
              <div key={idx} className="border-l-4 border-slate-700 pl-4 py-2 italic text-slate-300 bg-slate-900/50 rounded-r-lg my-2">
                {parseInline(trimmed.substring(2))}
              </div>
            );
          }

          // Divider
          if (trimmed === '---') {
            return <hr key={idx} className="my-4 border-slate-800" />;
          }

          // Regular paragraph
          return (
            <p key={idx} className="text-slate-300 font-normal">
              {parseInline(formattedLine)}
            </p>
          );
        })}
      </div>
    );
  }

  function parseInline(text: string) {
    const parts: React.ReactNode[] = [];
    let currentKey = 0;
    
    // Split on asterisks or backticks
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    const tokens = text.split(regex);
    
    tokens.forEach((token) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={currentKey++} className="font-bold text-white">
            {token.substring(2, token.length - 2)}
          </strong>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code key={currentKey++} className="px-1.5 py-0.5 font-mono text-xs font-medium bg-slate-800 text-red-400 rounded border border-slate-700 whitespace-pre-wrap">
            {token.substring(1, token.length - 1)}
          </code>
        );
      } else {
        parts.push(token);
      }
    });

    return parts;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans antialiased flex flex-col selection:bg-slate-800">
      
      {/* Decorative school grid header background */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-slate-900/50 via-slate-950/20 to-transparent pointer-events-none border-b border-slate-900 grid-pattern"></div>
      
      {/* Header element */}
      <header className="relative w-full py-4 px-4 sm:px-6 md:px-8 border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-40 transition-all">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 transition-all duration-300">
              <GraduationCap className={`w-6 h-6 text-${currentLevelConfig.id === 'BIENNIO' ? 'green' : currentLevelConfig.id === 'TRIENNIO' ? 'amber' : 'red'}-400`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">
                  Spiega<span className={currentLevelConfig.id === 'BIENNIO' ? 'text-green-500' : currentLevelConfig.id === 'TRIENNIO' ? 'text-amber-500' : 'text-red-500'}>Livelli</span>
                </h1>
                <span className="text-[10px] font-mono tracking-widest bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 font-bold text-slate-400">v0.9</span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Informatica, reti e sicurezza cyber a misura di studente</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* New conversation trigger */}
            {messages.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={handleResetConversation}
                className="flex items-center gap-2 py-2 px-3 sm:px-4 rounded-xl text-xs font-medium bg-slate-805/50 hover:bg-slate-800 text-slate-300 border border-slate-705 border-slate-700 transition-colors cursor-pointer"
                title="Svuota la chat attuale"
                id="btn-new-conversation"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin-slow" />
                <span className="hidden sm:inline">Nuova conversazione</span>
              </motion.button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col relative z-10">
        
        {/* Onboarding introductory layout */}
        <div className="mb-6 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 sm:p-6 overflow-hidden relative shadow-xl">
          <div className="absolute top-0 right-0 p-8 opacity-5 shrink-0 select-none pointer-events-none text-white">
            <BookOpen className="w-32 h-32" />
          </div>
          
          <div className="max-w-3xl">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-1">
              Benvenuto su SpiegaLivelli! 📚
            </h2>
            <p className="text-sm text-slate-450 text-slate-400 leading-relaxed">
              Scegli il livello scolastico per modulare la spiegazione. Approfondisci l'hardware, le reti, lo sviluppo software o la sicurezza cyber, oppure allega schemi, immagini di codice e file PDF didattici per estrarne i concetti chiave.
            </p>
          </div>

          {/* Level Configuration buttons */}
          <div className="mt-5">
            <label className="block text-xs font-semibold tracking-wider text-slate-500 uppercase mb-3">
              LIVELLI SCOLASTICI DISPONIBILI
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {LEVELS.map((level) => {
                const isActive = activeLevelId === level.id;
                return (
                  <button
                    key={level.id}
                    onClick={() => {
                      setActiveLevelId(level.id);
                      setErrorMessage(null);
                    }}
                    id={`level-tab-${level.id}`}
                    className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? `${level.activeBgClass} ${level.activeBorderClass}` 
                        : `bg-slate-800/30 border-slate-700/50 text-slate-300 ${level.hoverClass}`
                    }`}
                  >
                    <div className="flex items-between justify-between w-full mb-2 items-center">
                      <span className="text-lg font-bold flex items-center gap-1.5 text-white">
                        <span className="text-base leading-none select-none">{level.emoji}</span>
                        {level.label}
                      </span>
                      <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded ${level.badgeBg}`}>
                        {level.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-normal italic">
                      {level.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chat Thread Workspace Container */}
        <div className="flex-1 flex flex-col bg-slate-900/20 border border-slate-800 rounded-2xl shadow-xl overflow-hidden min-h-[400px]">
          
          {/* Chat scrolling viewport */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6" style={{ maxHeight: 'calc(100vh - 460px)', minHeight: '320px' }} id="chat-scroller">
            
            <AnimatePresence initial={false}>
              {messages.length === 0 ? (
                // Empty state view with starter templates
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col justify-center py-4"
                >
                  <div className="text-center max-w-sm mx-auto mb-6">
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-6 h-6 text-slate-500 animate-pulse" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-200">Nessuna spiegazione richiesta ancora</h3>
                    <p className="text-xs text-slate-500 mt-1">Scegli una delle tracce o digita il concetto informatico o cyber da studiare insieme.</p>
                  </div>

                  <div className="max-w-2xl mx-auto w-full">
                    <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase mb-3 px-1.5 justify-center">
                      <Lightbulb className="w-3.5 h-3.5 text-slate-500" />
                      Idee per iniziare a studiare
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {STARTER_CONCEPTS.map((concept, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectStarter(concept.text)}
                          className="text-left p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-850 hover:border-slate-700 hover:shadow-md text-xs transition-all flex flex-col justify-between h-full cursor-pointer"
                        >
                          <span className="font-medium text-slate-250 text-slate-300 line-clamp-2 leading-relaxed mb-1">
                            "{concept.text}"
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase font-mono">
                            {concept.subject}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                // Messages list mapping
                <div key="messages-list" className="space-y-6">
                  {messages.map((msg) => {
                    const isModel = msg.role === 'assistant';
                    const config = LEVELS.find(l => l.id === msg.level) || currentLevelConfig;
                    
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col ${isModel ? 'items-start' : 'items-end'}`}
                      >
                        {/* Level badge header on top of the bubble */}
                        <div className={`flex items-center gap-1.5 text-xs text-slate-550 mb-1 px-1 ${isModel ? 'justify-start' : 'justify-end'}`}>
                          <span className="text-[10px] select-none">{config.emoji}</span>
                          <span className="font-bold text-slate-400">{config.label}</span>
                          <span className="text-[9px] text-slate-700">•</span>
                          <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                        </div>

                        {/* Speech Bubble */}
                        <div 
                          className={`max-w-[85%] rounded-2xl p-4 sm:p-5 shadow-xl border ${
                            isModel 
                              ? 'bg-slate-800 border-slate-705 border-slate-700 text-slate-200 rounded-tl-none' 
                              : `bg-${config.id === 'BIENNIO' ? 'green-600' : config.id === 'TRIENNIO' ? 'amber-600' : 'red-600'} text-white border-transparent rounded-tr-none`
                          }`}
                        >
                          {/* File Attachment Pill within the bubble */}
                          {msg.attachedFile && (
                            <div className="mb-3 flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800 max-w-sm text-xs">
                              {msg.attachedFile.mimeType === 'application/pdf' ? (
                                <FileText className="w-4 h-4 text-red-400 shrink-0" />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-green-400 shrink-0" />
                              )}
                              <span className="font-medium text-slate-300 truncate flex-1" title={msg.attachedFile.name}>
                                {msg.attachedFile.name}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                ({msg.attachedFile.size})
                              </span>
                            </div>
                          )}

                          {/* Render Rich Markdown with appropriate syntax handling */}
                          {isModel ? (
                            <SmartMarkdown text={msg.text} />
                          ) : (
                            <p className="text-white font-normal leading-relaxed text-[15px] sm:text-base break-words">
                              {msg.text || "Spiega il file allegato."}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Waiting loader */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-start"
                    >
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 px-1">
                        <span>⚡</span>
                        <span>SpiegaLivelli sta elaborando...</span>
                      </div>
                      <div className="max-w-[75%] rounded-2xl p-4 sm:p-5 bg-slate-800 border border-slate-700 rounded-tl-none space-y-3 shadow-xl">
                        <div className="flex items-center gap-3">
                          <div className="flex space-x-1.5 items-center justify-center">
                            <div className={`w-2.5 h-2.5 bg-${currentLevelConfig.id === 'BIENNIO' ? 'green-500' : currentLevelConfig.id === 'TRIENNIO' ? 'amber-500' : 'red-500'} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
                            <div className={`w-2.5 h-2.5 bg-${currentLevelConfig.id === 'BIENNIO' ? 'green-500' : currentLevelConfig.id === 'TRIENNIO' ? 'amber-500' : 'red-500'} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
                            <div className={`w-2.5 h-2.5 bg-${currentLevelConfig.id === 'BIENNIO' ? 'green-500' : currentLevelConfig.id === 'TRIENNIO' ? 'amber-500' : 'red-500'} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-xs font-semibold text-slate-400 font-mono">Generando la spiegazione per il {currentLevelConfig.label}...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </AnimatePresence>
            <div ref={chatBottomRef} />
          </div>

          {/* Prompt/Input Area with Level-synced style triggers and drag-and-drop overlays */}
          <div className="border-t border-slate-800 p-4 sm:p-5 bg-slate-950 relative">
            
            {/* Safe visual drop area overlays */}
            <AnimatePresence>
              {isDragging && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className="absolute inset-0 bg-[#020617]/95 backdrop-blur-sm flex flex-col items-center justify-center border-2 border-dashed border-slate-705 border-slate-700 z-10 p-4 m-2 rounded-xl"
                >
                  <Upload className={`w-8 h-8 text-${activeLevelId === 'BIENNIO' ? 'green' : activeLevelId === 'TRIENNIO' ? 'amber' : 'red'}-400 animate-bounce mb-2`} />
                  <p className="text-sm font-semibold text-slate-200">Rilascia il file per allegarlo</p>
                  <p className="text-xs text-slate-500 mt-1">Immagine (PNG/JPG) o Documento PDF fino a 5MB</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error notifications (No-alert requirement) */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mb-3 p-3 rounded-xl bg-red-950/40 border border-red-900/40 text-red-400 text-xs font-medium flex items-center justify-between gap-3 shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                  <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-300 shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Current file attachment indicator */}
            <AnimatePresence>
              {attachedFile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-3 inline-flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs shadow-sm max-w-full text-slate-350"
                >
                  <div className="flex items-center gap-1.5 pl-1.5">
                    {attachedFile.mimeType === 'application/pdf' ? (
                      <FileText className="w-4 h-4 text-red-400 shrink-0" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-green-400 shrink-0" />
                    )}
                    <span className="font-semibold text-slate-200 max-w-[200px] truncate" title={attachedFile.name}>
                      {attachedFile.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">({attachedFile.size})</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeAttachment}
                    className="p-1 rounded-full text-slate-500 hover:text-slate-350 hover:bg-slate-800 transition-colors cursor-pointerSB"
                    title="Rimuovi allegato"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Send input form with target 44px fields and dynamic borders */}
            <form onSubmit={handleSubmitForm} className="flex items-center gap-3">
              <div 
                className={`flex-1 flex items-center bg-slate-900 rounded-xl border-2 transition-all duration-300 min-h-[44px] sm:min-h-[50px] px-3 ${
                  activeLevelId === 'BIENNIO' ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]' :
                  activeLevelId === 'TRIENNIO' ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]' :
                  'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                }`}
              >
                
                {/* Trigger file input natively */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="application/pdf,image/*" 
                  className="hidden" 
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-2 sm:p-2.5 rounded-lg text-slate-400 transition-colors shrink-0 flex items-center justify-center cursor-pointer ${
                    activeLevelId === 'BIENNIO' ? 'hover:text-green-400 hover:bg-slate-800' :
                    activeLevelId === 'TRIENNIO' ? 'hover:text-amber-400 hover:bg-slate-800' :
                    'hover:text-red-400 hover:bg-slate-800'
                  }`}
                  title="Allega PDF o Immagine (Max 5MB)"
                  id="btn-attach-file"
                >
                  <Upload className="w-4.5 h-4.5" />
                </button>

                <div className="w-px h-5 bg-slate-800 mx-2 shrink-0" />

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Che concetto vuoi che ti spieghi?"
                  className="flex-1 border-0 focus:ring-0 text-slate-100 text-sm focus:outline-none placeholder-slate-555 placeholder-slate-500 bg-transparent py-2 px-1"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || (!inputText.trim() && !attachedFile)}
                id="btn-send-message"
                className={`p-3.5 rounded-xl font-bold flex items-center justify-center transition-all shadow-lg shrink-0 min-h-[44px] min-w-[44px] cursor-pointer disabled:opacity-45 disabled:pointer-events-none ${
                  activeLevelId === 'BIENNIO' ? 'bg-green-500 hover:bg-green-400 text-slate-950 shadow-green-500/20 active:scale-95' :
                  activeLevelId === 'TRIENNIO' ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 active:scale-95' :
                  'bg-red-500 hover:bg-red-400 text-slate-950 shadow-red-500/20 active:scale-95'
                }`}
                title="Invia domanda"
              >
                <Send className="w-4.5 h-4.5 transform rotate-0" />
              </button>
            </form>
            
            {/* Helpful footer descriptor */}
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span className="flex items-center gap-1.5 font-normal">
                <Info className="w-3.5 h-3.5 shrink-0 text-slate-600" />
                Trascina qui il tuo file scolastico per caricarlo velocemente.
              </span>
              <span className="font-mono text-[10px] bg-slate-900 px-1.5 py-0.5 text-slate-500 rounded border border-slate-850">
                Attivo: {currentLevelConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Protection alert notification based on Core Protection Rule */}
        <div className="mt-4 bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-start gap-3 shadow-md">
          <BookOpen className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-200">Normativa di tutela didattica: </span> 
            SpiegaLivelli è programmato per promuovere l'apprendimento autonomo dell'informatica. L'assistente spiegherà le architetture, i protocolli e i framework di sicurezza informatica, rifiutandosi fermamente di svolgere interi esercizi scolastici, scrivere codice pronto per i compiti o compiere configurazioni non autorizzate.
            <br />
            <span className="text-[11px] text-slate-500 block mt-1">N.B. L'assistente fa riferimento esclusivamente a computer, reti, sistemi e cybersecurity.</span>
          </div>
        </div>

      </main>

      {/* Styled academic Footer footer */}
      <footer className="w-full py-6 px-4 border-t border-slate-900 bg-slate-950/80 select-none text-center">
        <p className="text-xs text-slate-500 font-normal">
          SpiegaLivelli • Strumento di supporto didattico digitale per le scuole secondarie italiane.
        </p>
      </footer>
    </div>
  );
}
