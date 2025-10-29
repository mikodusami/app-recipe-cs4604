"use client";

import React, { useState } from "react";
import { Recipe } from "@/lib/api";
import { useUser } from "@/contexts/UserContext";
import { Navigation } from "@/components/Navigation";
import { AuthModal } from "@/components/AuthModal";
import { FavoritesList } from "@/components/FavoritesList";
import { UserProfile } from "@/components/UserProfile";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type TabType = "favorites" | "profile";

export default function MyRecipesPage() {
  const { isAuthenticated, user } = useUser();
  const router = useRouter();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [activeTab, setActiveTab] = useState<TabType>("favorites");
  const [exportLoading, setExportLoading] = useState(false);

  const openSignIn = () => {
    setAuthMode("signin");
    setAuthModalOpen(true);
  };

  const openSignUp = () => {
    setAuthMode("signup");
    setAuthModalOpen(true);
  };

  const switchAuthMode = () => {
    setAuthMode(authMode === "signin" ? "signup" : "signin");
  };

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
      <div className="min-h-screen bg-white">
        <Navigation onSignIn={openSignIn} onSignUp={openSignUp} />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="font-poppins text-3xl font-semibold text-[#121212] mb-4">
              Sign in Required
            </h1>
            <p className="text-[#6B7280] mb-8">
              Please sign in to access your recipes, favorites, and profile
              settings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" onClick={openSignUp}>
                Sign Up
              </Button>
              <Button variant="secondary" onClick={openSignIn}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          mode={authMode}
          onSwitchMode={switchAuthMode}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation onSignIn={openSignIn} onSignUp={openSignUp} />

      {/* Main Content */}
      <main className="pt-24">
        {/* Hero Section */}
        <section className="px-8 md:px-16 lg:px-24 py-12 md:py-16 border-b border-[#F5F5F5]">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <h1
                  className="font-poppins text-3xl md:text-4xl lg:text-5xl font-semibold 
                             text-[#121212] mb-4 leading-tight"
                >
                  My Recipes
                </h1>
                <p className="text-lg text-[#6B7280] max-w-2xl">
                  Manage your favorite recipes and profile settings
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {activeTab === "favorites" && (
                  <Button
                    onClick={handleExportFavorites}
                    disabled={exportLoading}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <span className="text-xs">📤</span>
                    {exportLoading ? "Exporting..." : "Export Favorites"}
                  </Button>
                )}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center lg:justify-start mt-8">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("favorites")}
                  className={cn(
                    "px-6 py-3 rounded font-medium transition-all duration-200 flex items-center gap-2",
                    activeTab === "favorites"
                      ? "bg-[#8B4513] text-white shadow-sm"
                      : "bg-[#F5F5F5] text-[#6B7280] hover:text-[#121212] hover:bg-[#E5E5E5]"
                  )}
                >
                  <span className="text-sm">❤️</span>
                  <span>Favorites</span>
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={cn(
                    "px-6 py-3 rounded font-medium transition-all duration-200 flex items-center gap-2",
                    activeTab === "profile"
                      ? "bg-[#8B4513] text-white shadow-sm"
                      : "bg-[#F5F5F5] text-[#6B7280] hover:text-[#121212] hover:bg-[#E5E5E5]"
                  )}
                >
                  <span className="text-sm">👤</span>
                  <span>Profile</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="px-8 md:px-16 lg:px-24 py-12 md:py-16">
          <div className="max-w-7xl mx-auto">
            {activeTab === "favorites" && (
              <div data-favorites-list>
                <FavoritesList
                  onRecipeClick={handleRecipeClick}
                  className="w-full"
                />
              </div>
            )}

            {activeTab === "profile" && <UserProfile className="w-full" />}
          </div>
        </section>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={switchAuthMode}
      />
    </div>
  );
}
