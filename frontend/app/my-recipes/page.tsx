"use client";

import React, { useState } from "react";
import { Recipe } from "@/lib/api";
import { useUser } from "@/contexts/UserContext";
import { FavoritesList } from "@/components/FavoritesList";
import { UserProfile } from "@/components/UserProfile";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type TabType = "favorites" | "profile";

export default function MyRecipesPage() {
  const { isAuthenticated } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("favorites");
  const [exportLoading, setExportLoading] = useState(false);

  const handleRecipeClick = (recipe: Recipe) => {
    router.push(`/recipe/${recipe.id}`);
  };

  const handleExportFavorites = async () => {
    setExportLoading(true);

    try {
      // This would typically call an API to generate and download the export
      // For now, we'll create a simple text export
      const favoritesListComponent = document.querySelector(
        "[data-favorites-list]"
      );
      if (favoritesListComponent) {
        // Create a simple text export of favorite recipe names
        const recipeCards =
          favoritesListComponent.querySelectorAll("[data-recipe-name]");
        const recipeNames = Array.from(recipeCards)
          .map((card) => card.textContent?.trim() || "")
          .filter((name) => name);

        if (recipeNames.length > 0) {
          const exportText = `My Favorite Recipes\n\n${recipeNames
            .map((name, index) => `${index + 1}. ${name}`)
            .join("\n")}`;

          // Create and download file
          const blob = new Blob([exportText], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "my-favorite-recipes.txt";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error("Failed to export favorites:", error);
    } finally {
      setExportLoading(false);
    }
  };

  // Show authentication required message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Sign in Required
          </h1>
          <p className="text-gray-600 mb-6">
            Please sign in to access your recipes, favorites, and profile
            settings.
          </p>
          <Button onClick={() => router.push("/")} className="w-full">
            Go to Home Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Recipes</h1>
              <p className="text-gray-600 mt-1">
                Manage your favorite recipes and profile settings
              </p>
            </div>

            {/* Export Button - only show on favorites tab */}
            {activeTab === "favorites" && (
              <Button
                onClick={handleExportFavorites}
                disabled={exportLoading}
                variant="secondary"
                className="hidden sm:flex"
              >
                {exportLoading ? "Exporting..." : "📤 Export Favorites"}
              </Button>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-8 border-b">
            <button
              onClick={() => setActiveTab("favorites")}
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === "favorites"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              ❤️ Favorites
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === "profile"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              👤 Profile
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "favorites" && (
          <div>
            {/* Mobile Export Button */}
            <div className="sm:hidden mb-4">
              <Button
                onClick={handleExportFavorites}
                disabled={exportLoading}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                {exportLoading ? "Exporting..." : "📤 Export Favorites"}
              </Button>
            </div>

            {/* Favorites List */}
            <div data-favorites-list>
              <FavoritesList
                onRecipeClick={handleRecipeClick}
                className="w-full"
              />
            </div>
          </div>
        )}

        {activeTab === "profile" && <UserProfile className="w-full" />}
      </div>

      {/* Recently Viewed Section - Placeholder for future implementation */}
      {activeTab === "favorites" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t bg-white mt-8">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🕒</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Recently Viewed
            </h3>
            <p className="text-gray-600 mb-4">
              Your recently viewed recipes will appear here.
            </p>
            <p className="text-sm text-gray-500">
              This feature will be available in a future update.
            </p>
          </div>
        </div>
      )}

      {/* Personal Notes Section - Placeholder for future implementation */}
      {activeTab === "favorites" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t bg-gray-50">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Recipe Notes
            </h3>
            <p className="text-gray-600 mb-4">
              Add personal notes and modifications to your favorite recipes.
            </p>
            <p className="text-sm text-gray-500">
              This feature will be available in a future update.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
