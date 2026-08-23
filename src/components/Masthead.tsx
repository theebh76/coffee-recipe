import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Masthead() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-3 sm:px-8 sm:py-4">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="masthead-title text-xl sm:text-3xl">Coffee Recipe</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="meta hidden text-sm uppercase tracking-[0.18em] sm:inline">
            Brewing guides &amp; timer
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
