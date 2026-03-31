"use client";

import { useState, useMemo } from "react";

export default function TokenWatchPage() {
  const [text, setText] = useState("");
  const [model, setModel] = useState("gpt-4o");

  // Approximation: 1 token ≈ 4 characters
  const inputTokens = useMemo(() => {
    return Math.ceil(text.length / 4);
  }, [text]);

  // Estimated output ratio (safe structured response assumption)
  const outputRatio = 0.7;
  const estimatedOutputTokens = Math.ceil(inputTokens * outputRatio);

  const totalTokens = inputTokens + estimatedOutputTokens;

  // Pricing (example — adjust if needed)
  const pricePer1k =
    model === "gpt-4o" ? 0.01 : 0.005;

  const usdToInr = 83;

  const estimatedUsd = (totalTokens / 1000) * pricePer1k;
  const estimatedInr = estimatedUsd * usdToInr;

  // Context window (example limits)
  const maxTokens =
    model === "gpt-4o" ? 128000 : 128000;

  const usagePercent = Math.min(
    (totalTokens / maxTokens) * 100,
    100
  );

  const remainingTokens = Math.max(
    maxTokens - totalTokens,
    0
  );

  const usageColor =
    usagePercent > 85
      ? "bg-red-500"
      : usagePercent > 65
      ? "bg-yellow-400"
      : "bg-green-500";

  return (
    <div className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Wingit Token Watch
          </h1>
          <p className="text-gray-400 mt-2">
            Input + Output token estimation with context awareness
          </p>
        </div>

        {/* MODEL SELECT */}
        <div className="mb-6">
          <label className="text-sm text-gray-400 block mb-2">
            Model
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 w-full"
          >
            <option value="gpt-4o">gpt-4o</option>
            <option value="gpt-4o-mini">gpt-4o-mini</option>
          </select>
        </div>

        {/* TEXTAREA */}
        <div className="mb-8">
          <label className="text-sm text-gray-400 block mb-2">
            Input Text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your prompt here..."
            className="w-full h-64 bg-zinc-900 border border-zinc-700 rounded-xl p-4 resize-none focus:outline-none focus:border-white"
          />
        </div>

        {/* TOKEN METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">
              Input Tokens
            </p>
            <p className="text-3xl font-semibold mt-2">
              {inputTokens}
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">
              Estimated Output Tokens
            </p>
            <p className="text-3xl font-semibold mt-2">
              {estimatedOutputTokens}
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">
              Total Tokens
            </p>
            <p className="text-3xl font-semibold mt-2">
              {totalTokens}
            </p>
          </div>

        </div>

        {/* COST */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-10">
          <p className="text-gray-400 text-sm">
            Estimated Total Cost (INR)
          </p>
          <p className="text-3xl font-semibold mt-2">
            ₹{estimatedInr.toFixed(4)}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            ≈ ${estimatedUsd.toFixed(6)}
          </p>
        </div>

        {/* CONTEXT VISUALIZATION */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-4">
            Context Window Usage
          </p>

          <div className="w-full bg-neutral-800 rounded-full h-3 mb-3">
            <div
              className={`h-3 rounded-full transition-all ${usageColor}`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>

          <p className="text-sm text-gray-300">
            {totalTokens} / {maxTokens} tokens used
          </p>

          <p className="text-xs text-gray-500 mt-1">
            {usagePercent.toFixed(2)}% used · {remainingTokens} remaining
          </p>
        </div>

      </div>
    </div>
  );
}