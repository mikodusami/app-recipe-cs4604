"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Recipe, recipeService, RecipeListParams } from "@/lib/api";
import { RecipeCard } from "@/components/RecipeCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface RecipeFiltersState {
  category?: string;
  maxCookTime?: number;
  maxPrepTime?: number;
  ingredients?: string[];
  dietaryRestrictions?: string[];
}

interface RecipeListProps {
  searchParams?: RecipeListParams;
  filters?: RecipeFiltersState;
  onRecipeSelect?: (recipe: Recipe) => void;
  className?: string;
}

const RECIPES_PER_PAGE = 12;

export function RecipeList({
  searchParams = {},
  filters = {},
  onRecipeSelect,
  className,
}: RecipeListProps) {
  const router = useRouter();
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(RECIPES_PER_PAGE);

  // Load all recipes once on component mount
  useEffect(() => {
    loadAllRecipes();
  }, []);

  const loadAllRecipes = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load all recipes at once (with a reasonable limit)
      const response = await recipeService.getRecipes({ limit: 1000 });

      if (response.success && response.data) {
        setAllRecipes(response.data);
      } else {
        setError(response.error || "Failed to load recipes");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering
  const filteredRecipes = useMemo(() => {
    let filtered = [...allRecipes];

    // Apply search filter
    if (searchParams.search) {
      const searchTerm = searchParams.search.toLowerCase();
      filtered = filtered.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(searchTerm) ||
          recipe.category?.toLowerCase().includes(searchTerm) ||
          recipe.ingredients.some((ing) =>
            ing.ingredient_name?.toLowerCase().includes(searchTerm)
          )
      );
    }

    // Apply category filter
    if (filters.category || searchParams.category) {
      const category = filters.category || searchParams.category;
      filtered = filtered.filter((recipe) => recipe.category === category);
    }

    // Apply max cook time filter
    if (filters.maxCookTime) {
      filtered = filtered.filter(
        (recipe) =>
          !recipe.cook_time_in_minutes ||
          recipe.cook_time_in_minutes <= filters.maxCookTime!
      );
    }

    // Apply max prep time filter
    if (filters.maxPrepTime) {
      filtered = filtered.filter(
        (recipe) =>
          !recipe.prep_time_in_minutes ||
          recipe.prep_time_in_minutes <= filters.maxPrepTime!
      );
    }

    // Apply ingredients filter
    if (filters.ingredients && filters.ingredients.length > 0) {
      filtered = filtered.filter((recipe) =>
        filters.ingredients!.some((filterIngredient) =>
          recipe.ingredients.some((recipeIngredient) =>
            recipeIngredient.ingredient_name
              ?.toLowerCase()
              .includes(filterIngredient.toLowerCase())
          )
        )
      );
    }

    // Apply dietary restrictions filter
    if (filters.dietaryRestrictions && filters.dietaryRestrictions.length > 0) {
      filtered = filtered.filter((recipe) => {
        // This is a simple implementation - in a real app, you'd have proper dietary restriction data
        const recipeName = recipe.name.toLowerCase();
        const recipeCategory = recipe.category?.toLowerCase() || "";

        return filters.dietaryRestrictions!.some((restriction) => {
          switch (restriction) {
            case "vegetarian":
              return (
                recipeName.includes("vegetarian") ||
                recipeCategory.includes("vegetarian") ||
                (!recipeName.includes("meat") &&
                  !recipeName.includes("chicken") &&
                  !recipeName.includes("beef") &&
                  !recipeName.includes("pork") &&
                  !recipeName.includes("fish"))
              );
            case "vegan":
              return (
                recipeName.includes("vegan") || recipeCategory.includes("vegan")
              );
            case "gluten-free":
              return (
                recipeName.includes("gluten-free") ||
                recipeCategory.includes("gluten-free")
              );
            case "dairy-free":
              return (
                recipeName.includes("dairy-free") ||
                recipeCategory.includes("dairy-free")
              );
            case "low-carb":
              return (
                recipeName.includes("low-carb") ||
                recipeCategory.includes("low-carb")
              );
            case "keto":
              return (
                recipeName.includes("keto") || recipeCategory.includes("keto")
              );
            default:
              return false;
          }
        });
      });
    }

    return filtered;
  }, [allRecipes, searchParams, filters]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(RECIPES_PER_PAGE);
  }, [searchParams, filters]);

  const displayedRecipes = filteredRecipes.slice(0, displayCount);
  const hasMore = displayCount < filteredRecipes.length;

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + RECIPES_PER_PAGE);
  };

  const handleRecipeClick = (recipe: Recipe) => {
    if (onRecipeSelect) {
      onRecipeSelect(recipe);
    } else {
      // Default behavior: navigate to recipe detail page
      router.push(`/recipe/${recipe.id}`);
    }
  };

  // Loading state for initial load
  if (loading) {
    return (
      <div className={cn("w-full", className)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-card rounded-lg border overflow-hidden animate-pulse"
            >
              <div className="p-4">
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-20 mb-3"></div>
                <div className="flex gap-4 mb-3">
                  <div className="h-4 bg-muted rounded w-16"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("w-full", className)}>
        <div className="text-center py-12">
          <div className="text-red-500 font-bold text-2xl mb-4">ERROR</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadAllRecipes}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (filteredRecipes.length === 0 && !loading) {
    return (
      <div className={cn("w-full", className)}>
        <div className="text-center py-12">
          <div className="text-muted-foreground font-bold text-2xl mb-4">
            NO RECIPES
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No recipes found
          </h3>
          <p className="text-muted-foreground">
            {searchParams.search || searchParams.category
              ? "Try adjusting your search or filters"
              : "No recipes available at the moment"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Results count */}
      {!loading && (
        <div className="mb-4 text-sm text-muted-foreground">
          {filteredRecipes.length === allRecipes.length
            ? `Showing ${displayedRecipes.length} of ${allRecipes.length} recipes`
            : `Found ${filteredRecipes.length} recipes, showing ${displayedRecipes.length}`}
        </div>
      )}

      {/* Recipe Grid - Optimized for mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {displayedRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onRecipeClick={handleRecipeClick}
            className="w-full"
          />
        ))}
      </div>

      {/* Load More Button - Mobile optimized */}
      {hasMore && (
        <div className="flex justify-center mt-6 sm:mt-8 px-4">
          <Button
            onClick={handleLoadMore}
            variant="secondary"
            size="lg"
            className={cn(
              "w-full sm:w-auto touch-manipulation",
              "min-h-[48px] text-base font-medium", // Better mobile touch target
              "active:scale-95 transition-transform"
            )}
          >
            Show More Recipes ({filteredRecipes.length - displayCount}{" "}
            remaining)
          </Button>
        </div>
      )}

      {/* End of results message */}
      {!hasMore && displayedRecipes.length > 0 && (
        <div className="text-center mt-6 sm:mt-8 py-4 px-4">
          <p className="text-muted-foreground text-sm sm:text-base">
            You've seen all {filteredRecipes.length} recipes
          </p>
        </div>
      )}
    </div>
  );
}
