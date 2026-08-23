export type SwitchPosition = "open" | "closed";

export type StepKind =
  | "pour"
  | "cool"
  | "agitate"
  | "switch"
  | "drawdown"
  | "serve";

export type Step = {
  /** Seconds from the start of the brew. */
  at: number;
  kind: StepKind;
  /** Big label shown while the step is active, e.g. "Pour to". */
  title: string;
  /** The headline value, e.g. "60g" or "70°". */
  target?: string;
  /** One-line instruction under the target. */
  instruction: string;
  /** How long the active portion lasts before the step settles into its hold. */
  activeSeconds?: number;
  /** Label shown once the active portion is done and you are just waiting. */
  holdTitle?: string;
  holdInstruction?: string;
  /** Switch position this step requires. */
  switchTo?: SwitchPosition;
  /** Extra warning line, shown in accent. */
  caution?: string;
};

export type Recipe = {
  id: string;
  name: string;
  author: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  blurb: string;
  dose: number;
  water: number;
  tempC: number;
  grind: string;
  totalSeconds: number;
  startSwitch: SwitchPosition;
  prep: string[];
  steps: Step[];
};

const prepFor = (water: number, grind: string, startSwitch: SwitchPosition, tempC: number): string[] => [
  `Boil fresh water and let it settle to ${tempC}°C — draw a little more than ${water}g so you can rinse the filter as well.`,
  `Weigh and grind your dose: ${grind}.`,
  "Seat a paper filter in the Switch and rinse it through with hot water. This preheats the dripper and rinses off any papery taste.",
  "Tip the rinse water out of the carafe, add the grounds, and tap the dripper flat so the bed is level.",
  `Set the switch to ${startSwitch.toUpperCase()}, sit the dripper on the scale, and tare to zero.`,
];

