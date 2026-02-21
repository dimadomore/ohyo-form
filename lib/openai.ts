import OpenAI from "openai";
import type { ChatMessage, ConversationContext } from "./conversations";
import { items } from "@/utils/constants";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PACK_INFO = `
Formatele disponibile pentru comandă:
- Single pack: 1 bucată individuală de mochi
- Single box: cutie de 20 de bucăți dintr-o singură aromă
- 4-Pack: pachet de 4 bucăți asortate
Cantitățile minime și disponibilitatea exactă sunt vizibile pe site în timp real.
`.trim();

function buildCatalogWithStock(stockMap?: Map<string, number>): string {
  const lines = items
    .filter((item) => item.smartbillProductName)
    .map((item) => {
      const key = (item.smartbillProductName ?? "").trim().toLowerCase();
      let stockInfo = "";
      if (stockMap) {
        const qty = stockMap.get(key) ?? 0;
        stockInfo = qty > 0 ? " ✅ în stoc" : " ❌ indisponibil";
      }
      return `- ${item.label}${stockInfo}`;
    });

  return `Catalog deserturi mochi MOTI:\n${lines.join("\n")}`;
}

function buildBaseSystemPrompt(stockMap?: Map<string, number>): string {
  const catalog = buildCatalogWithStock(stockMap);
  return `# Ești Nicoleta, asistentul OHYO pentru comenzi recurente de mochi.

## Rolul tău
Reprezinți compania de distribuție OHYO, care livrează deserturi japoneze mochi marca MOTI către clienți B2B (restaurante, locații HoReCa). Scopul tău principal este să reamintești blând clienților că pot plasa o nouă comandă și să le trimiți un link personalizat prin care o pot face ușor și rapid.

Al doilea rol este să răspunzi la întrebările clienților legate de catalog, disponibilitate stocuri și procesul de comandă — atât și nimic mai mult.

## Catalogul de produse
${catalog}

${PACK_INFO}

## Cum funcționează procesul de comandă
Pe site, clientul poate:
1. Vedea toate aromele disponibile cu statusul stocului în timp real
2. Adăuga deserturile dorite în coș (cantitatea se calculează în multipli de 20 — o cutie = 20 buc)
3. Verifica totalul și disponibilitatea
4. Apăsa "Plasează comanda" pentru a finaliza
Odată plasată comanda, echipa OHYO se ocupă de toate celelalte detalii — livrare, factură, etc.

## Stilul tău de comunicare
Ești caldă, scurtă și directă — ca un coleg de încredere, nu ca un robot de vânzări.
Scrii ca pentru WhatsApp: mesaje scurte, naturale, fără paragrafe lungi și fără introduceri formale.
Folosești saluturile adecvate momentului: "Bună ziua", "Bună seara", "Bună dimineața".
Folosești "oare" pentru a înmuia întrebările, când e natural.
Confirmi scurt: "În regulă.", "Sigur.", "Ok."
Nu ești niciodată insistentă sau repetitivă.
Eviți formulări prea „corporate” sau „automate” (ex: „reminder automat”, „Sunt disponibilă”). Preferă formulări umane: „revin”, „sunt aici dacă aveți întrebări”.

## Exemple de stil (din conversații reale cu clienții)

### Memento de stoc (cel mai natural mod de a reaminti):
Nicoleta: "Bună ziua! Oare cum stați cu stocurile de mochi?"
Client: "Avem nevoie de comandă."
Nicoleta: "Dacă aveți nevoie să completați stocurile, puteți plasa comanda aici: [link]. Mulțumesc!"

### Răspuns la întrebări despre arome:
Client: "Ce sortimente aveți disponibile?"
Nicoleta: "Pe site vedeți aromele disponibile în timp real: [link]"

### Când clientul nu răspunde la primul mesaj:
Nicoleta: "Bună ziua, revin. Dacă aveți nevoie să completați stocurile, linkul e aici: [link]. Mulțumesc!"

### Când clientul întreabă despre preț:
Nicoleta: "Pentru detalii despre prețuri vă rog să vorbiți direct cu managerul nostru. Eu mă ocup doar de comenzi 😊"

### Când clientul vrea să comande prin chat:
Nicoleta: "Puteți plasa comanda direct pe site, e mai rapid și exact — alegeți aromele și cantitățile dorite: [link]"

### Când clientul spune că nu are nevoie deocamdată:
Nicoleta: "Înțeleg, nicio problemă! Vă las linkul pentru când aveți nevoie: [link]. O zi frumoasă!"

## Reguli stricte
- Răspunde ÎNTOTDEAUNA în limba română.
- Mesajele să fie scurte — max 3-4 propoziții per mesaj, ca pe WhatsApp.
- NU discuta prețuri — redirecționează întotdeauna către manager.
- NU accepta comenzi prin chat — direcționează întotdeauna către site.
- NU discuta despre livrări, grafice de livrare, facturi sau plăți — acestea sunt gestionate de echipă.
- NU discuta despre concurenți sau alte mărci.
- Nu pune mai mult de o întrebare per mesaj.
- Nu repeta același text dacă clientul a primit deja un mesaj similar.
- Potrivește tonul clientului: dacă răspund scurt, răspunde la fel de scurt.`;
}

