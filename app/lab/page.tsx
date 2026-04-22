"use client";

import { useState } from "react";

/* --------------------------
   INTENT ENGINE
-------------------------- */
function detectIntent(message: string) {
    const lower = message.toLowerCase();

    if (lower.includes("end") || lower.includes("not working")) {
        return "termination";
    }

    if (lower.includes("why") || lower.includes("never")) {
        return "pressure";
    }

    if (lower.includes("whatever") || lower.includes("fine")) {
        return "frustration";
    }

    return "neutral";
}

/* --------------------------
   STABILIZER (INTENT SHIFT)
-------------------------- */
function stabilizeMessage(message: string) {
    const intent = detectIntent(message);

    if (intent === "termination") {
        return "I've been feeling some distance lately. Maybe we should talk about where this is going.";
    }

    if (intent === "pressure") {
        return "Just checking in — no pressure.";
    }

    if (intent === "frustration") {
        return "All good. Let's catch up later.";
    }

    return message + " — no rush";
}

/* --------------------------
   BRANCHING (STRATEGIC)
-------------------------- */
function branchMessages(message: string) {
    const intent = detectIntent(message);

    if (intent === "termination") {
        return [
            message,
            "I've been feeling some distance lately. Maybe we should talk.",
            "I’m not sure where this is going anymore—what do you think?",
            "Feels like something’s off between us. Want to talk?",
            "All good. Take care."
        ];
    }

    if (intent === "pressure") {
        return [
            message,
            "Just checking in — no pressure.",
            "Hey, wanted to see how you've been",
            "All good, no rush at all",
            "Catch up when you're free"
        ];
    }

    return [
        message,
        "Hey, just checking in 🙂",
        "Hey — no rush",
        "Wanted to see how you’ve been",
        "All good, catch up later"
    ];
}

