"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Navigation } from "@/components/Navigation";
import { AuthModal } from "@/components/AuthModal";
import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/SearchBar";
import { RecipeCard } from "@/components/RecipeCard";
import { recipeService, Recipe, favoritesService } from "@/lib/api";

export default function Home() {
  const { user, isAuthenticated, loading } = useUser();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]);
  const [trendingRecipes, setTrendingRecipes] = useState<Recipe[]>([]);
  const [recipeOfTheDay, setRecipeOfTheDay] = useState<Recipe | null>(null);
  const [recentActivity, setRecentActivity] = useState<Recipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleSearch = (query: string) => {
    if (query.trim()) {
      window.location.href = `/recipes?search=${encodeURIComponent(query)}`;
    }
  };

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        // Load featured recipes (first 6 recipes)
        const featuredResponse = await recipeService.getRecipes({ limit: 6 });
        if (featuredResponse.success && featuredResponse.data) {
          setFeaturedRecipes(featuredResponse.data);

          // Set recipe of the day (first recipe)
          if (featuredResponse.data.length > 0) {
            setRecipeOfTheDay(featuredResponse.data[0]);
          }
        }

        // Load trending recipes (different set)
        const trendingResponse = await recipeService.getRecipes({
          skip: 6,
          limit: 4,
        });
        if (trendingResponse.success && trendingResponse.data) {
          setTrendingRecipes(trendingResponse.data);
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Recipe Assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation onSignIn={openSignIn} onSignUp={openSignUp} />

      {/* Main Content */}
      <main className="pt-20 pb-12">
        {/* Hero Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h1 className="text-5xl font-bold text-foreground mb-4">
              Recipe Assistant
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover amazing recipes, save your favorites, and cook with
              confidence.
            </p>

            {/* Quick Search */}
            <div className="max-w-md mx-auto mb-8">
              <SearchBar
                initialValue={searchQuery}
                onSearch={handleSearch}
                placeholder="Search for recipes..."
                showFiltersToggle={false}
              />
            </div>

            {/* Authentication State */}
            {!isAuthenticated && (
              <div className="flex gap-4 justify-center">
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

        {/* Featured Recipes */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-foreground">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-card rounded-lg border p-6 animate-pulse"
                  >
                    <div className="h-48 bg-muted rounded-lg mb-4"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Recent Activity for Authenticated Users */}
        {isAuthenticated && recentActivity.length > 0 && (
          <section className="py-12">
            <div className="max-w-6xl mx-auto px-6">
              <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
                Your Recent Favorites
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentActivity.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
              <div className="text-center mt-8">
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
