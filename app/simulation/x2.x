"use client";

import { useState, useEffect } from "react";
import { DingdingOutlined } from "@ant-design/icons";

/* ---------------- HELPERS ---------------- */
const clamp = (n: number) => Math.max(0, Math.min(100, n));

function getCollapse(v: number, e: number) {
    return clamp(Math.round(v * 0.6 + (100 - e) * 0.4));
}

/* ---------------- MISINTERPRETATION ---------------- */
function distortMeaning(message: string, personaState: any) {
    if (!personaState)
        return { actual: "neutral", perceived: "neutral", distortion: 0 };

    const { trust, mood } = personaState;
    let actual = "neutral";
    let perceived = "neutral";
    let distortion = 0;

    const m = message.toLowerCase();

    if (m.includes("why")) actual = "seeking reassurance";
    else if (m.includes("are we")) actual = "seeking clarity";
    else if (m.includes("ok")) actual = "withdrawal";
    else actual = "neutral";

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

/* ---------------- PATTERN ---------------- */
function detectPattern(messages: any[]) {
    if (messages.length < 4) return null;

    const avg =
        messages.reduce((s, m) => s + m.volatility, 0) / messages.length;

    if (avg > 70) return "You tend to escalate pressure";
    if (avg < 40) return "You maintain low-pressure interactions";

    return "Mixed interaction pattern";
}

/* ---------------- COMPONENT ---------------- */

export default function SimulationPage() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<any[]>([]);
    const [persona, setPersona] = useState("neutral");

    const [personaState, setPersonaState] = useState<any>({
        engagement: 60,
        mood: 60,
        trust: 60,
    });

    const [userState, setUserState] = useState({
        clarity: 70,
        pressure: 30,
        stability: 70,
    });

    const [perception, setPerception] = useState<any>(null);

    const [engagement, setEngagement] = useState(60);
    const [typing, setTyping] = useState(false);
    const [ghosted, setGhosted] = useState(false);

    const [runCount, setRunCount] = useState(0);
    const [saved, setSaved] = useState<any[]>([]);

    const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());

    /* ---------------- TIME DECAY ---------------- */
    useEffect(() => {
        const i = setInterval(() => {
            const delta = (Date.now() - lastInteractionTime) / 1000;
            if (delta < 5) return;

            setPersonaState((prev: any) => ({
                engagement: clamp(prev.engagement - delta * 0.4),
                mood: clamp(prev.mood - delta * 0.3),
                trust: clamp(prev.trust - delta * 0.2),
            }));

            setUserState((prev) => ({
                clarity: clamp(prev.clarity - delta * 0.2),
                pressure: clamp(prev.pressure + delta * 0.3),
                stability: clamp(prev.stability - delta * 0.2),
            }));
        }, 3000);

        return () => clearInterval(i);
    }, [lastInteractionTime]);

    /* ---------------- SEND ---------------- */
    const sendMessage = async () => {
        if (!input.trim()) return;

        setRunCount((c) => c + 1);
        setLastInteractionTime(Date.now());

        const res = await fetch("/api/analyze", {
            method: "POST",
            body: JSON.stringify({ message: input, persona }),
        });

        const data = await res.json();

        const perceptionData = distortMeaning(input, personaState);
        setPerception(perceptionData);

        let v = data.volatilityScore + perceptionData.distortion;
        v = Math.min(95, v);

        /* USER STATE */
        setUserState((p) => ({
            clarity: clamp(p.clarity - v * 0.05),
            pressure: clamp(p.pressure + v * 0.04),
            stability: clamp(p.stability - v * 0.05),
        }));

        /* PERSONA STATE */
        setPersonaState((p: any) => ({
            engagement: clamp(p.engagement - v * 0.04),
            mood: clamp(p.mood - v * 0.03),
            trust: clamp(p.trust - v * 0.05),
        }));

        const userMsg = { role: "user", text: input, volatility: v };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setGhosted(false);

        /* GHOSTING */
        const ghostChance =
            persona === "avoidant" ? 0.4 : persona === "neutral" ? 0.2 : 0.05;

        if (Math.random() < ghostChance) {
            setTyping(true);
            setTimeout(() => {
                setTyping(false);
                setGhosted(true);
            }, 1500);
            return;
        }

        /* REPLY */
        setTyping(true);

        setTimeout(() => {
            const reply = data.simulatedReply;

            setMessages((prev) => [
                ...prev,
                {
                    role: "other",
                    text: reply,
                    volatility: Math.max(10, v - 10),
                },
            ]);

            setTyping(false);
        }, data.delay);
    };

    const collapse = getCollapse(
        messages.at(-1)?.volatility || 0,
        personaState.engagement
    );

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
            <section className="py-10 max-w-3xl mx-auto flex items-center gap-3">
                <DingdingOutlined />
                <div className="text-xs text-neutral-500 uppercase">Wingit</div>
            </section>

            {/* PERSONA */}
            <section className="max-w-3xl mx-auto flex gap-2 mb-4 text-xs">
                {["neutral", "avoidant", "anxious"].map((p) => (
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
                {ghosted && <div className="text-xs text-neutral-600">seen. no reply</div>}
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

            {/* SYSTEM */}
            <section className="max-w-3xl mx-auto py-16 space-y-6 border-t border-neutral-900 mt-12">

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
                    <Bar label="engagement" value={personaState.engagement} color="bg-blue-500" />
                    <Bar label="mood" value={personaState.mood} color="bg-amber-500" />
                    <Bar label="trust" value={personaState.trust} color="bg-green-500" />
                </div>

                {/* PATTERN */}
                {pattern && <div className="text-xs text-amber-400">{pattern}</div>}

                {/* COLLAPSE */}
                <div className="text-xs text-red-400">
                    collapse risk: {collapse}%
                </div>

                {/* SAVE */}
                <button
                    onClick={() => setSaved((prev) => [...prev, messages])}
                    className="text-xs text-neutral-500"
                >
                    save scenario →
                </button>

            </section>
        </main>
    );
}