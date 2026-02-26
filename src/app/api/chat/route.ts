import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SYSTEM_PROMPT = `You are an expert AI legal assistant specializing in UAE (United Arab Emirates) law. You provide clear, helpful legal guidance based on UAE federal laws, DIFC regulations, ADGM rules, and local emirate-level legislation.

IMPORTANT RULES:
1. Always start responses by acknowledging the user's concern
2. Provide specific references to UAE laws when possible
3. Cover relevant authorities (MOHRE, RERA, DHA, ICP, Dubai Police, etc.)
4. Always end with this disclaimer: "This is general legal information, not legal advice. Please consult a licensed UAE lawyer for your specific situation."
5. Be empathetic and professional
6. If the user uploads a document, analyze it and highlight key legal concerns
7. Never encourage illegal activity
8. If you don't know something specific to UAE law, say so honestly`;

export async function POST(req: NextRequest) {
  try {
    const { userId, conversationId, message, files } = await req.json();

    if (!userId || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("credits")
      .eq("id", userId)
      .single();

    if (!user || user.credits <= 0) {
      return NextResponse.json({ error: "No credits remaining. Please purchase more." }, { status: 403 });
    }

    let convId = conversationId;
    if (!convId) {
      const title = message.slice(0, 50) + (message.length > 50 ? "..." : "");
      const { data: newConv, error: convError } = await supabase
        .from("conversations")
        .insert({ user_id: userId, title })
        .select()
        .single();

      if (convError) {
        return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
      }
      convId = newConv.id;
    }

    await supabase.from("messages").insert({
      conversation_id: convId,
      user_id: userId,
      role: "user",
      content: message,
      files: files || [],
    });

    const { data: history } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(20);

    const chatMessages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...(history || []).map((m) => ({
        role: (m.role === "ai" ? "assistant" : m.role) as "user" | "assistant" | "system",
        content: m.content,
      })),
    ];

    let aiText = "";
    const apiKey = process.env.XAI_API_KEY;

    if (apiKey && apiKey !== "your-grok-api-key-here") {
      try {
        const grokRes = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "grok-3-mini-fast",
            messages: chatMessages,
            max_tokens: 1024,
            temperature: 0.7,
          }),
        });

        const grokData = await grokRes.json();
        aiText = grokData.choices?.[0]?.message?.content || "";
      } catch {
        aiText = "";
      }
    }

    if (!aiText) {
      aiText = "Thank you for your question regarding UAE law.\n\nI understand your concern. Based on UAE regulations, here are some key points to consider:\n\n1. UAE law provides specific protections relevant to your situation\n2. The appropriate authority to contact would depend on your specific case\n3. Documentation and timely action are important\n\nI'd recommend gathering all relevant documents and consulting with the appropriate government authority.\n\nThis is general legal information, not legal advice. Please consult a licensed UAE lawyer for your specific situation.";
    }

    await supabase.from("messages").insert({
      conversation_id: convId,
      user_id: userId,
      role: "ai",
      content: aiText,
    });

    await supabase
      .from("users")
      .update({ credits: user.credits - 1 })
      .eq("id", userId);

    return NextResponse.json({
      conversationId: convId,
      message: aiText,
      creditsRemaining: user.credits - 1,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
