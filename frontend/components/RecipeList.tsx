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
  sortBy?: "newest" | "popular" | "quickest";
  onRecipeSelect?: (recipe: Recipe) => void;
  className?: string;
}

const RECIPES_PER_PAGE = 12;

export function RecipeList({
  searchParams = {},
  filters = {},
  sortBy = "newest",
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

    // Apply sorting
    switch (sortBy) {
      case "quickest":
        filtered.sort((a, b) => {
          const totalTimeA =
            (a.prep_time_in_minutes || 0) + (a.cook_time_in_minutes || 0);
          const totalTimeB =
            (b.prep_time_in_minutes || 0) + (b.cook_time_in_minutes || 0);
          return totalTimeA - totalTimeB;
        });
        break;
      case "popular":
        // For now, sort by number of ingredients as a proxy for complexity/popularity
        filtered.sort((a, b) => b.ingredients.length - a.ingredients.length);
        break;
      case "newest":
      default:
        // Keep original order (newest first)
        break;
    }

    return filtered;
  }, [allRecipes, searchParams, filters, sortBy]);

  // Reset display count when filters or sort change
  useEffect(() => {
    setDisplayCount(RECIPES_PER_PAGE);
  }, [searchParams, filters, sortBy]);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="card-minimal p-8 animate-pulse">
              <div className="h-6 bg-[#F5F5F5] rounded mb-4"></div>
              <div className="h-4 bg-[#F5F5F5] rounded w-20 mb-6"></div>
              <div className="flex gap-4 mb-6">
                <div className="h-4 bg-[#F5F5F5] rounded w-16"></div>
                <div className="h-4 bg-[#F5F5F5] rounded w-16"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-[#F5F5F5] rounded w-20"></div>
                <div className="h-4 bg-[#F5F5F5] rounded w-16"></div>
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
        <div className="text-center py-16">
          <div className="text-[#8B4513] font-poppins font-bold text-2xl mb-4">
            ERROR
          </div>
          <h3 className="text-lg font-semibold text-[#121212] mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-[#6B7280] mb-6">{error}</p>
          <Button onClick={loadAllRecipes} variant="primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (filteredRecipes.length === 0 && !loading) {
    return (
      <div className={cn("w-full", className)}>
        <div className="text-center py-16">
          <div className="text-[#6B7280] font-poppins font-bold text-2xl mb-4">
            NO RECIPES FOUND
          </div>
          <h3 className="text-lg font-semibold text-[#121212] mb-2">
            No recipes match your criteria
          </h3>
          <p className="text-[#6B7280] mb-6">
            {searchParams.search || searchParams.category
              ? "Try adjusting your search or filters to find more recipes"
              : "No recipes available at the moment"}
          </p>
          {(searchParams.search || Object.keys(filters).length > 0) && (
            <Button
              onClick={() => (window.location.href = "/recipes")}
              variant="secondary"
            >
              View All Recipes
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Results count */}
      {!loading && (
        <div className="mb-8 text-sm text-[#6B7280] font-medium">
          {filteredRecipes.length === allRecipes.length
            ? `Showing ${displayedRecipes.length} of ${allRecipes.length} recipes`
            : `Found ${filteredRecipes.length} recipes, showing ${displayedRecipes.length}`}
        </div>
      )}

      {/* Recipe Grid - Clean, spacious layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
        {displayedRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onRecipeClick={handleRecipeClick}
            className="w-full"
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-12">
          <Button
            onClick={handleLoadMore}
            variant="secondary"
            size="lg"
            className="px-8 py-3"
          >
            Show More Recipes ({filteredRecipes.length - displayCount}{" "}
            remaining)
          </Button>
        </div>
      )}

      {/* End of results message */}
      {!hasMore && displayedRecipes.length > 0 && (
        <div className="text-center mt-12 py-8">
          <p className="text-[#6B7280] text-base">
            You've seen all {filteredRecipes.length} recipes
          </p>
        </div>
      )}
    </div>
  );
}
