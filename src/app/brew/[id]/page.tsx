import { notFound } from "next/navigation";
import { RECIPES, getRecipe } from "@/lib/recipes";
import BrewFlow from "@/components/BrewFlow";
import Masthead from "@/components/Masthead";

export function generateStaticParams() {
  return RECIPES.map((r) => ({ id: r.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = getRecipe(id);
  if (!recipe) return { title: "Recipe not found — Coffee Recipe" };
  return {
    title: `${recipe.name} — Hario Switch guide & timer`,
    description: recipe.blurb,
  };
}

export default async function BrewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = getRecipe(id);
  if (!recipe) notFound();

  return (
    <>
      <Masthead />
      <main>
        <BrewFlow recipe={recipe} />
      </main>
    </>
  );
}
