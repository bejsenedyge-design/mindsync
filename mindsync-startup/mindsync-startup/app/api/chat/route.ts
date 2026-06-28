import { NextRequest, NextResponse } from "next/server";
import { sendMessage, ChatMessage } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    console.log("📨 Келген хабар:", message);
    console.log("🔑 API Key бар ма:", !!process.env.OPENROUTER_API_KEY);

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Хабарлама бос болмауы керек" },
        { status: 400 }
      );
    }

    const chatHistory: ChatMessage[] = (history || []).map(
      (msg: { role: string; content: string }) => ({
        role: (msg.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
        content: msg.content,
      })
    );

    const reply = await sendMessage(message, chatHistory);

    return NextResponse.json({
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("❌ Қате:", err.message);
    return NextResponse.json(
      { error: err.message || "Сервер қатесі" },
      { status: 500 }
    );
  }
}
