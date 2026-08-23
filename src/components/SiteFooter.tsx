export default function SiteFooter() {
  return (
    <footer className="border-t border-rule">
      <div className="mx-auto w-full max-w-5xl px-5 py-5 sm:px-8">
        <p className="summary max-w-2xl text-xs sm:text-sm">
          Coffee Recipe is a personal brewing companion — a small set of well-tested
          recipes with a timer that keeps the pace for you. Recipes are credited to
          the brewers who developed them.
        </p>
        <p className="meta mt-2 text-xs">© {new Date().getFullYear()} Coffee Recipe</p>
      </div>
    </footer>
  );
}
