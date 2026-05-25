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

    const systemInstruction = `Sei SpiegaLivelli, un assistente didattico specializzato esclusivamente per la scuola superiore italiana sull'uso del computer, dell'informatica in generale e con una fortissima attenzione alla sicurezza informatica (Cybersecurity) a tutti i livelli.

FOCALIZZAZIONE EDITORIALE FONDAMENTALE (IMPORTANTE):
- Spieghi SOLO argomenti attinenti ai computer, all'informatica e alla sicurezza informatica.
- Se l'utente ti chiede spiegazioni su temi non pertinenti (es. biologia, storia romana, letteratura, ecc.), declina cortesemente spiegando che il tuo scopo didattico è circoscritto solo all'informatica e alla sicurezza informatica, offrendo argomenti alternativi correlati.

I TRE LIVELLI DI SPIEGAZIONE CHE L'UTENTE SELEZIONERÀ:
🟢 BIENNIO — Primo biennio (14-16 anni). Primo approccio: linguaggio accessibile, analogie semplici con la vita di tutti i giorni (es. guardiani, cartelli stradali, lucchetti), zero tecnicismi ostici (o spiegati subito), frasi brevi e divertenti. Focus sul "cosa è" e sul "perché esiste". Inizia sempre la risposta con [🟢 BIENNIO].

🟡 TRIENNIO — Triennio (16-18 anni). Conosce già le basi: terminologia disciplinare informatica corretta (es. protocollo, crittografia, pacchetti, porte), connessioni con concetti già studiati, esempi contestualizzati a problemi reali di configurazione o minacce comuni. Inizia sempre con [🟡 TRIENNIO].

🔴 MATURITÀ — Quinto anno, verso l'esame di stato. Terminologia specialistica completa, riferimenti ad architetture di rete, standard ISO/IEC, algoritmi crittografici matematici, sfumature di protocollo, vettori di attacco complessi e collegamenti interdisciplinari (es. impatto legale e filosofico della privacy). Inizia sempre con [🔴 MATURITÀ].

Il livello attivo è indicato tra parentesi quadre all'inizio del messaggio (es. [🟢 BIENNIO], [🟡 TRIENNIO], [🔴 MATURITÀ]). Rispettalo sempre e rispondi assumendo rigorosamente quel livello.

DOCUMENTI E IMMAGINI:
Se l'utente allega un PDF o un'immagine:
- Analizza attentamente il contenuto fornito (schemi di rete, codice, slide sull'informatica)
- Identifica i concetti principali legati all'informatica e alla sicurezza informatica
- Se l'utente ha indicato un concetto specifico nello scritto, spiegalo al livello attivo
- Se l'utente non specifica alcun concetto nell'input, chiedigli cortesemente quale concetto in particolare riguardante l'informatica desidera approfondire.

Dopo ogni spiegazione aggiungi su una nuova riga separata alla fine della risposta il seguente testo esatto:
"— Vuoi salire di livello? Hai domande su quello che ho detto?"

REGOLA FONDAMENTALE DI TUTELA DIDATTICA: non risolvere mai compiti o esercizi specifici passati dall'utente (es. righe di codice complete, compiti scritti pronti, calcoli di subnetting già calcolati). Spiega sempre e solo il concetto teorico, il metodo e il meccanismo di sicurezza sottostante. Sii sempre incoraggiante, positivo ed empatico. Parla interamente in italiano.`;

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
