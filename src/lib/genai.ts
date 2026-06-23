import { GoogleGenAI } from "@google/genai";

let _ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (_ai) return _ai;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  _ai = new GoogleGenAI({ apiKey });
  return _ai;
}

// ─── Scrape crush's X personality via Exa.ai ──────────────────────
// Returns invalid object if no tweets found, or { tweets: string, name?: string }
async function scrapeCrushData(
  handle: string,
): Promise<{ tweets: string; name?: string } | null> {
  const exaKey = process.env.EXA_API_KEY;
  if (!exaKey) return null;

  try {
    const { default: Exa } = await import("exa-js");
    const exa = new Exa(exaKey);

    // Calculate date 1 year ago
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const startDate = oneYearAgo.toISOString();

    // Search for highly engaged/relevant tweets from this handle
    const result = await exa.search(`tweets from @${handle}`, {
      type: "auto",
      category: "tweet",
      useAutoprompt: true,
      startPublishedDate: startDate,
      numResults: 15,
      contents: {
        text: true,
      },
    });

    if (result.results && result.results.length > 0) {
      // 1. Get the name from the first result if available (Exa often returns author field)
      const firstResult = result.results[0] as any;
      const authorName = firstResult.author || undefined;

      // 2. Filter tweets
      const tweets = result.results
        .map((r: { text?: string }) => r.text || "")
        .filter((t: string) => t.length > 20)
        .slice(0, 10)
        .join("\n---\n");

      if (tweets.length > 50) {
        return { tweets, name: authorName };
      }
    }
  } catch (error) {
    console.error("Exa scrape error:", error);
  }

  return null;
}

// ─── Generate crush message ──────────────────────────────────────
export async function generateCrushMessage(
  crushHandle: string,
): Promise<string> {
  try {
    const ai = getAI();

    // Step 1: Try to scrape data via Exa
    const data = await scrapeCrushData(crushHandle);

    // Determine the name to use (Handle > Display Name because Exa can be flaky)
    const displayName = `@${crushHandle}`;
    const tweets = data?.tweets || "";

    let prompt = "";

    if (tweets) {
      // 🚨 MODE: Telepathic Rizz (Stealth Mode)
      prompt = `
      You are a world-class conversationalist with "Rizz God" levels of wit and internet literacy. You are generating a playful, sliding-into-the-DMs message for a specific user: ${displayName}.

      *** CONTEXT: RAW TWEET DATA (Aesthethic & Obsessions) ***
      The following text is a scrape of their recent tweets. Use this ONLY to understand their personality, obsessions, and "brain rot."
      --------------------------------------------------
      ${tweets}
      --------------------------------------------------

      *** YOUR MISSION ***
      1. ANALYZE their vibe deeply. Are they a chaotic shitposter? A wholesome aesthetic girlie? A tech bro?
      2. CRAFT a text that makes them feel SEEN but not successfully stalked.
      3. **USE THEIR HANDLE (${displayName})** only if it flows well, or no name at all.

      *** THE STRATEGY: "TELEPATHIC RESONANCE" ***
      Your goal is to sound like you just *happen* to be on their wavelength.
      
      1.  **Identify the Hook:** Find the funniest, most specific thing they care about in the data.
      2.  **The Setup:** Make a statement, joke, or "hot take" about that topic that proves you are compatible.
      3.  **The Pivot:** Smoothly transition that topic into a Valentine's Day request.

      *** STRICT GUIDELINES ***
      1.  **NO "STALKER" LANGUAGE:** Strictly FORBIDDEN to use phrases like "I saw your tweet," "I noticed you like," "Your profile says," or "I've been following you."
      2.  **BE FLIRTY & VISUAL:** You MUST include 2-3 emojis that match the context. Make it feel alive and slightly thirsty but respectful.

      *** EXAMPLES OF SUCCESS (Stealth Mode) ***
      * (If they tweet about coffee addiction): "i can’t fix your caffeine dependency but i can buy your next latte. be my valentine? ☕️🥵"
      * (If they tweet about hating cold weather): "i promise to never make you go outside when it's below 50 degrees. be my valentine? ❄️🔥"
      * (If they tweet about Formula 1): "looking for a passenger princess for the f1 season. applications close feb 14. u in? 🏎️🏁"

      *** OUTPUT ***
      Generate ONLY the message text. No explanations.
      LENGTH: STRICTLY under 280 characters. Keep it punchy and concise.
      `;
    } else {
      // 🚨 FALLBACK MODE: We only have the handle.
      prompt = `
      You are the ultimate Rizz Master. Craft a DM sliding pickup line for @${crushHandle}.
      I don't have their tweets, so you need to profile them based on their handle alone.

      YOUR MISSION:
      1. INFER their vibe from their handle: @${crushHandle}.
      2. CRAFT a 1-2 sentence pickup line that is confident, slightly cheeky, and FLIRTY.
      3. END with a confident, playful demand for them to be your Valentine.

      RULES:
      - TONE: Cocky, funny, smooth.
      - FORMAT: First person ("I").
      - LENGTH: Under 280 characters. Keep it short.
      - EMOJIS: MUST use 2-3 flirty/relevant emojis (e.g. 💘, 😏, 🔥, ✨).
      - CALL TO ACTION: Unique "Be my Val?" plea.
      - NO hashtags.

      OUTPUT: Just the message text. No explanations.
      `;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text?.trim();
    if (!text) {
      return getFallbackMessage(crushHandle);
    }
    return text.slice(0, 306);
  } catch (error: any) {
    console.error("GenAI error:", error);
    if (error.status === 429) {
      console.error("⚠️ Rate Limit Hit! (429 Too Many Requests)");
      throw new Error("RATE_LIMIT");
    }
    // Log Exa errors if any
    if (error.message?.includes("Exa")) {
      console.error("⚠️ Exa API Error:", error.message);
    }
    return getFallbackMessage(crushHandle);
  }
}

function getFallbackMessage(crushHandle: string): string {
  const fallbacks = [
    `Hey @${crushHandle}, the algorithm says we'd be a perfect match. Be my Valentine and let's prove it right? 💘🔥`,
    `@${crushHandle} I'm not saying it's destiny, but my horoscope, my fortune cookie, AND my AI wingman all agree — be my Val? 😏💫`,
    `Dear @${crushHandle}, this is your official Valentine's invitation to the best date of your life. Say yes? 💖🥂`,
    `@${crushHandle} They say you miss 100% of the shots you don't take. So here I am — will you be my Valentine? 🏀💘`,
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

export async function generateAcceptanceMessage(
  crushHandle: string,
): Promise<string> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a short, excited first-person one-liner from someone who just said YES to being @${crushHandle}'s Valentine. It should be high energy.
      
      Examples:
      - "I just said YES! 💘 Best decision of 2024!"
      - "It's official. I'm yours. 💍✨"
      
      Output JUST the text.`,
    });

    const text = response.text?.trim();
    if (!text) return getAcceptanceFallback();
    return text;
  } catch {
    return getAcceptanceFallback();
  }
}

function getAcceptanceFallback(): string {
  const fallbacks = [
    "I just said YES! 💘 Let's make this Valentine's unforgettable!",
    "You asked, I said YES! 🎉 Best decision I've made today 💖",
    "Consider me officially yours this Valentine's! 💘✨",
    "YES YES YES! 💖 Now let's plan the best Val's day ever!",
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}
