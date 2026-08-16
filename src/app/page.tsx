import Link from "next/link";
import { RECIPES, formatClock } from "@/lib/recipes";
import Masthead from "@/components/Masthead";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  return (
    <>
      <Masthead />

      <main className="mx-auto w-full max-w-5xl px-5 pb-24 sm:px-8">
        <section className="border-b border-rule py-14 sm:py-20">
          <p className="kicker">Hario Switch</p>
          <h1 className="headline mt-4 text-4xl sm:text-6xl">Choose your recipe</h1>
          <p className="summary mt-5 max-w-xl text-lg">
            Pick a method and the timer walks you through it — every pour, every pause,
            and every flick of the switch, called out as it happens.
          </p>
        </section>

        <section className="py-10 sm:py-14">
          <ul className="grid gap-px bg-rule sm:grid-cols-2">
            {RECIPES.map((recipe) => (
              <li key={recipe.id} className="bg-paper">
                <Link
                  href={`/brew/${recipe.id}`}
                  className="group flex h-full flex-col p-7 transition-colors hover:bg-paper-soft sm:p-9"
                >
                  <p className="meta uppercase tracking-[0.16em]">
                    {recipe.author} · {recipe.level}
                  </p>

                  <h2 className="headline mt-3 text-2xl transition-colors group-hover:text-accent sm:text-3xl">
                    {recipe.name}
                  </h2>

                  <p className="summary mt-4 grow">{recipe.blurb}</p>

                  <dl className="mt-7 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-rule pt-5">
                    <div className="flex items-baseline gap-2">
                      <dt className="sr-only">Brew time</dt>
                      <dd className="tnum headline text-xl">
                        {formatClock(recipe.totalSeconds)}
                      </dd>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <dd className="tnum headline text-xl">{recipe.dose}g</dd>
                      <dt className="meta">coffee</dt>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <dd className="tnum headline text-xl">{recipe.water}g</dd>
                      <dt className="meta">water</dt>
                    </div>
                  </dl>

                  <p className="kicker mt-6 transition-transform group-hover:translate-x-1">
                    Start this brew →
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-rule bg-paper-soft p-7 sm:p-9">
          <h2 className="kicker">Before you pick</h2>
          <p className="summary mt-3 max-w-2xl">
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
