"use client";

import { useState } from "react";

/* --------------------------
   TYPES
-------------------------- */
type Message = {
    role: "user" | "other";
    text: string;
    volatility: number;
};

/* --------------------------
   STATE ENGINE
-------------------------- */
function getState(v: number) {
    if (v < 40) return "Interest";
    if (v < 70) return "Uncertainty";
    return "Withdrawal";
}

/* --------------------------
   PREDICTION ENGINE
-------------------------- */
function predictNextState(messages: Message[]) {
    if (messages.length < 2) return null;

    const last = messages[messages.length - 1].volatility;
    const prev = messages[messages.length - 2].volatility;

    const trend = last - prev;

    if (trend > 15) return "Escalating → likely Withdrawal";
    if (trend < -10) return "Stabilizing → possible Interest";
    return "Stable but fragile";
}

/* --------------------------
   PRESCRIPTIVE ENGINE
-------------------------- */
function getIntervention(state: string) {
    if (state === "Withdrawal") {
        return {
            action: "Reduce pressure",
            suggestion: "Pause. Don’t chase.",
            message: "Hey, no rush. Catch up whenever."
        };
    }

    if (state === "Uncertainty") {
        return {
            action: "Stabilize interaction",
            suggestion: "Lower ambiguity",
            message: "Just checking in—no pressure."
        };
    }

    return {
        action: "Maintain balance",
        suggestion: "Stay natural",
        message: "Sounds good :)"
    };
}

export default function SimulationPage() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const sendMessage = async () => {
        if (!input.trim()) return;

        setLoading(true);

        const res = await fetch("/api/analyze", {
            method: "POST",
            body: JSON.stringify({ message: input }),
        });

        const data = await res.json();

        const userMsg: Message = {
            role: "user",
            text: input,
            volatility: data.volatilityScore,
        };

        const otherMsg: Message = {
            role: "other",
            text: data.simulatedReply,
            volatility: Math.max(20, data.volatilityScore - 10),
        };

        setMessages((prev) => [...prev, userMsg, otherMsg]);
        setResult(data);

        setInput("");
        setLoading(false);
    };

    const currentState =
        messages.length > 0
            ? getState(messages[messages.length - 1].volatility)
            : null;

    const prediction = predictNextState(messages);
    const intervention = currentState ? getIntervention(currentState) : null;

    return (
        <main className="bg-[#0A0A0A] text-[#EDEDED] min-h-screen px-6">

            {/* HEADER */}
            <section className="py-16 max-w-3xl mx-auto flex justify-between items-center">
                <div>
                    <div className="text-xs text-neutral-500 uppercase">
                        Simulation
                    </div>
                    <h1 className="text-2xl font-medium">
                        Interaction Loop
                    </h1>
                </div>

                <a
                    href="/"
                    className="text-xs text-neutral-500 hover:text-neutral-300 transition"
                >
                    ← Back
                </a>
            </section>

            {/* CHAT */}
            <section className="max-w-3xl mx-auto space-y-4">

                {messages.length === 0 && (
                    <div className="text-sm text-neutral-500">
                        Start a conversation. Observe how it evolves.
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`text-sm px-4 py-3 border ${msg.role === "user"
                            ? "border-neutral-700 ml-auto max-w-[70%]"
                            : "border-neutral-800 mr-auto max-w-[70%] bg-neutral-900/40"
                            }`}
                    >
                        {msg.text}

                        <div className="text-xs text-neutral-500 mt-2">
                            volatility: {msg.volatility}
                        </div>
                    </div>
                ))}

            </section>

            {/* INPUT */}
            <section className="max-w-3xl mx-auto mt-8 flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-transparent border border-neutral-800 p-3 text-sm"
                    placeholder="Type next message..."
                />

                <button
                    onClick={sendMessage}
                    className="border border-neutral-700 px-4 text-sm hover:bg-neutral-900 transition"
                >
                    {loading ? "..." : "Send"}
                </button>
            </section>

            {/* SYSTEM PANEL */}
            {result && (
                <section className="max-w-3xl mx-auto py-16 space-y-10 border-t border-neutral-900 mt-16">

                    {/* STATE */}
                    {currentState && (
                        <div>
                            <div className="text-xs text-neutral-500 uppercase">
                                State
                            </div>
                            <div className="text-sm">{currentState}</div>
                        </div>
                    )}

                    {/* PREDICTION */}
                    {prediction && (
                        <div>
                            <div className="text-xs text-neutral-500 uppercase">
                                Prediction
                            </div>
                            <div className="text-sm">{prediction}</div>
                        </div>
                    )}

                    {/* INTERVENTION */}
                    {intervention && (
                        <div>
                            <div className="text-xs text-neutral-500 uppercase">
                                Intervention
                            </div>

                            <div className="text-sm">{intervention.action}</div>

                            <div className="text-xs text-neutral-500 mt-1">
                                {intervention.suggestion}
                            </div>

                            <div className="border border-neutral-800 p-3 mt-3 text-sm">
                                {intervention.message}
                            </div>
                        </div>
                    )}

                </section>
            )}

            {/* FOOTER */}
            <footer className="py-12 text-center text-xs text-neutral-500">
                Wingit — simulation environment
            </footer>

        </main>
    );
}