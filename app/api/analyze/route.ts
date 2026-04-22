import { NextResponse } from "next/server";

/* --------------------------
   TYPES
-------------------------- */

type Persona = "avoidant" | "anxious" | "stable" | "neutral";

type Intent =
  | "seeking_reassurance"
  | "seeking_clarity"
  | "testing_connection"
  | "withdrawal"
  | "neutral";

type Perception =
  | "pressure"
  | "fear_of_loss"
  | "emotional_importance"
  | "low_priority"
  | "neutral";

/* --------------------------
   SAFE HELPERS
-------------------------- */

function clamp(n: number) {
  return Math.max(0, Math.min(100, n));
}

function pickWeighted<T>(items: { value: T; weight: number }[]): T {
  const total = items.reduce((sum, i) => sum + i.weight, 0);
  const rand = Math.random() * total;

  let acc = 0;
  for (const item of items) {
    acc += item.weight;
    if (rand <= acc) return item.value;
  }

  return items[0].value; // fail-safe
}

/* --------------------------
   SIGNAL EXTRACTION
-------------------------- */

function extractSignals(message: string) {
  const m = message.toLowerCase();

  return {
    hasQuestion: m.includes("?"),
    hasWhy: m.includes("why"),
    hasReassurance: /miss|care|love|still|together/.test(m),
    isShort: m.length < 6,
    isDry: /^(ok|k|fine|cool)\.?$/.test(m),
    intensity: Math.min(1, m.length / 120),
  };
}

/* --------------------------
   INTENT ENGINE (UPGRADED)
-------------------------- */

function detectIntent(message: string): Intent {
  const s = extractSignals(message);

  if (s.hasWhy) return "seeking_reassurance";
  if (s.hasReassurance) return "testing_connection";
  if (s.hasQuestion) return "seeking_clarity";
  if (s.isDry || s.isShort) return "withdrawal";

  return "neutral";
}

/* --------------------------
   PERCEPTION ENGINE (NUANCED)
-------------------------- */

function detectPerception(intent: Intent, persona: Persona): Perception {
  switch (persona) {
    case "avoidant":
      if (
        intent === "seeking_reassurance" ||
        intent === "testing_connection"
      )
        return "pressure";
      return "low_priority";

    case "anxious":
      if (intent === "withdrawal") return "fear_of_loss";
      return "emotional_importance";

    case "stable":
      return intent === "withdrawal" ? "neutral" : "emotional_importance";

    default:
      return "neutral";
  }
}

/* --------------------------
   VOLATILITY ENGINE (SMOOTH)
-------------------------- */

function calculateVolatility(intent: Intent, perceived: Perception) {
  let score = 25;

  const intentWeights: Record<Intent, number> = {
    seeking_reassurance: 35,
    testing_connection: 25,
    seeking_clarity: 15,
    withdrawal: 20,
    neutral: 5,
  };

  const perceptionWeights: Record<Perception, number> = {
    pressure: 30,
    fear_of_loss: 25,
    emotional_importance: 15,
    low_priority: 5,
    neutral: 0,
  };

  score += intentWeights[intent] || 0;
  score += perceptionWeights[perceived] || 0;

  return clamp(score);
}

/* --------------------------
   REPLY ENGINE (HUMAN-LIKE)
-------------------------- */

function generateReply(
  message: string,
  persona: Persona,
  volatility: number
) {
  const m = message.toLowerCase();

  /* AVOIDANT */
  if (persona === "avoidant") {
    return pickWeighted([
      { value: "been a bit tied up", weight: 3 },
      { value: "hmm yeah", weight: 2 },
      { value: "not sure yet tbh", weight: 2 },
      { value: "...", weight: volatility > 60 ? 4 : 1 },
      { value: "will get back", weight: 2 },
    ]);
  }

  /* ANXIOUS */
  if (persona === "anxious") {
    return pickWeighted([
      { value: "hey!! sorry 😭", weight: 3 },
      { value: "are you okay??", weight: 3 },
      { value: "I thought something was wrong", weight: 2 },
      { value: "no no I’m here!!", weight: 3 },
      { value: "did I do something?", weight: volatility > 60 ? 4 : 1 },
    ]);
  }

  /* STABLE */
  if (persona === "stable") {
    if (m.includes("why"))
      return "Hey — got pulled into something. What’s going on?";
    if (m.includes("are we"))
      return "Yeah, we’re good. Just sorting a few things.";

    return pickWeighted([
      { value: "Got it 👍", weight: 2 },
      { value: "Makes sense", weight: 2 },
      { value: "Okay, tell me more", weight: 2 },
    ]);
  }

  /* NEUTRAL */
  return "okay";
}

/* --------------------------
   MAIN API HANDLER
-------------------------- */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const message: string = body?.message ?? "";
    const persona: Persona = body?.persona ?? "neutral";

    if (!message.trim()) {
      return NextResponse.json({
        volatilityScore: 0,
        simulatedReply: "",
        intent: {
          actual: "none",
          perceived: "none",
        },
      });
    }

    const actualIntent = detectIntent(message);
    const perceivedIntent = detectPerception(actualIntent, persona);

    const volatilityScore = calculateVolatility(
      actualIntent,
      perceivedIntent
    );

    const simulatedReply = generateReply(
      message,
      persona,
      volatilityScore
    );

    return NextResponse.json({
      volatilityScore,
      simulatedReply,
      intent: {
        actual: actualIntent,
        perceived: perceivedIntent,
      },
    });
  } catch (err) {
    console.error("API ERROR:", err);

    return NextResponse.json({
      volatilityScore: 50,
      simulatedReply: "...",
      intent: {
        actual: "unknown",
        perceived: "unknown",
      },
    });
  }
}