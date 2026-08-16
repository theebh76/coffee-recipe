import Link from "next/link";

export default function Masthead() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex w-full max-w-5xl items-baseline justify-between gap-4 px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="masthead-title text-2xl sm:text-3xl">Coffee Recipe</span>
        </Link>
        <span className="meta hidden uppercase tracking-[0.18em] sm:inline">
          Brewing guides &amp; timer
        </span>
      </div>
    </header>
  );
}
