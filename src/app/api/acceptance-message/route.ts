import { NextRequest, NextResponse } from "next/server";
import { generateAcceptanceMessage } from "@/lib/genai";

export async function POST(request: NextRequest) {
  try {
    const { crushHandle } = await request.json();
    const message = await generateAcceptanceMessage(crushHandle || "someone");
    return NextResponse.json({ message });
  } catch (err) {
    console.error("Acceptance message error:", err);
    return NextResponse.json({
      message: "I just said YES! 💘 Let's make this Valentine's unforgettable!",
    });
  }
}
