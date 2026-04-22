"use client";

import { useState, useEffect } from "react";
import { DingdingOutlined } from "@ant-design/icons";

/* -------------------------- HELPERS -------------------------- */
function clamp(n: number) {
    return Math.max(0, Math.min(100, n));
}

function getCollapse(v: number, e: number) {
    return clamp(Math.round(v * 0.6 + (100 - e) * 0.4));
}

/* --------------------------
   MISINTERPRETATION ENGINE
-------------------------- */
function distortMeaning(message: string, personaState: any) {
    if (!personaState) {
        return {
            actual: "neutral",
            perceived: "neutral",
            distortion: 0,
        };
    }

    const { trust, mood } = personaState;

    let actual = "neutral";
    let perceived = "neutral";
    let distortion = 0;

    const m = message.toLowerCase();

    if (m.includes("why")) actual = "seeking reassurance";
    else if (m.includes("end")) actual = "closure";
    else if (m.includes("hey")) actual = "neutral ping";

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

/* -------------------------- COMPONENT -------------------------- */

export default function SimulationPage() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<any[]>([]);
    const [persona, setPersona] = useState("neutral");

    const [result, setResult] = useState<any>(null);
    const [personaState, setPersonaState] = useState<any>(null);

    const [perception, setPerception] = useState<any>(null);

    const [userState, setUserState] = useState({
        clarity: 70,
        pressure: 30,
        stability: 70,
    });

    const [engagement, setEngagement] = useState(60);

    const [typing, setTyping] = useState(false);
    const [ghosted, setGhosted] = useState(false);

    const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());

    /* --------------------------
       TIME DECAY
    -------------------------- */
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const delta = (now - lastInteractionTime) / 1000;

            if (delta < 5) return;

            if (personaState) {
                setPersonaState((prev: any) => ({
                    ...prev,
                    engagement: clamp(prev.engagement - delta * 0.5),
                    mood: clamp(prev.mood - delta * 0.3),
                    trust: clamp(prev.trust - delta * 0.2),
                }));
            }

            setUserState((prev) => ({
                clarity: clamp(prev.clarity - delta * 0.2),
                pressure: clamp(prev.pressure + delta * 0.3),
                stability: clamp(prev.stability - delta * 0.25),
            }));

            setEngagement((e) => clamp(e - delta * 0.2));
        }, 3000);

        return () => clearInterval(interval);
    }, [lastInteractionTime, personaState]);

    /* --------------------------
       SEND MESSAGE
    -------------------------- */
    const sendMessage = async () => {
        if (!input.trim()) return;

        setLastInteractionTime(Date.now());

        const res = await fetch("/api/analyze", {
            method: "POST",
            body: JSON.stringify({
                message: input,
                persona,
                history: messages,
                personaState,
            }),
        });

        const data = await res.json();

        /* 🔥 PERCEPTION */
        const perceptionData = distortMeaning(input, personaState);
        setPerception(perceptionData);

        /* 🔥 ADJUSTED VOLATILITY */
        let adjustedVolatility =
            data.volatilityScore + perceptionData.distortion;

        adjustedVolatility = Math.min(95, adjustedVolatility);

        setResult(data);
        setPersonaState(data.personaState);

        /* USER STATE */
        setUserState((prev) => ({
            clarity: clamp(prev.clarity - adjustedVolatility * 0.05),
            pressure: clamp(prev.pressure + adjustedVolatility * 0.04),
            stability: clamp(prev.stability - adjustedVolatility * 0.05),
        }));

        const userMsg = {
            role: "user",
            text: input,
            volatility: adjustedVolatility,
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setGhosted(false);

        /* GHOSTING */
        const ghostChance =
            persona === "avoidant" ? 0.35 : persona === "neutral" ? 0.2 : 0.05;

        if (Math.random() < ghostChance) {
            setTyping(true);

            setTimeout(() => {
                setTyping(false);
                setGhosted(true);
            }, 1500 + Math.random() * 3000);

            return;
        }

        /* REPLY */
        setTyping(true);

        setTimeout(() => {
            const otherMsg = {
                role: "other",
                text: data.simulatedReply,
                volatility: Math.max(10, adjustedVolatility - 10),
            };

            setMessages((prev) => [...prev, otherMsg]);
            setTyping(false);
        }, data.delay);
    };

    /* --------------------------
       SYSTEM
    -------------------------- */
    const lastVol =
        messages.length > 0
            ? messages[messages.length - 1].volatility
            : 0;

    const collapse = getCollapse(lastVol, engagement);

    return (
        <main className="bg-[#0A0A0A] text-[#EDEDED] min-h-screen px-6">

            {/* HEADER */}
            <section className="py-12 max-w-3xl mx-auto flex items-center gap-3">
                <DingdingOutlined style={{ fontSize: 22 }} />
                <div>
                    <div className="text-xs text-neutral-500 uppercase">Wingit</div>
                    <h1 className="text-xl">Interaction Field</h1>
                </div>
            </section>

            {/* CHAT */}
            <section className="max-w-3xl mx-auto space-y-4">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`text-sm px-4 py-3 border ${msg.role === "user"
                            ? "ml-auto border-neutral-700 max-w-[70%]"
                            : "mr-auto border-neutral-800 bg-neutral-900/40 max-w-[70%]"
                            }`}
                    >
                        {msg.text}
                    </div>
                ))}

                {typing && (
                    <div className="text-xs text-neutral-500 animate-pulse">
                        typing...
                    </div>
                )}

                {ghosted && (
                    <div className="text-xs text-neutral-600">
                        seen • no reply
                    </div>
                )}
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
            <section className="max-w-3xl mx-auto py-16 space-y-10 border-t border-neutral-900 mt-12">

                {/* PERCEPTION */}
                {perception && (
                    <div className="space-y-2">
                        <div className="text-xs text-neutral-500 uppercase">
                            Meaning Distortion
                        </div>

                        <div className="text-xs text-neutral-400">
                            <div>You meant: {perception.actual}</div>
                            <div>They perceived: {perception.perceived}</div>
                        </div>

                        {perception.distortion > 20 && (
                            <div className="text-xs text-red-400">
                                High misinterpretation detected
                            </div>
                        )}
                    </div>
                )}

                {/* YOUR STATE */}
                <div>
                    <div className="text-xs text-neutral-500 mb-2">Your State</div>
                    {Object.entries(userState).map(([k, v]) => (
                        <div key={k} className="mb-2">
                            <div className="flex justify-between text-xs text-neutral-500">
                                <span>{k}</span>
                                <span>{Math.round(v as number)}</span>
                            </div>
                            <div className="h-[2px] bg-neutral-800">
                                <div
                                    className="h-full bg-white"
                                    style={{ width: `${v}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* THEIR STATE */}
                {personaState && (
                    <div>
                        <div className="text-xs text-neutral-500 mb-2">Their State</div>
                        {Object.entries(personaState).map(([k, v]) => (
                            <div key={k} className="mb-2">
                                <div className="flex justify-between text-xs text-neutral-500">
                                    <span>{k}</span>
                                    <span>{Math.round(v as number)}</span>
                                </div>
                                <div className="h-[2px] bg-neutral-800">
                                    <div
                                        className="h-full bg-blue-500"
                                        style={{ width: `${v}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* COLLAPSE */}
                <div>
                    <div className="text-xs text-neutral-500">
                        Interaction Collapse
                    </div>
                    <div>{collapse}%</div>
                </div>

            </section>
        </main>
    );
}