/* --------------------------
   COMPONENT
-------------------------- */
export default function LabPage() {
    const [input, setInput] = useState("");
    const [results, setResults] = useState<any>(null);
    const [runCount, setRunCount] = useState(0);
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(false);

    const runSimulation = async () => {
        if (!input.trim()) return;

        setLoading(true);
        setRunCount((c) => c + 1);

        const stabilized = stabilizeMessage(input);
        const branches = branchMessages(input);

        // original
        const res1 = await fetch("/api/analyze", {
            method: "POST",
            body: JSON.stringify({ message: input, persona: "neutral" }),
        });
        const original = await res1.json();

        // stabilized
        const res2 = await fetch("/api/analyze", {
            method: "POST",
            body: JSON.stringify({ message: stabilized, persona: "neutral" }),
        });
        const stable = await res2.json();

        // branches
        const branchResults = await Promise.all(
            branches.map(async (msg) => {
                const r = await fetch("/api/analyze", {
                    method: "POST",
                    body: JSON.stringify({ message: msg, persona: "neutral" }),
                });
                return r.json();
            })
        );

        /* --------------------------
           FIND BEST VERSION
        -------------------------- */
        const all = [
            { msg: input, score: original.volatilityScore },
            { msg: stabilized, score: stable.volatilityScore },
            ...branches.map((b, i) => ({
                msg: b,
                score: branchResults[i].volatilityScore,
            })),
        ];

        const best = all.reduce((a, b) =>
            a.score < b.score ? a : b
        );

        const delta = original.volatilityScore - best.score;

        // streak logic
        if (delta > 15) {
            setStreak((s) => s + 1);
        } else {
            setStreak(0);
        }

        setResults({
            original,
            stable,
            stabilized,
            branches,
            branchResults,
            best,
            delta,
        });

        setLoading(false);
    };

    return (
        <main className="bg-[#0A0A0A] text-[#EDEDED] min-h-screen px-6">

            {/* HEADER */}
            <section className="max-w-3xl mx-auto py-10 space-y-8">

                {/* NAV */}
                <div className="flex items-center justify-between text-xs">

                    <button
                        onClick={() => (window.location.href = "/")}
                        className="text-neutral-500 hover:text-neutral-300 transition"
                    >
                        ← Home
                    </button>

                    <div className="text-neutral-600 uppercase tracking-wider">
                        Interaction Lab
                    </div>

                    <button
                        onClick={() => (window.location.href = "/simulation")}
                        className="border border-neutral-700 px-3 py-1 hover:bg-neutral-900 transition"
                    >
                        Restart
                    </button>

                </div>

                {/* HEADLINE */}
                <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-medium tracking-tight">
                        Optimize before you send
                    </h1>

                    <p className="text-sm text-neutral-500">
                        Observe how your message shifts the interaction.
                    </p>
                </div>

                {/* SESSION STATS */}
                <div className="flex items-center gap-6 text-xs text-neutral-600 border-t border-neutral-900 pt-4">

                    <div>
                        runs: <span className="text-neutral-300">{runCount}</span>
                    </div>

                    <div>
                        streak: <span className="text-neutral-300">{streak}</span>
                    </div>

                </div>

            </section>

            {/* INPUT */}
            <section className="max-w-3xl mx-auto">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full bg-transparent border border-neutral-800 p-4"
                    placeholder="Type a message..."
                />

                <button
                    onClick={runSimulation}
                    className="mt-4 border px-4 py-2"
                >
                    {loading ? "Running..." : "Simulate"}
                </button>

                {/* Curiosity Loop */}
                {input && (
                    <div className="text-xs text-neutral-500 mt-3 flex gap-4">
                        <button onClick={() => setInput(input + " 🙂")}>
                            softer →
                        </button>
                        <button onClick={() => setInput(input + "??")}>
                            more intense →
                        </button>
                        <button onClick={() => setInput("Hey — no rush")}>
                            reset tone →
                        </button>
                    </div>
                )}
            </section>

            {/* RESULTS */}
            {results && (
                <section className="max-w-3xl mx-auto py-16 space-y-10">

                    {/* DELTA */}
                    <div className="text-sm">
                        {results.delta > 0 ? (
                            <span className="text-green-400">
                                ↓ Reduced collapse by {results.delta}%
                            </span>
                        ) : (
                            <span className="text-neutral-500">
                                No improvement — same interaction pattern
                            </span>
                        )}
                    </div>

                    {/* INSIGHT */}
                    <div className="text-xs text-neutral-500">
                        {results.delta < 5 &&
                            "No meaningful change — intent remains high pressure"}
                        {results.delta > 20 &&
                            "Shift in framing reduced emotional pressure"}
                    </div>

                    {/* BEST VERSION */}
                    <div className="border border-green-500/30 p-4">
                        <div className="text-xs text-neutral-500">
                            Best performing version
                        </div>
                        <div className="mt-1">{results.best.msg}</div>
                        <div className="text-xs mt-2">
                            Collapse: {results.best.score}%
                        </div>

                        <button
                            onClick={() => setInput(results.best.msg)}
                            className="text-xs mt-3 text-green-400"
                        >
                            use this →
                        </button>
                    </div>

                    {/* PARALLEL */}
                    <div className="space-y-4">
                        <div className="text-xs text-neutral-500 uppercase">
                            Parallel Comparison
                        </div>

                        <div className="border p-4">
                            <div className="text-xs text-neutral-500">Original</div>
                            <div>{input}</div>
                            <div className="text-xs mt-2">
                                {results.original.volatilityScore}%
                            </div>
                        </div>

                        <div className="border p-4 bg-neutral-900/40">
                            <div className="text-xs text-neutral-500">
                                Lower volatility version
                            </div>
                            <div>{results.stabilized}</div>
                            <div className="text-xs mt-2">
                                {results.stable.volatilityScore}%
                            </div>
                        </div>
                    </div>

                    {/* BRANCHING */}
                    <div className="space-y-4">
                        <div className="text-xs text-neutral-500 uppercase">
                            Alternate Strategies
                        </div>

                        {results.branches.map((msg: string, i: number) => (
                            <div key={i} className="border p-4">
                                <div>{msg}</div>
                                <div className="text-xs mt-2">
                                    {results.branchResults[i].volatilityScore}%
                                </div>

                                <button
                                    onClick={() => setInput(msg)}
                                    className="text-xs mt-2 text-neutral-400"
                                >
                                    try this →
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* EMOTIONAL FEEDBACK */}
                    <div className="text-xs text-neutral-400">
                        {results.original.volatilityScore > 70 &&
                            "High pressure → likely withdrawal"}
                        {results.original.volatilityScore < 40 &&
                            "Low pressure → stable interaction"}
                    </div>

                </section>
            )}

        </main>
    );
}