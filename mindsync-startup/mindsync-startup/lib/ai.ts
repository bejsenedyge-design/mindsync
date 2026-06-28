export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const MODELS = [
  "openrouter/free",
  "meta-llama/llama-4-scout:free",
  "meta-llama/llama-4-maverick:free",
  "deepseek/deepseek-chat-v3-0324:free",
];

function detectLanguage(text: string): "kk" | "ru" | "en" {
  const kazakhChars = /[әіңғүұқөһӘІҢҒҮҰҚӨҺ]/;
  const russianChars = /[а-яёА-ЯЁ]/;
  if (kazakhChars.test(text)) return "kk";
  if (russianChars.test(text)) return "ru";
  return "en";
}

// Markdown тегтерін тазарту — **bold**, ###, -- т.б.
function cleanMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s*/g, "")           // ### тақырыптар
    .replace(/\*\*(.*?)\*\*/g, "$1")     // **жирный**
    .replace(/\*(.*?)\*/g, "$1")         // *курсив*
    .replace(/`(.*?)`/g, "$1")           // `код`
    .replace(/^[-–—]\s+/gm, "• ")        // - тізім → • тізім
    .replace(/^\d+\.\s+/gm, (m) => m)   // 1. тізім қалады
    .replace(/\n{3,}/g, "\n\n")          // Артық бос жолдар
    .trim();
}

// Google Translate арқылы аудару
async function translate(text: string, from: string, to: string): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data[0].map((c: [string]) => c[0]).filter(Boolean).join("") || text;
  } catch {
    return text;
  }
}

async function callModel(
  model: string,
  messages: { role: string; content: string }[]
): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "MindSync AI",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 1500,
      temperature: 0.75,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const e = new Error(data?.error?.message || `HTTP ${res.status}`) as Error & { status: number };
    e.status = res.status;
    throw e;
  }

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Бос жауап");
  return text;
}

export async function sendMessage(
  userMessage: string,
  history: ChatMessage[] = []
): Promise<string> {
  const lang = detectLanguage(userMessage);
  console.log(`🌐 Тіл: ${lang}`);

  // Қазақша → орысшаға аудар, AI орысша жауап берсін (сапа жоғары)
  let queryMessage = userMessage;
  if (lang === "kk") {
    queryMessage = await translate(userMessage, "kk", "ru");
    console.log(`📝 ҚАЗ→РУС: ${queryMessage}`);
  }

  const systemPrompt = lang === "en"
    ? `You are MindSync AI — a smart, creative assistant.
Give clear, helpful, engaging answers. Be friendly and concise.
Use numbered lists or bullet points only when it truly helps.
Never mention you're an AI or list rules.`
    : `Ты MindSync AI — умный, творческий помощник.
Давай чёткие, полезные и живые ответы. Будь дружелюбным и лаконичным.
Используй нумерованные списки только когда это реально помогает.
Никогда не упоминай что ты AI и не перечисляй правила.
Отвечай естественно, как умный человек.`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...history.map((m) => {
      // History-дегі қазақша хабарларды орысшаға аудармаймыз — тым баяу
      return { role: m.role as "user" | "assistant", content: m.content };
    }),
    { role: "user" as const, content: queryMessage },
  ];

  let reply = "";

  for (const model of MODELS) {
    try {
      console.log(`🤖 Сынауда: ${model}`);
      reply = await callModel(model, messages);
      console.log(`✅ Жұмыс істеді: ${model}`);
      break;
    } catch (err: unknown) {
      const e = err as Error & { status?: number };
      console.log(`❌ ${model}: ${e.status} — ${e.message}`);
    }
  }

  if (!reply) {
    const fallback = {
      kk: "Кешіріңіз, қазір жауап бере алмаймын. Сәл кейінірек қайталаңыз. 🙏",
      ru: "Извините, сейчас не могу ответить. Попробуйте позже. 🙏",
      en: "Sorry, I can't respond right now. Please try again shortly. 🙏",
    };
    return fallback[lang];
  }

  // Markdown тазарту
  reply = cleanMarkdown(reply);

  // Қазақша болса → Google Translate арқылы аударамыз
  if (lang === "kk") {
    console.log("🔄 РУС→ҚАЗ аударылуда...");
    reply = await translate(reply, "ru", "kk");
    console.log("✅ Аударма дайын");
  }

  return reply;
}
