"use client";

import React, { useState, useEffect } from "react";
import {
  Recipe,
  FavoriteRecipe,
  favoritesService,
  recipeService,
} from "@/lib/api";
import { useUser } from "@/contexts/UserContext";
import { RecipeCard } from "@/components/RecipeCard";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface FavoritesListProps {
  onRecipeClick?: (recipe: Recipe) => void;
  className?: string;
}

interface FavoriteWithRecipe extends FavoriteRecipe {
  recipe?: Recipe;
}

export function FavoritesList({
  onRecipeClick,
  className,
}: FavoritesListProps) {
  const { user, isAuthenticated } = useUser();
  const [favorites, setFavorites] = useState<FavoriteWithRecipe[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<
    FavoriteWithRecipe[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

  // Load favorites when component mounts
  useEffect(() => {
    if (isAuthenticated && user) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Filter favorites based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFavorites(favorites);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = favorites.filter((favorite) => {
        const recipeName =
          favorite.recipe?.name?.toLowerCase() ||
          favorite.recipe_name?.toLowerCase() ||
          "";
        const category = favorite.recipe?.category?.toLowerCase() || "";
        const userNote = favorite.user_note?.toLowerCase() || "";

        return (
          recipeName.includes(query) ||
          category.includes(query) ||
          userNote.includes(query)
        );
      });
      setFilteredFavorites(filtered);
    }
  }, [favorites, searchQuery]);

  const loadFavorites = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await favoritesService.getFavorites(user.id, {
        limit: 100,
      });

      if (response.success && response.data) {
        // Load full recipe details for each favorite
        const favoritesWithRecipes = await Promise.all(
          response.data.map(async (favorite) => {
            try {
              const recipeResponse = await recipeService.getRecipe(
                favorite.recipe_id
              );
              return {
                ...favorite,
                recipe: recipeResponse.success
                  ? recipeResponse.data
                  : undefined,
              };
            } catch (error) {
              console.error(
                `Failed to load recipe ${favorite.recipe_id}:`,
                error
              );
              return favorite;
            }
          })
        );

        setFavorites(favoritesWithRecipes);
      } else {
        setError(response.error || "Failed to load favorites");
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
      setError("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (recipeId: number) => {
    if (!user || removingIds.has(recipeId)) return;

    setRemovingIds((prev) => new Set(prev).add(recipeId));

    try {
      const response = await favoritesService.removeFavorite(user.id, recipeId);

      if (response.success) {
        // Remove from local state
        setFavorites((prev) =>
          prev.filter((fav) => fav.recipe_id !== recipeId)
        );
      } else {
        setError(response.error || "Failed to remove favorite");
      }
    } catch (error) {
      console.error("Failed to remove favorite:", error);
      setError("Failed to remove favorite");
    } finally {
      setRemovingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(recipeId);
        return newSet;
      });
    }
  };

  const handleRecipeClick = (recipe: Recipe) => {
    if (onRecipeClick) {
      onRecipeClick(recipe);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Show loading state
  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-16", className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto mb-6"></div>
          <p className="text-[#6B7280] font-medium">
            Loading your favorites...
          </p>
        </div>
      </div>
    );
  }

  // Show authentication required message
  if (!isAuthenticated) {
    return (
      <div className={cn("text-center py-16", className)}>
        <div className="text-6xl mb-6">🔒</div>
        <h3 className="font-poppins text-xl font-semibold text-[#121212] mb-3">
          Sign in to view favorites
        </h3>
        <p className="text-[#6B7280]">
          Create an account or sign in to save and view your favorite recipes.
        </p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={cn("text-center py-16", className)}>
        <div className="text-6xl mb-6">⚠️</div>
        <h3 className="font-poppins text-xl font-semibold text-[#121212] mb-3">
          Something went wrong
        </h3>
        <p className="text-[#6B7280] mb-6">{error}</p>
        <Button onClick={loadFavorites} variant="primary">
          Try Again
        </Button>
      </div>
    );
  }

  // Show empty state
  if (favorites.length === 0) {
    return (
      <div className={cn("text-center py-16", className)}>
        <div className="text-6xl mb-6">❤️</div>
        <h3 className="font-poppins text-xl font-semibold text-[#121212] mb-3">
          No favorites yet
        </h3>
        <p className="text-[#6B7280] mb-8 max-w-md mx-auto">
          Start exploring recipes and save your favorites to see them here.
        </p>
        <Button onClick={() => (window.location.href = "/")} variant="primary">
          Browse Recipes
        </Button>
      </div>
    );
  }

  // Show empty search results
  if (searchQuery && filteredFavorites.length === 0) {
    return (
      <div className={cn("", className)}>
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            onSearch={handleSearchChange}
            placeholder="Search your favorites..."
            initialValue={searchQuery}
            showFiltersToggle={false}
            className="max-w-md"
          />
        </div>

        {/* Empty search results */}
        <div className="text-center py-16">
          <div className="text-6xl mb-6">🔍</div>
          <h3 className="font-poppins text-xl font-semibold text-[#121212] mb-3">
            No favorites found
          </h3>
          <p className="text-[#6B7280] mb-6">
            No favorites match your search for "{searchQuery}".
          </p>
          <Button onClick={handleClearSearch} variant="primary">
            Clear Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("", className)}>
      {/* Header with search */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <div>
          <h2 className="font-poppins text-2xl font-semibold text-[#121212]">
            My Favorites
          </h2>
          <p className="text-[#6B7280] mt-1">
            {favorites.length} favorite{" "}
            {favorites.length === 1 ? "recipe" : "recipes"}
          </p>
        </div>

        <div className="lg:max-w-sm lg:w-full">
          <SearchBar
            onSearch={handleSearchChange}
            placeholder="Search favorites..."
            initialValue={searchQuery}
            showFiltersToggle={false}
          />
        </div>
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
        {filteredFavorites.map((favorite) => {
          const recipe = favorite.recipe;

          if (!recipe) {
            // Show placeholder for recipes that failed to load
            return (
              <div
                key={favorite.recipe_id}
                className="card-minimal p-6 border-2 border-dashed border-[#E5E5E5]"
              >
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">⚠️</div>
                  <p className="text-[#6B7280] text-sm font-medium">
                    Recipe not available
                  </p>
                  <p className="text-[#6B7280] text-xs mt-1">
                    {favorite.recipe_name || `Recipe #${favorite.recipe_id}`}
                  </p>
                  <Button
                    onClick={() => handleRemoveFavorite(favorite.recipe_id)}
                    disabled={removingIds.has(favorite.recipe_id)}
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                  >
                    {removingIds.has(favorite.recipe_id)
                      ? "Removing..."
                      : "Remove"}
                  </Button>
                </div>
              </div>
            );
          }

          return (
            <div key={favorite.recipe_id} className="relative group">
              <div data-recipe-name={recipe.name}>
                <RecipeCard recipe={recipe} onRecipeClick={handleRecipeClick} />
              </div>

              {/* Remove button overlay */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFavorite(favorite.recipe_id);
                  }}
                  disabled={removingIds.has(favorite.recipe_id)}
                  className="w-10 h-10 bg-white shadow-sm border border-[#E5E5E5] rounded-full 
                           flex items-center justify-center hover:bg-[#F5F5F5] hover:border-[#8B4513]
                           transition-colors duration-200"
                >
                  {removingIds.has(favorite.recipe_id) ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b border-[#8B4513]"></div>
                  ) : (
                    <span className="text-[#6B7280] hover:text-[#8B4513] text-sm">
                      🗑️
                    </span>
                  )}
                </button>
              </div>

              {/* User note if present */}
              {favorite.user_note && (
                <div className="mt-3 p-3 bg-[#F5F5F5] border border-[#E5E5E5] rounded text-sm">
                  <p className="text-[#6B7280]">
                    <span className="font-semibold text-[#8B4513]">Note:</span>{" "}
                    {favorite.user_note}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show filtered count if searching */}
      {searchQuery && (
        <div className="mt-8 text-center text-[#6B7280] font-medium">
          Showing {filteredFavorites.length} of {favorites.length} favorites
        </div>
      )}
    </div>
  );
}
