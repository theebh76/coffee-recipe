"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { formatClock, stepAt, type Recipe, type Step } from "@/lib/recipes";
import useBrewTimer from "./useBrewTimer";

export default function BrewFlow({ recipe }: { recipe: Recipe }) {
  const [brewing, setBrewing] = useState(false);
  const timer = useBrewTimer(recipe.totalSeconds);

  const start = useCallback(() => {
    timer.reset();
    timer.play();
    setBrewing(true);
  }, [timer]);

  const backToPrep = useCallback(() => {
    timer.reset();
    setBrewing(false);
  }, [timer]);

  if (!brewing) return <Prep recipe={recipe} onStart={start} />;
  // The finish screen is derived from the clock rather than tracked separately,
  // so there is never a frame where the timer has run out but the UI hasn't.
  if (timer.finished) return <Done recipe={recipe} onAgain={start} onPrep={backToPrep} />;
  return <Brewing recipe={recipe} timer={timer} onAbort={backToPrep} />;
}

/* ------------------------------------------------------------------ prep */

function Prep({ recipe, onStart }: { recipe: Recipe; onStart: () => void }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-24 sm:px-8">
      <div className="border-b border-rule py-10 sm:py-14">
        <Link href="/" className="kicker inline-block hover:text-ink">
          ← All recipes
        </Link>
        <p className="meta mt-8 uppercase tracking-[0.16em]">Get ready to brew</p>
        <h1 className="headline mt-3 text-3xl sm:text-5xl">{recipe.name}</h1>
        <p className="meta mt-3 uppercase tracking-[0.16em]">
          {recipe.author} · {recipe.level}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-px border-b border-rule bg-rule sm:grid-cols-4">
        <Spec value={`${recipe.dose}g`} label="Coffee" note={recipe.grind} />
        <Spec value={`${recipe.water}g`} label="Water" note="Total, including bloom" />
        <Spec value={`${recipe.tempC}°`} label="Temp" note="Starting temperature" />
        <Spec
          value={formatClock(recipe.totalSeconds)}
          label="Time"
          note="Total brew length"
        />
      </dl>

      <section className="py-10">
        <h2 className="kicker">Before you start</h2>
        <ol className="mt-6 space-y-5">
          {recipe.prep.map((line, i) => (
            <li key={i} className="flex gap-4">
              <span className="tnum headline mt-0.5 w-6 shrink-0 text-lg text-accent">
                {i + 1}
              </span>
              <span className="summary">{line}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="flex flex-col items-start gap-6 border-t border-rule py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="kicker">Start position</p>
          <p className="headline mt-2 text-2xl">
            Switch <SwitchWord position={recipe.startSwitch} />
          </p>
        </div>
        <button type="button" onClick={onStart} className="btn btn-primary w-full sm:w-auto">
          Start brewing
        </button>
      </div>
    </div>
  );
}

function windowLabel(kind: Step["kind"], seconds: number): string {
  if (kind === "cool") return `${seconds}s of cooling time left`;
  if (kind === "drawdown") return `flip it within ${seconds}s`;
  return `${seconds}s of pour window left`;
}

function Spec({ value, label, note }: { value: string; label: string; note: string }) {
  return (
    <div className="bg-paper p-5">
      <p className="tnum headline text-3xl">{value}</p>
      <p className="kicker mt-1.5">{label}</p>
      <p className="meta mt-2 leading-snug">{note}</p>
    </div>
  );
}

function SwitchWord({ position }: { position: "open" | "closed" }) {
  return (
    <span className={position === "open" ? "text-steep" : "text-accent"}>
      {position === "open" ? "open" : "closed"}
    </span>
  );
}

/* --------------------------------------------------------------- brewing */

function Brewing({
  recipe,
  timer,
  onAbort,
}: {
  recipe: Recipe;
  timer: ReturnType<typeof useBrewTimer>;
  onAbort: () => void;
}) {
  const { elapsed, running, play, pause } = timer;
  const { index, step, next, into, active, activeRemaining, untilNext } = stepAt(
    recipe,
    elapsed,
  );

  const showTitle = active ? step.title : (step.holdTitle ?? step.title);
  const showInstruction = active
    ? step.instruction
    : (step.holdInstruction ?? step.instruction);
  const showTarget = active
    ? step.target
    : step.holdTitle
      ? `${Math.ceil(untilNext)}s`
      : step.target;

  const stepSpan = (next ? next.at : recipe.totalSeconds) - step.at;
  const stepProgress = stepSpan > 0 ? Math.min(1, into / stepSpan) : 1;

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-24 sm:px-8">
      <div className="flex items-baseline justify-between gap-4 border-b border-rule py-6">
        <p className="headline text-lg sm:text-xl">{recipe.name}</p>
        <button type="button" onClick={onAbort} className="meta uppercase hover:text-accent">
          End brew
        </button>
      </div>

      <p className="kicker mt-10">
        Step {index + 1} of {recipe.steps.length}
      </p>

      {/* the big call-out */}
      <div className="mt-6 min-h-[15rem] border-b border-rule pb-10">
        <p className="meta uppercase tracking-[0.2em]">{showTitle}</p>

        {showTarget ? (
          <p
            className={`tnum headline mt-2 text-7xl sm:text-8xl ${
              active ? "text-accent" : "text-ink"
            }`}
          >
            {showTarget}
          </p>
        ) : null}

        <p className="summary mt-5 max-w-xl text-lg">{showInstruction}</p>

        {step.caution ? (
          <p className="kicker mt-4">⚠ {step.caution}</p>
        ) : null}

        {active && step.activeSeconds ? (
          <p className="meta tnum mt-4 uppercase">
            {windowLabel(step.kind, Math.ceil(activeRemaining))}
          </p>
        ) : null}

        {/* per-step progress */}
        <div className="mt-7 h-px w-full bg-rule">
          <div
            className="h-px bg-accent transition-[width] duration-200 ease-linear"
            style={{ width: `${stepProgress * 100}%` }}
          />
        </div>
      </div>

      {/* switch state */}
      {step.switchTo ? (
        <div className="flex items-center gap-3 border-b border-rule py-5">
          <span className="meta uppercase tracking-[0.18em]">Switch</span>
          <span
            className={`kicker ${
              step.switchTo === "open" ? "text-steep" : "text-accent"
            }`}
          >
            {step.switchTo}
          </span>
        </div>
      ) : null}

      {/* clock */}
      <div className="flex items-end justify-between gap-6 py-8">
        <div>
          <p className="kicker">Elapsed</p>
          <p className="tnum headline mt-1 text-5xl sm:text-6xl">
            {formatClock(elapsed)}
          </p>
        </div>
        <p className="tnum meta pb-2 text-base">
          of {formatClock(recipe.totalSeconds)}
        </p>
      </div>

      <div className="h-1 w-full bg-rule">
        <div
          className="h-1 bg-ink transition-[width] duration-200 ease-linear"
          style={{ width: `${Math.min(100, (elapsed / recipe.totalSeconds) * 100)}%` }}
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={running ? pause : play}
          className="btn btn-primary grow sm:grow-0"
        >
          {running ? "Pause" : "Resume"}
        </button>
        {next ? (
          <button
            type="button"
            onClick={() => timer.seek(next.at)}
            className="btn btn-ghost grow sm:grow-0"
          >
            Skip step
          </button>
        ) : null}
      </div>

      {/* what's coming */}
      {next ? (
        <div className="mt-10 border-t border-rule pt-6">
          <p className="kicker">
            Next in <span className="tnum">{Math.ceil(untilNext)}s</span>
          </p>
          <p className="summary mt-2">{next.instruction}</p>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ done */

function Done({
  recipe,
  onAgain,
  onPrep,
}: {
  recipe: Recipe;
  onAgain: () => void;
  onPrep: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-24 sm:px-8">
      <div className="border-b border-rule py-14 sm:py-20">
        <p className="kicker">Brew complete</p>
        <h1 className="headline mt-4 text-4xl sm:text-6xl">
          {formatClock(recipe.totalSeconds)}. Pour it out.
        </h1>
        <p className="summary mt-5 max-w-xl text-lg">
          Lift the dripper off, give the carafe a swirl to even out the layers, and
          serve. If it tasted thin, grind a touch finer next time; if it tasted harsh,
          go coarser.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 py-8">
        <button type="button" onClick={onAgain} className="btn btn-primary">
          Brew it again
        </button>
        <button type="button" onClick={onPrep} className="btn btn-ghost">
          Back to prep
        </button>
        <Link href="/" className="btn btn-ghost">
          All recipes
        </Link>
      </div>
    </div>
  );
}
