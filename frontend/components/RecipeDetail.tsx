"use client";

import React, { useState, useEffect } from "react";
import { Recipe } from "@/lib/api";
import { useUser } from "@/contexts/UserContext";
import { favoritesService } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { IngredientList } from "./IngredientList";
import { CookingSteps } from "./CookingSteps";
import { cn } from "@/lib/utils";

interface RecipeDetailProps {
  recipe: Recipe;
  onBack?: () => void;
  className?: string;
}

export function RecipeDetail({ recipe, onBack, className }: RecipeDetailProps) {
  const { user, isAuthenticated } = useUser();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [favoriteLoaded, setFavoriteLoaded] = useState(false);

  // Load favorite status when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && !favoriteLoaded) {
      checkFavoriteStatus();
    }
  }, [isAuthenticated, user, favoriteLoaded]);

  const checkFavoriteStatus = async () => {
    if (!user) return;

    try {
      const response = await favoritesService.checkFavorite(user.id, recipe.id);
      if (response.success && response.data) {
        setIsFavorited(response.data.is_favorited);
      }
    } catch (error) {
      console.error("Failed to check favorite status:", error);
    } finally {
      setFavoriteLoaded(true);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated || !user) return;

    setIsToggling(true);

    try {
      if (isFavorited) {
        const response = await favoritesService.removeFavorite(
          user.id,
          recipe.id
        );
        if (response.success) {
          setIsFavorited(false);
        }
      } else {
        const response = await favoritesService.addFavorite(user.id, {
          recipe_id: recipe.id,
        });
        if (response.success) {
          setIsFavorited(true);
        }
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.name,
          text: `Check out this recipe: ${recipe.name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        // You could show a toast notification here
        alert("Recipe link copied to clipboard!");
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
      }
    }
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return "N/A";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const totalTime =
    (recipe.prep_time_in_minutes || 0) + (recipe.cook_time_in_minutes || 0);

  return (
    <div className={cn("", className)}>
      {/* Hero Section */}
      <section className="px-8 md:px-16 lg:px-24 py-8 md:py-12 border-b border-[#F5F5F5]">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-[#6B7280] hover:text-[#121212] 
                       transition-colors duration-200 mb-8 group"
            >
              <span className="group-hover:-translate-x-1 transition-transform duration-200">
                ←
              </span>
              <span className="font-medium">Back to Recipes</span>
            </button>
          )}

          {/* Recipe Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1">
              {/* Category Badge */}
              {recipe.category && (
                <div className="mb-4">
                  <span
                    className="inline-block px-3 py-1 text-sm font-medium bg-[#F5F5F5] 
                                 text-[#6B7280] rounded"
                  >
                    {recipe.category}
                  </span>
                </div>
              )}

              {/* Recipe Title */}
              <h1
                className="font-poppins text-3xl md:text-4xl lg:text-5xl font-semibold 
                           text-[#121212] mb-6 leading-tight"
              >
                {recipe.name}
              </h1>

              {/* Recipe Stats */}
              <div className="flex flex-wrap gap-6 text-sm text-[#6B7280]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#8B4513]">
                    INGREDIENTS
                  </span>
                  <span>{recipe.ingredients.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#8B4513]">STEPS</span>
                  <span>{recipe.steps.length}</span>
                </div>
                {totalTime > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#8B4513]">
                      TOTAL TIME
                    </span>
                    <span>{formatTime(totalTime)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-48">
              {isAuthenticated && (
                <Button
                  variant={isFavorited ? "primary" : "secondary"}
                  onClick={handleFavoriteToggle}
                  disabled={isToggling}
                  className="flex items-center justify-center gap-2"
                >
                  <span className="text-xs font-bold">
                    {isToggling ? "..." : isFavorited ? "♥" : "♡"}
                  </span>
                  {isFavorited ? "Favorited" : "Save Recipe"}
                </Button>
              )}

              <Button
                variant="ghost"
                onClick={handleShare}
                className="flex items-center justify-center gap-2"
              >
                <span className="text-xs">📤</span>
                Share Recipe
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Time Information */}
      {(recipe.prep_time_in_minutes || recipe.cook_time_in_minutes) && (
        <section className="px-8 md:px-16 lg:px-24 py-8 bg-[#F5F5F5]">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {recipe.prep_time_in_minutes && (
                <div className="text-center">
                  <div className="text-[#8B4513] font-semibold text-xs tracking-wide mb-2">
                    PREP TIME
                  </div>
                  <div className="font-poppins text-2xl font-semibold text-[#121212]">
                    {formatTime(recipe.prep_time_in_minutes)}
                  </div>
                </div>
              )}

              {recipe.cook_time_in_minutes && (
                <div className="text-center">
                  <div className="text-[#8B4513] font-semibold text-xs tracking-wide mb-2">
                    COOK TIME
                  </div>
                  <div className="font-poppins text-2xl font-semibold text-[#121212]">
                    {formatTime(recipe.cook_time_in_minutes)}
                  </div>
                </div>
              )}

              {totalTime > 0 && (
                <div className="text-center">
                  <div className="text-[#8B4513] font-semibold text-xs tracking-wide mb-2">
                    TOTAL TIME
                  </div>
                  <div className="font-poppins text-2xl font-semibold text-[#121212]">
                    {formatTime(totalTime)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Recipe Content */}
      <section className="px-8 md:px-16 lg:px-24 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Ingredients Section */}
            <div className="lg:col-span-1">
              <h2 className="font-poppins text-2xl md:text-3xl font-semibold text-[#121212] mb-8">
                Ingredients
              </h2>
              <div className="lg:sticky lg:top-32">
                <IngredientList ingredients={recipe.ingredients} />
              </div>
            </div>

            {/* Instructions Section */}
            <div className="lg:col-span-2">
              <h2 className="font-poppins text-2xl md:text-3xl font-semibold text-[#121212] mb-8">
                Instructions
              </h2>
              <CookingSteps steps={recipe.steps} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
