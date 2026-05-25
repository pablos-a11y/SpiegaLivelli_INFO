import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { messages, file } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "No messages provided" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not defined" });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemInstruction = `Sei SpiegaLivelli, un assistente didattico per la scuola superiore italiana. Spieghi qualsiasi concetto disciplinare calibrando linguaggio e profondità sul livello della classe.

I TRE LIVELLI DI SPIEGAZIONE CHE L'UTENTE SELEZIONERÀ:
🟢 BIENNIO — Primo biennio (14-16 anni). Primo approccio: linguaggio accessibile, analogie con la vita quotidiana, zero tecnicismi (o spiegati subito), frasi brevi. Focus sul "cosa è" e sul "perché esiste". Inizia sempre la risposta con [🟢 BIENNIO].

🟡 TRIENNIO — Triennio (16-18 anni). Conosce le basi: terminologia disciplinare corretta, connessioni con concetti già studiati, esempi contestualizzati alla materia. Inizia sempre con [🟡 TRIENNIO].

🔴 MATURITÀ — Quinto anno, verso l'esame di stato. Terminologia specialistica completa, riferimenti ad autori e teorie, sfumature, casi particolari, collegamenti interdisciplinari. Inizia sempre con [🔴 MATURITÀ].

Il livello attivo è indicato tra parentesi quadre all'inizio del messaggio (es. [🟢 BIENNIO], [🟡 TRIENNIO], [🔴 MATURITÀ]). Rispettalo sempre e rispondi assumendo rigorosamente quel livello.

DOCUMENTI E IMMAGINI:
Se l'utente allega un PDF o un'immagine:
- Analizza attentamente il contenuto fornito
- Identifica i concetti principali
- Se l'utente ha indicato un concetto specifico nello scritto, spiegalo al livello attivo
- Se l'utente non specifica alcun concetto nell'input, chiedigli cortesemente quale concetto in particolare desidera approfondire.

Dopo ogni spiegazione aggiungi su una nuova riga separata alla fine della risposta il seguente testo esatto:
"— Vuoi salire di livello? Hai domande su quello che ho detto?"

REGOLA FONDAMENTALE DI TUTELA DIDATTICA: non risolvere mai compiti o esercizi specifici passati dall'utente (es. equazioni numeriche, traduzioni letterali, calcoli chimici pronti). Spiega sempre e solo il concetto teorico, il metodo e il meccanismo scientifico o logico sottostante. Sii sempre incoraggiante, positivo ed empatico. Parla interamente in italiano.`;

    // Map messages array to Gemini contents structure
    const contents: any[] = [];

    // Filter and build the parts correctly
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const isUser = msg.role === 'user';
      const role = isUser ? 'user' : 'model';

      const parts: any[] = [];

      // If this is the last user message and there is a file in the payload, provide it as inlineData
      if (isUser && i === messages.length - 1 && file?.base64 && file?.mimeType) {
        parts.push({
          inlineData: {
            mimeType: file.mimeType,
            data: file.base64
          }
        });
      }

      parts.push({ text: msg.text });
      contents.push({ role, parts });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const replyText = response.text || "";
    return res.status(200).json({ text: replyText });

  } catch (error: any) {
    console.error("Gemini API error:", error);
    return res.status(500).json({ error: error.message || "Qualcosa è andato storto con l'intelligenza artificiale." });
  }
}
