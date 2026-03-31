export default function FrameworkPage() {
  return (
    <main className="bg-[#0A0A0A] text-[#EDEDED] min-h-screen">

      {/* HERO */}
      <section className="px-6 py-32">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-xs uppercase tracking-widest text-neutral-500">
            Wingit Framework
          </div>

          <h1 className="text-4xl md:text-5xl font-medium tracking-tight">
            A system for understanding how meaning behaves in interaction.
          </h1>

          <p className="text-sm md:text-base text-neutral-400">
            Messages don’t carry meaning.<br />
            Interpretation does.
          </p>
        </div>
      </section>

      {/* CORE PREMISE */}
      <section className="px-6 py-24 border-t border-neutral-900">
        <div className="max-w-2xl mx-auto space-y-6 text-center">
          <p className="text-xl md:text-2xl">
            Every interaction has two layers:
          </p>

          <p className="text-neutral-300">
            What is said<br />
            What is inferred
          </p>

          <p className="text-neutral-400 text-sm">
            Breakdowns don’t happen in language.<br />
            They happen in interpretation.
          </p>
        </div>
      </section>

      {/* CONCEPT 1 */}
      <section className="px-6 py-24 border-t border-neutral-900">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-xs uppercase tracking-widest text-neutral-500">
            01 — Interaction Volatility
          </div>

          <h2 className="text-xl md:text-2xl">
            The likelihood that a message destabilizes the interaction.
          </h2>

          <p className="text-sm text-neutral-400">
            Not all messages shift a conversation equally.<br />
            Some introduce tension. Others amplify it.
          </p>

          {/* Visual line */}
          <div className="h-px bg-gradient-to-r from-neutral-700 via-red-500 to-neutral-700 mt-6" />
        </div>
      </section>

      {/* CONCEPT 2 */}
      <section className="px-6 py-24 border-t border-neutral-900">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-xs uppercase tracking-widest text-neutral-500">
            02 — Meaning Drift
          </div>

          <h2 className="text-xl md:text-2xl">
            How meaning changes over time, without new input.
          </h2>

          <p className="text-sm text-neutral-400">
            Messages don’t stay fixed.<br />
            Delay reshapes them. Silence distorts them.
          </p>

          {/* Drift visual */}
          <div className="mt-6 space-y-2 text-sm">
            <div className="text-neutral-300">"Let’s see." → neutral</div>
            <div className="text-neutral-400">"Let’s see." → avoidance</div>
            <div className="text-neutral-500">"Let’s see." → rejection</div>
          </div>
        </div>
      </section>

      {/* CONCEPT 3 */}
      <section className="px-6 py-24 border-t border-neutral-900">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-xs uppercase tracking-widest text-neutral-500">
            03 — Perceived Intent Gap
          </div>

          <h2 className="text-xl md:text-2xl">
            The distance between intended meaning and perceived intent.
          </h2>

          <p className="text-sm text-neutral-400">
            People don’t react to words.<br />
            They react to what they believe those words imply.
          </p>

          {/* Split visual */}
          <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
            <div>
              <div className="text-neutral-500 mb-2">You meant:</div>
              <div className="text-neutral-300">Giving space</div>
            </div>
            <div>
              <div className="text-neutral-500 mb-2">They perceived:</div>
              <div className="text-neutral-300">Losing interest</div>
            </div>
          </div>
        </div>
      </section>

      {/* SYSTEM MODEL */}
      <section className="px-6 py-32 border-t border-neutral-900">
        <div className="max-w-2xl mx-auto space-y-8 text-center">

          <p className="text-xl md:text-2xl">
            These are not separate effects.
          </p>

          <p className="text-neutral-400 text-sm">
            They compound.
          </p>

          <div className="flex flex-col items-center space-y-4 text-sm text-neutral-400 mt-8">
            <div>Volatility introduces instability</div>
            <div>↓</div>
            <div>Drift reshapes meaning</div>
            <div>↓</div>
            <div>Intent gap creates misalignment</div>
            <div>↓</div>
            <div className="text-neutral-300">Interaction breaks</div>
          </div>
        </div>
      </section>

      {/* EXAMPLE */}
      <section className="px-6 py-32 border-t border-neutral-900">
        <div className="max-w-2xl mx-auto space-y-8">

          <div className="text-xs uppercase tracking-widest text-neutral-500">
            Example Breakdown
          </div>

          <div className="text-lg text-neutral-200">
            "So I guess you're busy now."
          </div>

          <div className="space-y-6 text-sm">

            <div>
              <div className="text-neutral-500">Volatility</div>
              <div className="text-neutral-300">
                High — introduces pressure and implied accusation
              </div>
            </div>

            <div>
              <div className="text-neutral-500">Drift</div>
              <div className="text-neutral-300">
                Increases over time if unanswered
              </div>
            </div>

            <div>
              <div className="text-neutral-500">Intent Gap</div>
              <div className="text-neutral-300">
                Intended: casual check-in<br />
                Perceived: emotional pressure
              </div>
            </div>

          </div>

          <p className="text-neutral-400 text-sm mt-6">
            The message is simple.<br />
            Its effect is not.
          </p>
        </div>
      </section>

      {/* CLOSING */}
      <section className="px-6 py-32 border-t border-neutral-900 text-center">
        <div className="max-w-2xl mx-auto space-y-6 text-sm text-neutral-400">
          <p>
            Wingit does not optimize communication.
          </p>
          <p className="text-neutral-300">
            It reveals what communication actually does.
          </p>

          <p className="text-xs text-neutral-500 mt-6">
            This framework is evolving.
          </p>
        </div>
      </section>

    </main>
  );
}