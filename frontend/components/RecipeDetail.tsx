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
    <div className={cn("max-w-4xl mx-auto bg-card", className)}>
      {/* Header Section */}
      <div className="relative">
        {/* Back Button - Mobile optimized */}
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className={cn(
              "mb-4",
              "min-h-[44px] min-w-[44px] touch-manipulation",
              "text-sm sm:text-base"
            )}
          >
            ← Back
          </Button>
        )}
      </div>

      {/* Recipe Content */}
      <div className="p-4 sm:p-6">
        {/* Title and Actions */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-card-foreground mb-3 leading-tight">
              {recipe.name}
            </h1>

            {recipe.category && (
              <span className="inline-block px-3 py-1 text-sm font-medium bg-orange-100 text-orange-800 rounded-full">
                {recipe.category}
              </span>
            )}
          </div>

          {/* Action Buttons - Mobile optimized */}
          <div className="flex flex-col sm:flex-row gap-3">
            {isAuthenticated && (
              <Button
                variant={isFavorited ? "primary" : "secondary"}
                onClick={handleFavoriteToggle}
                disabled={isToggling}
                className={cn(
                  "flex items-center justify-center gap-2 touch-manipulation",
                  "min-h-[48px] text-base font-medium",
                  "active:scale-95 transition-transform"
                )}
              >
                <span
                  className={cn(
                    "text-sm font-bold",
                    isToggling
                      ? "text-muted-foreground"
                      : isFavorited
                      ? "text-orange-500"
                      : "text-muted-foreground"
                  )}
                >
                  {isToggling ? "..." : isFavorited ? "FAVORITED" : "FAVORITE"}
                </span>
                {isFavorited ? "Favorited" : "Add to Favorites"}
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={handleShare}
              className={cn(
                "flex items-center justify-center gap-2 touch-manipulation",
                "min-h-[48px] text-base",
                "active:scale-95 transition-transform"
              )}
            >
              <span className="text-sm font-bold text-orange-500">SHARE</span>
            </Button>
          </div>
        </div>

        {/* Time Information - Mobile optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8 p-4 bg-muted rounded-lg">
          {recipe.prep_time_in_minutes && (
            <div className="text-center py-2">
              <div className="text-orange-500 font-bold text-lg sm:text-xl ">
                PREP
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mb-1">
                Prep Time
              </div>
              <div className="font-semibold text-foreground text-sm sm:text-base">
                {formatTime(recipe.prep_time_in_minutes)}
              </div>
            </div>
          )}

          {recipe.cook_time_in_minutes && (
            <div className="text-center py-2">
              <div className="text-red-500 font-bold text-lg sm:text-xl mb-1">
                COOK
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">
                Cook Time
              </div>
              <div className="font-semibold text-gray-900 text-sm sm:text-base">
                {formatTime(recipe.cook_time_in_minutes)}
              </div>
            </div>
          )}

          {totalTime > 0 && (
            <div className="text-center py-2">
              <div className="text-blue-500 font-bold text-lg sm:text-xl mb-1">
                TOTAL
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">
                Total Time
              </div>
              <div className="font-semibold text-gray-900 text-sm sm:text-base">
                {formatTime(totalTime)}
              </div>
            </div>
          )}
        </div>

        {/* Recipe Content Grid - Mobile first approach */}
        <div className="space-y-8 lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0">
          {/* Ingredients Section */}
          <div className="lg:col-span-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Ingredients
            </h2>
            <IngredientList
              ingredients={recipe.ingredients}
              className="lg:sticky lg:top-4"
            />
          </div>

          {/* Instructions Section */}
          <div className="lg:col-span-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Instructions
            </h2>
            <CookingSteps steps={recipe.steps} />
          </div>
        </div>
      </div>
    </div>
  );
}
