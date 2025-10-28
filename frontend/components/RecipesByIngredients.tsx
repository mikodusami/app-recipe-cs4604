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
  const [minMatchPercentage, setMinMatchPercentage] = useState(0);

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

  const getMatchColor = (percentage: number): string => {
    if (percentage >= 90)
      return "text-orange-600 bg-orange-50 border-orange-200";
    if (percentage >= 70)
      return "text-orange-500 bg-orange-50 border-orange-200";
    if (percentage >= 50) return "text-muted-foreground bg-muted border-border";
    return "text-muted-foreground bg-muted border-border";
  };

  const getMatchLabel = (percentage: number): string => {
    if (percentage >= 90) return "Excellent Match";
    if (percentage >= 70) return "Good Match";
    if (percentage >= 50) return "Partial Match";
    return "Low Match";
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

  // Filter recipes by minimum match percentage
  const filteredRecipes = recipeMatches.filter(
    (match) => match.match_percentage >= minMatchPercentage
  );

  if (selectedIngredients.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="text-foreground font-bold text-2xl mb-4">
          FIND RECIPES
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          Find Recipes by Ingredients
        </h3>
        <p className="text-muted-foreground">
          Select ingredients above to discover recipes you can make
        </p>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Recipe Suggestions
          </h2>
          <p className="text-sm text-muted-foreground">
            Based on your {selectedIngredients.length} selected ingredients
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Minimum Match Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Min Match:
            </label>
            <select
              value={minMatchPercentage}
              onChange={(e) => setMinMatchPercentage(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value={0}>Any</option>
              <option value={25}>25%+</option>
              <option value={50}>50%+</option>
              <option value={75}>75%+</option>
              <option value={90}>90%+</option>
            </select>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="match">Match %</option>
              <option value="popularity">Popularity</option>
              <option value="cook_time">Cook Time</option>
              <option value="prep_time">Prep Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="text-orange-500 font-bold text-2xl mb-4">
            SEARCHING...
          </div>
          <p className="text-muted-foreground">Finding recipes...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            <span className="text-red-700 font-medium">Error</span>
          </div>
          <p className="text-red-600 mt-1">
            {typeof error === "string"
              ? error
              : "An error occurred while searching for recipes"}
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={searchRecipesByIngredients}
            className="mt-3"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        <>
          {/* Results Summary */}
          <div className="mb-4 text-sm text-gray-600">
            Found {filteredRecipes.length} recipes
            {minMatchPercentage > 0 && ` with ${minMatchPercentage}%+ match`}
          </div>

          {/* Recipe Cards */}
          {filteredRecipes.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRecipes.map((match) => (
                <div
                  key={match.recipe.id}
                  className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {/* Recipe Header */}
                  <div className="mb-3">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-card-foreground line-clamp-2">
                        {match.recipe.name}
                      </h3>
                      <div
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium border ml-2 shrink-0",
                          getMatchColor(match.match_percentage)
                        )}
                      >
                        {Math.round(match.match_percentage)}%
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {match.recipe.category && (
                        <span className="px-2 py-1 bg-muted rounded">
                          {match.recipe.category}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <span className="text-orange-500 font-bold text-xs">
                          PREP
                        </span>
                        {formatTime(match.recipe.prep_time_in_minutes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-orange-500 font-bold text-xs">
                          COOK
                        </span>
                        {formatTime(match.recipe.cook_time_in_minutes)}
                      </span>
                    </div>
                  </div>

                  {/* Match Status */}
                  <div className="mb-3">
                    <div className="text-xs font-medium text-foreground mb-1">
                      {getMatchLabel(match.match_percentage)}
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all",
                          match.match_percentage >= 70
                            ? "bg-orange-500"
                            : "bg-muted-foreground"
                        )}
                        style={{ width: `${match.match_percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Available Ingredients */}
                  {match.available_ingredients.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-orange-600 mb-1">
                        HAVE ({match.available_ingredients.length}):
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {match.available_ingredients.slice(0, 3).join(", ")}
                        {match.available_ingredients.length > 3 &&
                          ` +${match.available_ingredients.length - 3} more`}
                      </div>
                    </div>
                  )}

                  {/* Missing Ingredients */}
                  {match.missing_ingredients.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        NEED ({match.missing_ingredients.length}):
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {match.missing_ingredients.slice(0, 3).join(", ")}
                        {match.missing_ingredients.length > 3 &&
                          ` +${match.missing_ingredients.length - 3} more`}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onRecipeSelect?.(match.recipe)}
                    className="w-full"
                  >
                    View Recipe
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            /* No Results */
            <div className="text-center py-12">
              <div className="text-muted-foreground font-bold text-2xl mb-4">
                NO RECIPES
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No recipes found
              </h3>
              <p className="text-muted-foreground mb-4">
                {minMatchPercentage > 0
                  ? `Try lowering the minimum match percentage or selecting different ingredients.`
                  : `We couldn't find any recipes with your selected ingredients. Try adding more common ingredients.`}
              </p>
              {minMatchPercentage > 0 && (
                <Button
                  variant="secondary"
                  onClick={() => setMinMatchPercentage(0)}
                >
                  Show All Matches
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
