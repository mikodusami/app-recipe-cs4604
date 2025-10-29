"use client";

import React, { useState, useEffect } from "react";
import { Recipe } from "@/lib/api";
import { useUser } from "@/contexts/UserContext";
import { favoritesService } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface RecipeCardProps {
  recipe: Recipe;
  onRecipeClick?: (recipe: Recipe) => void;
  className?: string;
}

export function RecipeCard({
  recipe,
  onRecipeClick,
  className,
}: RecipeCardProps) {
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

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent recipe click when toggling favorite

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

  const handleCardClick = () => {
    if (onRecipeClick) {
      onRecipeClick(recipe);
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

  return (
    <div
      className={cn(
        "card-minimal cursor-pointer overflow-hidden transition-all duration-200 p-5",
        "touch-manipulation hover:shadow-md", // Subtle elevation on hover
        className
      )}
      onClick={handleCardClick}
    >
      {/* Recipe Content - Following 8pt grid */}
      <div className="p-8">
        {/* Header with title and favorite button - Level 1 Typography */}
        <div className="flex items-start justify-between mb-6">
          <h3 className="font-poppins text-xl font-semibold text-[#121212] line-clamp-2 flex-1 mr-3 leading-tight">
            {recipe.name}
          </h3>

          {isAuthenticated && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteToggle}
              disabled={isToggling}
              className={cn(
                "p-2 min-w-0 hover:bg-[#F5F5F5] touch-manipulation",
                "min-h-[44px] min-w-[44px]", // Minimum touch target size
                "flex items-center justify-center"
              )}
            >
              <span
                className={cn(
                  "text-xs font-bold transition-colors duration-200",
                  isFavorited ? "text-[#8B4513]" : "text-[#6B7280]"
                )}
              >
                {isToggling ? "..." : "FAV"}
              </span>
            </Button>
          )}
        </div>

        {/* Category - Minimal styling */}
        {recipe.category && (
          <div className="mb-6">
            <span className="inline-block px-3 py-1 text-sm font-medium bg-[#F5F5F5] text-[#6B7280] rounded">
              {recipe.category}
            </span>
          </div>
        )}

        {/* Time Information - Clean, scannable layout */}
        <div className="flex flex-col gap-3 text-sm text-[#6B7280] mb-8">
          {recipe.prep_time_in_minutes && (
            <div className="flex items-center gap-3">
              <span className="text-[#8B4513] font-semibold text-xs tracking-wide">
                PREP
              </span>
              <span className="font-medium">
                {formatTime(recipe.prep_time_in_minutes)}
              </span>
            </div>
          )}

          {recipe.cook_time_in_minutes && (
            <div className="flex items-center gap-3">
              <span className="text-[#8B4513] font-semibold text-xs tracking-wide">
                COOK
              </span>
              <span className="font-medium">
                {formatTime(recipe.cook_time_in_minutes)}
              </span>
            </div>
          )}
        </div>

        {/* Recipe Stats - Subtle separator with minimal styling */}
        <div className="pt-6 border-t border-[#F5F5F5]">
          <div className="flex items-center justify-between text-sm text-[#6B7280]">
            <span className="font-medium">
              {recipe.ingredients.length} ingredients
            </span>
            <span className="font-medium">{recipe.steps.length} steps</span>
          </div>
        </div>
      </div>
    </div>
  );
}
