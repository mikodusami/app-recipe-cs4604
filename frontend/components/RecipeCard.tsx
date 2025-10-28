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
        "bg-card rounded-lg border hover:shadow-lg transition-shadow duration-200 cursor-pointer overflow-hidden",
        "touch-manipulation", // Optimize for touch devices
        "active:scale-95 active:shadow-sm transition-transform", // Touch feedback
        className
      )}
      onClick={handleCardClick}
    >
      {/* Recipe Content */}
      <div className="p-4 sm:p-6">
        {/* Header with title and favorite button */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg sm:text-xl font-semibold text-card-foreground line-clamp-2 flex-1 mr-2">
            {recipe.name}
          </h3>

          {isAuthenticated && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteToggle}
              disabled={isToggling}
              className={cn(
                "p-2 min-w-0 hover:bg-muted touch-manipulation",
                "min-h-[44px] min-w-[44px]", // Minimum touch target size
                "flex items-center justify-center"
              )}
            >
              <span
                className={cn(
                  "text-xs sm:text-sm font-bold transition-colors",
                  isFavorited ? "text-orange-500" : "text-muted-foreground"
                )}
              >
                {isToggling ? "..." : "FAV"}
              </span>
            </Button>
          )}
        </div>

        {/* Category */}
        {recipe.category && (
          <div className="mb-3">
            <span className="inline-block px-3 py-1 text-sm font-medium bg-orange-100 text-orange-800 rounded-full">
              {recipe.category}
            </span>
          </div>
        )}

        {/* Time Information - Stack on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-3">
          {recipe.prep_time_in_minutes && (
            <div className="flex items-center gap-2">
              <span className="text-orange-500 font-bold text-xs">PREP</span>
              <span>{formatTime(recipe.prep_time_in_minutes)}</span>
            </div>
          )}

          {recipe.cook_time_in_minutes && (
            <div className="flex items-center gap-2">
              <span className="text-orange-500 font-bold text-xs">COOK</span>
              <span>{formatTime(recipe.cook_time_in_minutes)}</span>
            </div>
          )}
        </div>

        {/* Recipe Stats */}
        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{recipe.ingredients.length} ingredients</span>
            <span>{recipe.steps.length} steps</span>
          </div>
        </div>
      </div>
    </div>
  );
}
