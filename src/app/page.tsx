import Link from "next/link";
import { RECIPES, formatClock } from "@/lib/recipes";
import Masthead from "@/components/Masthead";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  return (
    <>
      <Masthead />

      <main className="mx-auto w-full max-w-5xl px-5 pb-8 sm:px-8">
        <section className="border-b border-rule py-5 sm:py-12">
          <p className="kicker text-xs">Hario Switch</p>
          <h1 className="headline mt-1.5 text-2xl sm:text-5xl">Choose your recipe</h1>
          <p className="summary mt-1.5 max-w-xl text-sm sm:text-lg">
            Pick a method and the timer walks you through it — every pour, pause, and
            flick of the switch, called out as it happens.
          </p>
        </section>

        <section className="py-4 sm:py-8">
          <ul className="grid gap-px bg-rule sm:grid-cols-2">
            {RECIPES.map((recipe) => (
              <li key={recipe.id} className="bg-paper">
                <Link
                  href={`/brew/${recipe.id}`}
                  className="group flex h-full flex-col p-4 transition-colors hover:bg-paper-soft sm:p-7"
                >
                  <p className="meta text-xs uppercase tracking-[0.16em]">
                    {recipe.author} · {recipe.level}
                  </p>

                  {/* The arrow rides the heading instead of taking its own row. */}
                  <h2 className="headline mt-1 flex items-baseline gap-2 text-xl transition-colors group-hover:text-accent sm:text-2xl">
                    <span>{recipe.name}</span>
                    <span
                      aria-hidden="true"
                      className="text-accent transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </h2>

                  {/* Clamped on phones so both cards stay near the fold; the
                      full blurb shows once there is room for two columns. */}
                  <p className="summary mt-1.5 line-clamp-2 grow text-sm sm:line-clamp-none sm:text-base">
                    {recipe.blurb}
                  </p>

                  <dl className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-rule pt-2.5">
                    <div className="flex items-baseline gap-1.5">
                      <dt className="sr-only">Brew time</dt>
                      <dd className="tnum headline text-base">
                        {formatClock(recipe.totalSeconds)}
                      </dd>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <dd className="tnum headline text-base">{recipe.dose}g</dd>
                      <dt className="meta text-xs">coffee</dt>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <dd className="tnum headline text-base">{recipe.water}g</dd>
                      <dt className="meta text-xs">water</dt>
                    </div>
                  </dl>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-rule bg-paper-soft p-4 sm:p-7">
          <h2 className="kicker text-xs">Before you pick</h2>
          <p className="summary mt-1.5 max-w-2xl text-sm sm:text-base">
            You will need the Switch itself, a paper filter, a scale that reads to a
            gram, and a kettle. The timer assumes you are pouring onto the scale and
            watching the weight climb, so keep both in view.
          </p>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
