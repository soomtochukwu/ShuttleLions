import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { linkId, status } = await request.json();

    if (!linkId || !status) {
      return NextResponse.json(
        { error: "Missing linkId or status" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("requests")
      .update({ status })
      .eq("id", linkId);

    if (error) {
      console.error("Supabase error:", error);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Respond API error:", err);
    return NextResponse.json(
      { error: "Failed to update response" },
      { status: 500 }
    );
  }
}
