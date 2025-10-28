import { RecipePageClient } from "./RecipePageClient";

// Generate static params for static export
export async function generateStaticParams() {
  // For static export, we'll generate a few sample recipe IDs
  // In a real app, you'd fetch all recipe IDs from your API
  return [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }, { id: "5" }];
}

interface RecipePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;
  return <RecipePageClient recipeId={id} />;
}
