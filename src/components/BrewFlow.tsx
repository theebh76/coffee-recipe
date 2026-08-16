"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { formatClock, stepAt, type Recipe } from "@/lib/recipes";
import useBrewTimer from "./useBrewTimer";
import BrewDial from "./BrewDial";

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
  const stepSpan = (next ? next.at : recipe.totalSeconds) - step.at;
  const stepProgress = stepSpan > 0 ? Math.min(1, into / stepSpan) : 1;

  // What the dial reads: the pour target while you're pouring, otherwise the
  // countdown to the next step.
  const dialValue = active
    ? (step.target ?? `${Math.ceil(activeRemaining)}s`)
    : (step.holdTitle ? `${Math.ceil(untilNext)}s` : (step.target ?? `${Math.ceil(untilNext)}s`));
  // Kept short — it has to sit inside the ring without touching the stroke.
  const dialCaption =
    active && step.activeSeconds
      ? `${Math.ceil(activeRemaining)}s left`
      : `${formatClock(elapsed)} / ${formatClock(recipe.totalSeconds)}`;

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-24 sm:px-8">
      <div className="flex items-baseline justify-between gap-4 border-b border-rule py-6">
        <p className="headline text-xl sm:text-2xl">{recipe.name}</p>
        <button
          type="button"
          onClick={onAbort}
          /* -my-3 py-3 keeps a 44px tap target without adding visual height */
          className="meta -my-3 shrink-0 py-3 uppercase hover:text-accent"
        >
          End brew
        </button>
      </div>

      <p className="kicker mt-8 text-center">
        Step {index + 1} of {recipe.steps.length}
      </p>

      {/* the dial */}
      <div className="mt-6">
        <BrewDial
          stepProgress={stepProgress}
          totalProgress={elapsed / recipe.totalSeconds}
          value={dialValue}
          label={showTitle}
          caption={dialCaption}
          urgent={active}
          imminent={untilNext <= 5}
        />
      </div>

      {/* what to do */}
      <div className="mt-8 border-b border-rule pb-8 text-center">
        <p className="summary mx-auto max-w-xl text-ink">{showInstruction}</p>

        {step.caution ? <p className="kicker mt-4">⚠ {step.caution}</p> : null}

        {/* switch state */}
        {step.switchTo ? (
          <p className="mt-6 flex items-center justify-center gap-3">
            <span className="meta uppercase tracking-[0.18em]">Switch</span>
            <span
              className={`kicker text-base ${
                step.switchTo === "open" ? "text-steep" : "text-accent"
              }`}
            >
              {step.switchTo}
            </span>
          </p>
        ) : null}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
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
        <div className="mt-10 border-t border-rule pt-6 text-center">
          <p className="kicker">
            Next in <span className="tnum">{Math.ceil(untilNext)}s</span>
          </p>
          <p className="summary mx-auto mt-2 max-w-xl">{next.instruction}</p>
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
