"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Navigation } from "@/components/Navigation";
import { AuthModal } from "@/components/AuthModal";
import { Button } from "@/components/ui/Button";

import { RecipeCard } from "@/components/RecipeCard";
import { recipeService, Recipe, favoritesService } from "@/lib/api";

export default function Home() {
  const { user, isAuthenticated, loading } = useUser();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]);
  const [recentActivity, setRecentActivity] = useState<Recipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);

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

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        // Load featured recipes (first 6 recipes)
        const featuredResponse = await recipeService.getRecipes({ limit: 6 });
        if (featuredResponse.success && featuredResponse.data) {
          setFeaturedRecipes(featuredResponse.data);
        }

        // Load recent activity for authenticated users
        if (isAuthenticated && user) {
          const favoritesResponse = await favoritesService.getFavorites(
            user.id,
            { limit: 3 }
          );
          if (favoritesResponse.success && favoritesResponse.data) {
            // Get full recipe details for favorites
            const recentRecipes = await Promise.all(
              favoritesResponse.data.slice(0, 3).map(async (fav) => {
                const recipeResponse = await recipeService.getRecipe(
                  fav.recipe_id
                );
                return recipeResponse.success ? recipeResponse.data : null;
              })
            );
            setRecentActivity(recentRecipes.filter(Boolean) as Recipe[]);
          }
        }
      } catch (error) {
        console.error("Error loading recipes:", error);
      } finally {
        setLoadingRecipes(false);
      }
    };

    if (!loading) {
      loadRecipes();
    }
  }, [isAuthenticated, user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto mb-6"></div>
          <p className="text-[#6B7280] font-medium">
            Loading Recipe Assistant...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation onSignIn={openSignIn} onSignUp={openSignUp} />

      {/* Main Content */}
      <main className="pt-24">
        {/* Hero Section - Following 8pt grid with intentional gutters */}
        <section className="px-8 md:px-16 lg:px-24 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* Level 1 Typography - Recipe Title equivalent */}
            <h1 className="font-poppins text-4xl md:text-6xl lg:text-7xl font-semibold text-[#121212] mb-8 leading-tight tracking-tight">
              Recipe Assistant
            </h1>

            {/* Level 3 Typography - Body text with generous line height */}
            <p className="text-lg md:text-xl text-[#6B7280] mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover amazing recipes, save your favorites, and cook with
              confidence.
            </p>

            {/* Authentication State - Primary CTA with accent color */}
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button variant="primary" size="lg" onClick={openSignUp}>
                  Get Started
                </Button>
                <Button variant="secondary" size="lg" onClick={openSignIn}>
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Featured Recipes - Reduced spacing */}
        <section className="px-8 md:px-16 lg:px-24 py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            {/* Level 2 Typography - Section heading */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-8">
              <h2 className="font-poppins text-2xl md:text-3xl lg:text-4xl font-semibold text-[#121212]">
                Featured Recipes
              </h2>
              <Button
                variant="secondary"
                onClick={() => (window.location.href = "/recipes")}
              >
                View All
              </Button>
            </div>

            {loadingRecipes ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-12">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card-minimal p-8 animate-pulse">
                    <div className="h-48 bg-[#F5F5F5] rounded mb-6"></div>
                    <div className="h-4 bg-[#F5F5F5] rounded mb-3"></div>
                    <div className="h-4 bg-[#F5F5F5] rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-12">
                {featuredRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Recent Activity - Significant vertical whitespace separation */}
        {isAuthenticated && recentActivity.length > 0 && (
          <section className="px-8 md:px-16 lg:px-24 py-16 md:py-24">
            <div className="max-w-6xl mx-auto">
              <h2 className="font-poppins text-2xl md:text-3xl lg:text-4xl font-semibold text-[#121212] mb-16 text-center">
                Your Recent Favorites
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-12 mb-16">
                {recentActivity.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>

              <div className="text-center">
                <Button
                  variant="secondary"
                  onClick={() => (window.location.href = "/my-recipes")}
                >
                  View All Favorites
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Bottom spacing for clean finish */}
        <div className="h-16 md:h-24"></div>
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
