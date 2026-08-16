"use client";

/**
 * The brew dial — two concentric rings around the current call-to-action.
 *
 *  - The outer hairline ring fills up across the whole brew, so you can see at
 *    a glance how far through you are.
 *  - The inner heavy ring *depletes* through the current step. Emptying reads
 *    as urgency in a way that filling does not, which is what you want when
 *    the ring is telling you to stop pouring.
 *
 * The ring goes red while you are actively doing something (pouring, cooling)
 * and settles to ink while you are just waiting. In the last five seconds of
 * any step it pulses.
 */

const SIZE = 240;
const CENTER = SIZE / 2;

const STEP_R = 96;
const STEP_C = 2 * Math.PI * STEP_R;

const TOTAL_R = 112;
const TOTAL_C = 2 * Math.PI * TOTAL_R;

type Props = {
  /** 0–1 through the current step. */
  stepProgress: number;
  /** 0–1 through the whole brew. */
  totalProgress: number;
  /** Big value in the middle, e.g. "60g" or "12s". */
  value: string;
  /** Small label above the value. */
  label: string;
  /** Small line under the value. */
  caption?: string;
  /** Red treatment: you should be doing something right now. */
  urgent: boolean;
  /** Pulse: the step is about to change. */
  imminent: boolean;
};

export default function BrewDial({
  stepProgress,
  totalProgress,
  value,
  label,
  caption,
  urgent,
  imminent,
}: Props) {
  const stroke = urgent ? "var(--accent)" : "var(--ink)";

  return (
    <div className="relative mx-auto aspect-square w-[min(56vw,14rem)]">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-full w-full -rotate-90"
        aria-hidden="true"
      >
        {/* whole-brew track + fill */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={TOTAL_R}
          fill="none"
          stroke="var(--rule)"
          strokeWidth={2}
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={TOTAL_R}
          fill="none"
          stroke="var(--ink-soft)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={TOTAL_C}
          strokeDashoffset={TOTAL_C * (1 - clamp(totalProgress))}
        />

        {/* current-step track + depleting arc */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={STEP_R}
          fill="none"
          stroke="var(--paper-deep)"
          strokeWidth={14}
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={STEP_R}
          fill="none"
          stroke={stroke}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={STEP_C}
          strokeDashoffset={STEP_C * clamp(stepProgress)}
          className={imminent ? "pulse" : undefined}
        />
      </svg>

      {/* The readout sits inside the rings. The inset keeps it clear of the
          heavy stroke — the rings are 14 units wide on a 240 viewBox. */}
      <div className="absolute inset-[20%] flex flex-col items-center justify-center text-center">
        <p className="meta text-xs uppercase tracking-[0.16em]">{label}</p>
        <p
          className={`tnum headline text-5xl leading-none sm:text-6xl ${
            urgent ? "text-accent" : "text-ink"
          }`}
        >
          {value}
        </p>
        {caption ? <p className="meta tnum text-xs">{caption}</p> : null}
      </div>
    </div>
  );
}

function clamp(n: number) {
  return Math.max(0, Math.min(1, n));
}
