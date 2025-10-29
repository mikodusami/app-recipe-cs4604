"use client";

import React, { useState, useEffect } from "react";
import { recipeService, RecipeMatch, Recipe } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { SelectedIngredient } from "./IngredientInput";

interface RecipesByIngredientsProps {
  selectedIngredients: SelectedIngredient[];
  onRecipeSelect?: (recipe: Recipe) => void;
  className?: string;
}

type SortOption = "match" | "popularity" | "cook_time" | "prep_time";

export function RecipesByIngredients({
  selectedIngredients,
  onRecipeSelect,
  className,
}: RecipesByIngredientsProps) {
  const [recipeMatches, setRecipeMatches] = useState<RecipeMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("match");

  // Search for recipes when ingredients change
  useEffect(() => {
    if (selectedIngredients.length > 0) {
      searchRecipesByIngredients();
    } else {
      setRecipeMatches([]);
      setError(null);
    }
  }, [selectedIngredients]);

  // Sort recipes when sort option changes
  useEffect(() => {
    if (recipeMatches.length > 0) {
      const sorted = [...recipeMatches].sort((a, b) => {
        switch (sortBy) {
          case "match":
            return b.match_percentage - a.match_percentage;
          case "popularity":
            // For now, use recipe ID as a proxy for popularity (newer recipes)
            return b.recipe.id - a.recipe.id;
          case "cook_time":
            const aCookTime = a.recipe.cook_time_in_minutes || 999;
            const bCookTime = b.recipe.cook_time_in_minutes || 999;
            return aCookTime - bCookTime;
          case "prep_time":
            const aPrepTime = a.recipe.prep_time_in_minutes || 999;
            const bPrepTime = b.recipe.prep_time_in_minutes || 999;
            return aPrepTime - bPrepTime;
          default:
            return 0;
        }
      });
      setRecipeMatches(sorted);
    }
  }, [sortBy]);

  const searchRecipesByIngredients = async () => {
    setLoading(true);
    setError(null);

    try {
      // Filter out ingredients with negative IDs (placeholder ingredients)
      // and only use ingredients with positive IDs (real database ingredients)
      const validIngredients = selectedIngredients.filter((ing) => ing.id > 0);

      if (validIngredients.length === 0) {
        // If no valid ingredients, show a message
        setError(
          "Please search for and select specific ingredients to find recipes. The common ingredients shown are just suggestions - you need to search for them first."
        );
        setRecipeMatches([]);
        setLoading(false);
        return;
      }

      const ingredientIds = validIngredients.map((ing) => ing.id);
      const response = await recipeService.getRecipesByIngredients(
        ingredientIds,
        {
          limit: 50,
        }
      );

      if (response.success && response.data) {
        setRecipeMatches(response.data);
      } else {
        setError(response.error || "Failed to find recipes");
        setRecipeMatches([]);
      }
    } catch (error) {
      console.error("Failed to search recipes by ingredients:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to search recipes. Please try again.";
      setError(errorMessage);
      setRecipeMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes?: number): string => {
    if (!minutes) return "N/A";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  // Just show all recipe matches
  const filteredRecipes = recipeMatches;

  if (selectedIngredients.length === 0) {
    return (
      <div className={cn("text-center py-16", className)}>
        <div className="text-4xl mb-6">🍳</div>
        <div className="font-poppins font-bold text-xl text-[#8B4513] mb-3">
          Ready to Find Recipes?
        </div>
        <h3 className="text-lg font-semibold text-[#121212] mb-2">
          Select ingredients to get started
        </h3>
        <p className="text-[#6B7280] max-w-md mx-auto">
          Choose ingredients from the left panel and we'll show you delicious
          recipes you can make
        </p>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="font-poppins text-2xl font-semibold text-[#121212]">
              Recipe Suggestions
            </h2>
            <p className="text-[#6B7280]">
              Based on your {selectedIngredients.length} selected ingredients
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-[#121212] tracking-wide">
            SORT BY:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 border border-[#E5E5E5] rounded text-sm bg-white"
          >
            <option value="match">Best Match</option>
            <option value="popularity">Popularity</option>
            <option value="cook_time">Cook Time</option>
            <option value="prep_time">Prep Time</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto mb-6"></div>
          <div className="font-poppins font-bold text-xl text-[#8B4513] mb-2">
            Searching Recipes...
          </div>
          <p className="text-[#6B7280]">
            Finding the perfect matches for your ingredients
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-16">
          <div className="text-4xl mb-6">⚠️</div>
          <div className="font-poppins font-bold text-xl text-[#8B4513] mb-3">
            Something went wrong
          </div>
          <p className="text-[#6B7280] mb-6 max-w-md mx-auto">
            {typeof error === "string"
              ? error
              : "An error occurred while searching for recipes"}
          </p>
          <Button variant="primary" onClick={searchRecipesByIngredients}>
            Try Again
          </Button>
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        <>
          {/* Results Summary */}
          <div className="mb-6 text-sm font-medium text-[#6B7280]">
            Found {filteredRecipes.length} related recipes
          </div>

          {/* Recipe Cards */}
          {filteredRecipes.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredRecipes.map((match) => (
                <div
                  key={match.recipe.id}
                  className="card-minimal p-6 hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => onRecipeSelect?.(match.recipe)}
                >
                  {/* Recipe Header */}
                  <div className="mb-4">
                    <h3 className="font-poppins font-semibold text-lg text-[#121212] line-clamp-2 mb-3">
                      {match.recipe.name}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-[#6B7280]">
                      {match.recipe.category && (
                        <span className="px-2 py-1 bg-[#F5F5F5] rounded">
                          {match.recipe.category}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <span className="text-[#8B4513] font-bold text-xs">
                          PREP
                        </span>
                        {formatTime(match.recipe.prep_time_in_minutes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-[#8B4513] font-bold text-xs">
                          COOK
                        </span>
                        {formatTime(match.recipe.cook_time_in_minutes)}
                      </span>
                    </div>
                  </div>

                  {/* Available Ingredients */}
                  {match.available_ingredients.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-semibold text-[#8B4513] mb-1 tracking-wide">
                        YOU HAVE ({match.available_ingredients.length}):
                      </div>
                      <div className="text-xs text-[#6B7280]">
                        {match.available_ingredients.slice(0, 3).join(", ")}
                        {match.available_ingredients.length > 3 &&
                          ` +${match.available_ingredients.length - 3} more`}
                      </div>
                    </div>
                  )}

                  {/* Missing Ingredients */}
                  {match.missing_ingredients.length > 0 && (
                    <div className="mb-6">
                      <div className="text-xs font-semibold text-[#6B7280] mb-1 tracking-wide">
                        YOU NEED ({match.missing_ingredients.length}):
                      </div>
                      <div className="text-xs text-[#6B7280]">
                        {match.missing_ingredients.slice(0, 3).join(", ")}
                        {match.missing_ingredients.length > 3 &&
                          ` +${match.missing_ingredients.length - 3} more`}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRecipeSelect?.(match.recipe);
                    }}
                    className="w-full"
                  >
                    View Recipe
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            /* No Results */
            <div className="text-center py-16">
              <div className="text-4xl mb-6">🔍</div>
              <div className="font-poppins font-bold text-xl text-[#8B4513] mb-3">
                No Recipes Found
              </div>
              <h3 className="text-lg font-semibold text-[#121212] mb-2">
                No recipes match your ingredients
              </h3>
              <p className="text-[#6B7280] max-w-md mx-auto">
                We couldn't find any recipes with your selected ingredients. Try
                adding more common ingredients or different combinations.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