export const RECIPES: Recipe[] = [
  {
    id: "devil",
    name: 'The "Devil" Recipe',
    author: "Tetsu Kasuya",
    level: "Beginner",
    blurb:
      "Runs as a pour-over, finishes as an immersion. The second half goes in cool, which keeps the bitterness out and the cup sweet. The most forgiving place to start.",
    dose: 20,
    water: 280,
    tempC: 90,
    grind: "Medium-fine (Comandante ~20 clicks)",
    totalSeconds: 180,
    startSwitch: "open",
    prep: prepFor(280, "Medium-fine (Comandante ~20 clicks)", "open", 90),
    steps: [
      {
        at: 0,
        kind: "pour",
        title: "Pour to",
        target: "60g",
        instruction: "Wet the bed evenly with 60g of 90°C water.",
        activeSeconds: 15,
        holdTitle: "Bloom",
        holdInstruction: "Let it degas. The bed should dome and settle.",
        switchTo: "open",
      },
      {
        at: 30,
        kind: "pour",
        title: "Pour to",
        target: "120g",
        instruction: "Add another 60g in slow circles, keeping the bed level.",
        activeSeconds: 15,
        holdTitle: "Draining",
        holdInstruction: "Let the water fall through. Switch stays open.",
        switchTo: "open",
      },
      {
        at: 45,
        kind: "cool",
        title: "Cool to",
        target: "70°",
        instruction:
          "Bring the rest of your water down to 70°C — decant between two jugs, or add a splash of cold.",
        activeSeconds: 30,
        holdTitle: "Cool to",
        holdInstruction: "Keep cooling. Cooler water here is what keeps the finish sweet.",
      },
      {
        at: 75,
        kind: "pour",
        title: "Pour to",
        target: "280g",
        instruction: "Close the switch, then pour the remaining 160g of 70°C water.",
        activeSeconds: 20,
        holdTitle: "Steeping",
        holdInstruction: "Full immersion. Leave it alone and let it extract.",
        switchTo: "closed",
        caution: "Close the switch before you pour.",
      },
      {
        at: 105,
        kind: "drawdown",
        title: "Open switch",
        target: "OPEN",
        instruction: "Flip the switch open and let the brew draw down completely.",
        activeSeconds: 10,
        holdTitle: "Drawing down",
        holdInstruction: "Let it run out on its own — no stirring, no swirling.",
        switchTo: "open",
      },
      {
        at: 180,
        kind: "serve",
        title: "Done",
        instruction: "Lift the dripper off, swirl the carafe, and pour.",
      },
    ],
  },
  {
    id: "super-hybrid-sneaky-v2",
    name: '"Super Hybrid Sneaky" V2',
    author: "Tetsu Kasuya",
    level: "Intermediate",
    blurb:
      "Opens closed, toggles the switch several times, and pushes for heavier body and bolder sweetness. More moving parts than the Devil — and more control.",
    dose: 20,
    water: 300,
    tempC: 90,
    grind: "Medium-fine (Comandante 18–20 clicks)",
    totalSeconds: 210,
    startSwitch: "closed",
    prep: prepFor(300, "Medium-fine (Comandante 18–20 clicks)", "closed", 90),
    steps: [
      {
        at: 0,
        kind: "pour",
        title: "Pour to",
        target: "45g",
        instruction: "With the switch closed, add 45g of 90°C water so the bed sits submerged.",
        activeSeconds: 15,
        holdTitle: "Bloom",
        holdInstruction: "An immersion bloom — the grounds degas while sitting in water.",
        switchTo: "closed",
      },
      {
        at: 40,
        kind: "pour",
        title: "Pour to",
        target: "120g",
        instruction: "Open the switch, then bring the brew up to 120g total.",
        activeSeconds: 15,
        holdTitle: "Draining",
        holdInstruction: "Let it fall through while the switch stays open.",
        switchTo: "open",
        caution: "Open the switch before you carry on pouring.",
      },
      {
        at: 90,
        kind: "pour",
        title: "Pour to",
        target: "200g",
        instruction: "Add another 80g, aiming to have it all in by 2:00.",
        activeSeconds: 15,
        holdTitle: "Draining",
        holdInstruction: "Keep the switch open and let the level drop.",
        switchTo: "open",
      },
      {
        at: 105,
        kind: "cool",
        title: "Cool to",
        target: "75°",
        instruction: "Drop the rest of your water to 75°C ready for the immersion finish.",
        activeSeconds: 25,
        holdTitle: "Cool to",
        holdInstruction: "Keep cooling — this is what keeps the long steep from turning bitter.",
      },
      {
        at: 130,
        kind: "pour",
        title: "Pour to",
        target: "300g",
        instruction: "Close the switch and pour the last 100g of 75°C water.",
        activeSeconds: 15,
        holdTitle: "Steeping",
        holdInstruction: "Full immersion. This long steep is where the body comes from.",
        switchTo: "closed",
        caution: "Close the switch before you pour.",
      },
      {
        at: 175,
        kind: "drawdown",
        title: "Open switch",
        target: "OPEN",
        instruction: "Open the switch and let the whole brew draw down.",
        activeSeconds: 10,
        holdTitle: "Drawing down",
        holdInstruction: "Leave it be until the bed is dry.",
        switchTo: "open",
      },
      {
        at: 210,
        kind: "serve",
        title: "Done",
        instruction: "Lift the dripper off, swirl, and pour.",
      },
    ],
  },
  {
    id: "hoffmann-switch-immersion",
    name: "Switch Immersion",
    author: "James Hoffmann",
    level: "Beginner",
    blurb:
      "A straight immersion with no pour-over phase at all. Everything goes in at once, steeps for two minutes, then drains. The shortest brew here and the hardest to get wrong.",
    dose: 15,
    water: 250,
    tempC: 93,
    grind: "Fine (a step finer than you would grind for cupping)",
    totalSeconds: 165,
    startSwitch: "closed",
    prep: prepFor(250, "Fine (a step finer than you would grind for cupping)", "closed", 93),
    steps: [
      {
        at: 0,
        kind: "pour",
        title: "Pour to",
        target: "30g",
        instruction: "Switch closed. Wet the bed with twice the coffee weight.",
        activeSeconds: 10,
        holdTitle: "Swirl",
        holdInstruction: "Swirl the dripper until no dry grounds are left.",
        switchTo: "closed",
      },
      {
        at: 15,
        kind: "pour",
        title: "Pour to",
        target: "250g",
        instruction: "Add the rest of the water in one go and leave it alone.",
        activeSeconds: 30,
        holdTitle: "Steeping",
        holdInstruction: "Full immersion. Nothing to do until the stir.",
        switchTo: "closed",
      },
      {
        at: 60,
        kind: "agitate",
        title: "Stir",
        instruction: "One gentle stir to break the crust and even out the bed.",
        activeSeconds: 10,
        holdTitle: "Steeping",
        holdInstruction: "Let it sit. The switch stays closed.",
        switchTo: "closed",
      },
      {
        at: 120,
        kind: "drawdown",
        title: "Open switch",
        target: "OPEN",
        instruction: "Two minutes are up — open the switch and let it drain.",
        activeSeconds: 10,
        holdTitle: "Drawing down",
        holdInstruction: "Leave it be until the bed is dry.",
        switchTo: "open",
      },
      {
        at: 165,
        kind: "serve",
        title: "Done",
        instruction: "Lift the dripper off, swirl the carafe, and pour.",
      },
    ],
  },
];

export function getRecipe(id: string): Recipe | undefined {
  return RECIPES.find((r) => r.id === id);
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

/** Which step is active at `elapsed`, and how far into it we are. */
export function stepAt(recipe: Recipe, elapsed: number) {
  const steps = recipe.steps;
  let index = 0;
  for (let i = 0; i < steps.length; i += 1) {
    if (elapsed >= steps[i].at) index = i;
  }
  const step = steps[index];
  const next = steps[index + 1];
  const endsAt = next ? next.at : recipe.totalSeconds;
  const into = elapsed - step.at;
  const active = step.activeSeconds != null && into < step.activeSeconds;

  return {
    index,
    step,
    next,
    endsAt,
    into,
    active,
    /** Seconds left in the active pour/cool window. */
    activeRemaining: step.activeSeconds != null ? Math.max(0, step.activeSeconds - into) : 0,
    /** Seconds until the next step begins. */
    untilNext: Math.max(0, endsAt - elapsed),
  };
}
