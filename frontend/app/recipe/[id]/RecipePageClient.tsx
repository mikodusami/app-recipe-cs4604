"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Recipe, recipeService } from "@/lib/api";
import { RecipeDetail } from "@/components/RecipeDetail";

interface RecipePageClientProps {
  recipeId: string;
}

export function RecipePageClient({ recipeId }: RecipePageClientProps) {
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (recipeId) {
      loadRecipe(parseInt(recipeId));
    }
  }, [recipeId]);

  const loadRecipe = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await recipeService.getRecipe(id);
      if (response.success && response.data) {
        setRecipe(response.data);
      } else {
        setError(response.error || "Failed to load recipe");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-orange-500 font-bold text-2xl mb-4">LOADING</div>
          <div className="text-lg text-gray-600">Loading recipe...</div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 font-bold text-2xl mb-4">ERROR</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Recipe Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            {error || "The recipe you're looking for doesn't exist."}
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <RecipeDetail recipe={recipe} onBack={handleBack} />
      </div>
    </div>
  );
}