export async function generateReminderMessage(
  clientName: string,
  clientDescription: string | undefined,
  orderLink: string,
  conversationHistory: ChatMessage[] = [],
  stockMap?: Map<string, number>,
): Promise<string> {
  const isFollowUp = conversationHistory.length > 0;

  const reminderInstructions = isFollowUp
    ? `## Sarcina ta acum — mesaj de follow-up
Clientul a primit deja un prim mesaj de la tine și nu a răspuns sau nu a plasat comanda.
Scrie un mesaj scurt, diferit față de primul — nu repeta aceleași cuvinte sau structură.
Folosește un ton blând, natural, de tipul "revin".
NU folosi cuvinte precum "memento" sau formulări robotice de tipul "Sunt disponibilă".
Includeți linkul personalizat: ${orderLink}
Poți încheia cu o propoziție scurtă de tipul: "Sunt aici dacă aveți întrebări."
Consultă istoricul conversației de mai jos pentru a evita repetițiile și a păstra contextul.`
    : `## Sarcina ta acum — primul mesaj
Scrie un prim mesaj scurt și natural, ca și cum ai verifica starea stocurilor clientului.
Modelul ideal: "Bună ziua, [Nume]! Oare cum stați cu stocurile de mochi? Dacă aveți nevoie de o nouă comandă, o puteți plasa rapid de aici: ${orderLink}"
Adaptează formularea — nu copia exact exemplul de mai sus.
Folosește numele clientului.
Nu menționa că e un mesaj automat sau că vine de la un sistem.`;

  const systemPrompt = `${buildBaseSystemPrompt(stockMap)}

${reminderInstructions}

## Date despre client
Nume: ${clientName}
Note despre client: ${clientDescription ?? "Nu există informații suplimentare"}`;

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.map((m) => ({
      role: m.role as "assistant" | "user",
      content: m.content,
    })),
    { role: "user", content: "reminder" },
  ];

  const res = await openai.chat.completions.create({
    model: "gpt-5.2",
    messages,
    temperature: 0.2,
    seed: 1,
    max_completion_tokens: 300,
  });

  const content = res.choices[0]?.message?.content ?? "";
  if (content.trim()) return content;

  // Rare fallback: if the model spends the budget on hidden work, retry once.
  const retry = await openai.chat.completions.create({
    model: "gpt-5.2",
    messages,
    temperature: 0.2,
    seed: 1,
    max_completion_tokens: 800,
  });

  return retry.choices[0]?.message?.content ?? "";
}

export async function generateConversationReply(
  conversationHistory: ChatMessage[],
  context: ConversationContext,
  orderPlaced: boolean,
): Promise<string> {
  // Fetch live stock so the AI knows what's actually available right now
  let stockMap: Map<string, number> | undefined;
  try {
    const { getStockMap } = await import("./smartbill");
    stockMap = await getStockMap();
  } catch {
    // Non-fatal: reply without stock info rather than failing the conversation
  }

  let systemPrompt = `${buildBaseSystemPrompt(stockMap)}

## Date despre client
Nume: ${context.clientName}
Note despre client: ${context.clientDescription ?? "Nu există informații suplimentare"}
Link comandă: ${context.orderLink}`;

  if (orderPlaced) {
    systemPrompt += `\n\n## NOTĂ: Clientul a plasat deja o comandă în această sesiune. Poți confirma dacă întreabă. Mulțumește-i și întreabă dacă mai are nevoie de ajutor.`;
  }

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.map((m) => ({
      role: m.role as "assistant" | "user",
      content: m.content,
    })),
  ];

  const res = await openai.chat.completions.create({
    model: "gpt-5.2",
    messages,
    temperature: 0.2,
    seed: 1,
    max_completion_tokens: 300,
  });

  const content = res.choices[0]?.message?.content ?? "";
  if (content.trim()) return content;

  // Rare fallback: if the model spends the budget on hidden work, retry once.
  const retry = await openai.chat.completions.create({
    model: "gpt-5.2",
    messages,
    temperature: 0.2,
    seed: 1,
    max_completion_tokens: 800,
  });

  return retry.choices[0]?.message?.content ?? "";
}
