"use client";

import { useState } from "react";
import { DingdingOutlined } from "@ant-design/icons";

/* ---------------- HELPERS ---------------- */

const clamp = (n: number) => Math.max(0, Math.min(100, n));

function getState(v: number) {
    if (v < 40) return "Interest";
    if (v < 70) return "Uncertainty";
    return "Withdrawal";
}

function predict(messages: any[]) {
    if (messages.length < 2) return null;

    const last = messages.at(-1).volatility;
    const prev = messages.at(-2).volatility;
    const trend = last - prev;

    if (trend > 15) return "Escalating → likely Withdrawal";
    if (trend < -10) return "Recovering → moving toward Interest";
    return "Stable but fragile";
}

function intervention(state: string) {
    if (state === "Withdrawal") {
        return {
            action: "Reduce pressure",
            suggestion: "Pause. Don’t push.",
            message: "All good — no rush.",
        };
    }

    if (state === "Uncertainty") {
        return {
            action: "Stabilize",
            suggestion: "Reduce ambiguity",
            message: "Just checking in — no pressure.",
        };
    }

    return {
        action: "Maintain balance",
        suggestion: "Stay natural",
        message: "Sounds good :)",
    };
}

/* ---------------- MISINTERPRETATION ---------------- */

function distortMeaning(message: string, trust: number, mood: number) {
    let actual = "neutral";
    let perceived = "neutral";
    let distortion = 0;

    const m = message.toLowerCase();

    if (m.includes("why")) actual = "seeking reassurance";
    else if (m.includes("are we")) actual = "seeking clarity";
    else if (m === "ok") actual = "withdrawal signal";

    if (trust < 30) {
        perceived = "criticism";
        distortion += 40;
    } else if (mood < 30) {
        perceived = "pressure";
        distortion += 25;
    } else {
        perceived = actual;
    }

    return { actual, perceived, distortion };
}

/* ---------------- PERSONA ENGINE ---------------- */

function generateReply(input: string, persona: string, engagement: number) {
    const m = input.toLowerCase();

    if (persona === "avoidant") {
        if (engagement < 30) return "...";
        const r = ["busy", "hmm", "will see", "later"];
        return r[Math.floor(Math.random() * r.length)];
    }

    if (persona === "anxious") {
        const r = [
            "hey!! sorry 😅",
            "are you okay??",
            "I thought something was wrong",
            "no no I’m here",
        ];
        return r[Math.floor(Math.random() * r.length)];
    }

    if (persona === "stable") {
        if (m.includes("why")) return "Hey — got caught up. What’s up?";
        if (m.includes("are we")) return "Yeah, still on. Will confirm.";
        return "Got it.";
    }

    return "okay";
}

/* ---------------- PATTERN ---------------- */

function detectPattern(messages: any[]) {
    if (messages.length < 4) return null;

    const avg =
        messages.reduce((s, m) => s + m.volatility, 0) / messages.length;

    if (avg > 70) return "Pattern: You escalate pressure";
    if (avg < 40) return "Pattern: You stay low-pressure";

    return "Pattern: Mixed interaction behavior";
}

/* ---------------- COMPONENT ---------------- */

