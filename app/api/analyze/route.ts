import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { message } = await req.json();

  // Simple heuristic logic (replace later with AI)
  const volatilityScore = Math.min(95, Math.max(20, message.length * 2));

  // Simulated interpretation
  const intent = {
    actual: "Casual check-in",
    perceived:
      volatilityScore > 70
        ? "Emotional pressure"
        : volatilityScore > 40
          ? "Mild expectation"
          : "Neutral"
  };

  // Simulated response (multi-person simulation)
  const simulatedReply =
    volatilityScore > 75
      ? "Yeah... just been busy."
      : volatilityScore > 50
        ? "Hey, sorry, been caught up. What’s up?"
        : "Hey! Yeah I’m around :)";

  return NextResponse.json({
    volatilityScore,
    meaning: "Underlying expectation detected.",
    responsePattern: "Likely delay or softened response.",
    alternative: "No rush at all—just checking in.",
    intent,
    simulatedReply
  });
}