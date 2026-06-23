import { NextRequest, NextResponse } from "next/server";
import { generateCrushMessage } from "@/lib/genai";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { crushHandle, senderWhatsApp } = await request.json();

    if (!crushHandle || !senderWhatsApp) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get authenticated user from session
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("rizz_session")?.value;

    // Fetch sender user ID if authenticated
    let senderUserId: string | null = null;
    if (sessionId) {
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("id", sessionId)
        .single();
      senderUserId = user?.id || null;
    }

    // Clean the crush handle (remove @ if present)
    const cleanHandle = crushHandle.replace(/^@/, "");

    // Generate AI message
    let aiMessage;
    try {
      aiMessage = await generateCrushMessage(cleanHandle);
    } catch (err: any) {
      if (err.message === "RATE_LIMIT") {
        return NextResponse.json(
          { error: "Too many requests. Please wait a minute! 🌶️" },
          { status: 429 }
        );
      }
      throw err;
    }

    // Generate unique link ID
    const linkId = uuidv4().slice(0, 8);

    // Store in Supabase (with sender_user_id if authenticated)
    const { error } = await supabase.from("requests").insert({
      id: linkId,
      sender_whatsapp: senderWhatsApp,
      crush_x_handle: cleanHandle,
      ai_message: aiMessage,
      status: "pending",
      sender_user_id: senderUserId,
    });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({
        linkId,
        aiMessage,
        crushHandle: cleanHandle,
        demo: true,
      });
    }

    return NextResponse.json({
      linkId,
      aiMessage,
      crushHandle: cleanHandle,
    });
  } catch (err) {
    console.error("Generate API error:", err);
    const linkId = uuidv4().slice(0, 8);
    const fallbackMessage =
      "Hey, the algorithm says we'd be a perfect match. Will you say yes? 💘";
    return NextResponse.json({
      linkId,
      aiMessage: fallbackMessage,
      crushHandle: "crush",
      demo: true,
    });
  }
}