export default function SimulationPage() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<any[]>([]);
    const [persona, setPersona] = useState("neutral");
    const [typing, setTyping] = useState(false);
    const [ghosted, setGhosted] = useState(false);

    const [runCount, setRunCount] = useState(0);
    const [saved, setSaved] = useState<any[]>([]);

    const [userState, setUserState] = useState({
        clarity: 70,
        pressure: 30,
        stability: 70,
    });

    const [otherState, setOtherState] = useState({
        engagement: 60,
        mood: 60,
        trust: 60,
    });

    const [perception, setPerception] = useState<any>(null);

    /* ---------------- SEND ---------------- */

    const sendMessage = () => {
        if (!input.trim()) return;

        setRunCount((c) => c + 1);

        const perceptionData = distortMeaning(
            input,
            otherState.trust,
            otherState.mood
        );

        setPerception(perceptionData);

        let volatility = Math.random() * 60 + 20;
        volatility += perceptionData.distortion;
        volatility = Math.min(95, volatility);

        const userMsg = {
            role: "user",
            text: input,
            volatility,
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setGhosted(false);

        /* STATE UPDATE */
        setUserState((p) => ({
            clarity: clamp(p.clarity - volatility * 0.05),
            pressure: clamp(p.pressure + volatility * 0.04),
            stability: clamp(p.stability - volatility * 0.05),
        }));

        setOtherState((p) => ({
            engagement: clamp(p.engagement - volatility * 0.04),
            mood: clamp(p.mood - volatility * 0.03),
            trust: clamp(p.trust - volatility * 0.05),
        }));

        /* TIMING */
        let delay = 1000;
        if (persona === "avoidant") delay = 2500;
        if (persona === "anxious") delay = 400;

        /* GHOSTING */
        const ghostChance =
            persona === "avoidant" ? 0.4 : persona === "neutral" ? 0.15 : 0.05;

        if (Math.random() < ghostChance) {
            setTyping(true);
            setTimeout(() => {
                setTyping(false);
                setGhosted(true);
            }, delay);
            return;
        }

        setTyping(true);

        setTimeout(() => {
            const reply = generateReply(
                input,
                persona,
                otherState.engagement
            );

            setMessages((prev) => [
                ...prev,
                {
                    role: "other",
                    text: reply,
                    volatility: Math.max(10, volatility - 10),
                },
            ]);

            setTyping(false);
        }, delay);
    };

    /* ---------------- SYSTEM ---------------- */

    const lastVol = messages.at(-1)?.volatility || 0;
    const state = getState(lastVol);
    const pred = predict(messages);
    const action = intervention(state);
    const pattern = detectPattern(messages);

    /* ---------------- UI ---------------- */

    const Bar = ({ label, value, color }: any) => (
        <div>
            <div className="flex justify-between text-xs text-neutral-500">
                <span>{label}</span>
                <span>{Math.round(value)}</span>
            </div>
            <div className="h-[2px] bg-neutral-800">
                <div className={color} style={{ width: `${value}%`, height: "100%" }} />
            </div>
        </div>
    );

    return (
        <main className="bg-[#0A0A0A] text-[#EDEDED] min-h-screen px-6">

            {/* HEADER */}
            <section className="py-10 max-w-3xl mx-auto flex items-center justify-between">

                {/* LEFT: LOGO */}
                <div className="flex items-center gap-3">
                    <DingdingOutlined />
                    <div className="text-xs text-neutral-500 uppercase">
                        Wingit
                    </div>
                </div>

                {/* RIGHT: NAV */}
                <div className="flex items-center gap-4 text-xs">

                    <button
                        onClick={() => (window.location.href = "/")}
                        className="text-neutral-500 hover:text-neutral-300 transition"
                    >
                        ← Home
                    </button>

                    <button
                        onClick={() => (window.location.href = "/lab")}
                        className="border border-neutral-700 px-3 py-1 hover:bg-neutral-900 transition"
                    >
                        Enter Lab
                    </button>

                </div>

            </section>

            {/* PERSONA */}
            <section className="max-w-3xl mx-auto flex gap-2 mb-4 text-xs">
                {["neutral", "avoidant", "anxious", "stable"].map((p) => (
                    <button
                        key={p}
                        onClick={() => setPersona(p)}
                        className={`px-3 py-1 border ${persona === p
                            ? "border-white"
                            : "border-neutral-700 text-neutral-500"
                            }`}
                    >
                        {p}
                    </button>
                ))}
            </section>

            {/* RUN COUNT */}
            <div className="max-w-3xl mx-auto text-xs text-neutral-600 mb-4">
                simulations run: {runCount}
            </div>

            {/* CHAT */}
            <section className="max-w-3xl mx-auto space-y-4">
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`px-4 py-2 text-sm border ${m.role === "user"
                            ? "ml-auto border-neutral-700"
                            : "mr-auto bg-neutral-900/40 border-neutral-800"
                            } max-w-[70%]`}
                    >
                        {m.text}
                    </div>
                ))}

                {typing && <div className="text-xs text-neutral-500">typing…</div>}
                {ghosted && <div className="text-xs text-neutral-600">seen • no reply</div>}
            </section>

            {/* INPUT */}
            <section className="max-w-3xl mx-auto mt-6 flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-transparent border border-neutral-800 p-3 text-sm"
                />
                <button onClick={sendMessage} className="border px-4">
                    Send
                </button>
            </section>

            {/* SYSTEM PANEL */}
            {messages.length > 0 && (
                <section className="max-w-3xl mx-auto py-16 space-y-6 border-t border-neutral-900 mt-12">

                    {/* STATE BAR */}
                    <div>
                        <div className="text-xs text-neutral-500 mb-2">State</div>
                        <div className="relative flex justify-between items-center">
                            <div className="absolute w-full h-px bg-neutral-800" />
                            {["Interest", "Uncertainty", "Withdrawal"].map((s) => (
                                <div key={s} className="flex flex-col items-center z-10">
                                    <div
                                        className={`w-3 h-3 rounded-full ${s === state ? "bg-red-500" : "bg-neutral-700"
                                            }`}
                                    />
                                    <div className="text-xs mt-2 text-neutral-500">{s}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* PREDICTION */}
                    {pred && (
                        <div>
                            <div className="text-xs text-neutral-500">Prediction</div>
                            <div className="text-sm">{pred}</div>
                        </div>
                    )}

                    {/* INTERVENTION */}
                    <div>
                        <div className="text-xs text-neutral-500">Intervention</div>
                        <div className="text-sm">{action.action}</div>
                        <div className="text-xs text-neutral-500">{action.suggestion}</div>
                        <div className="border border-neutral-800 p-3 mt-2 text-sm">
                            {action.message}
                        </div>
                    </div>

                    {/* PERCEPTION */}
                    {perception && (
                        <div className="text-xs text-neutral-400">
                            You meant: {perception.actual} <br />
                            They perceived: {perception.perceived}
                        </div>
                    )}

                    {/* YOUR STATE */}
                    <div>
                        <div className="text-xs text-neutral-500 mb-2">Your State</div>
                        <Bar label="clarity" value={userState.clarity} color="bg-white" />
                        <Bar label="pressure" value={userState.pressure} color="bg-red-500" />
                        <Bar label="stability" value={userState.stability} color="bg-blue-500" />
                    </div>

                    {/* THEIR STATE */}
                    <div>
                        <div className="text-xs text-neutral-500 mb-2">Their State</div>
                        <Bar label="engagement" value={otherState.engagement} color="bg-blue-500" />
                        <Bar label="mood" value={otherState.mood} color="bg-amber-500" />
                        <Bar label="trust" value={otherState.trust} color="bg-green-500" />
                    </div>

                    {/* PATTERN */}
                    {pattern && <div className="text-xs text-amber-400">{pattern}</div>}

                    {/* SAVE */}
                    <button
                        onClick={() => setSaved((prev) => [...prev, messages])}
                        className="text-xs text-neutral-500"
                    >
                        save scenario →
                    </button>

                </section>
            )}
        </main>
    );
}