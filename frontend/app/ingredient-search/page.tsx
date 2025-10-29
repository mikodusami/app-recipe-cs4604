"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { AuthModal } from "@/components/AuthModal";
import {
  IngredientInput,
  SelectedIngredient,
} from "@/components/IngredientInput";
import { RecipesByIngredients } from "@/components/RecipesByIngredients";
import { Button } from "@/components/ui/Button";
import { Recipe } from "@/lib/api";
import { cn } from "@/lib/utils";

const PANTRY_STORAGE_KEY = "user_pantry_ingredients";

export default function IngredientSearchPage() {
  const router = useRouter();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [selectedIngredients, setSelectedIngredients] = useState<
    SelectedIngredient[]
  >([]);
  const [pantryIngredients, setPantryIngredients] = useState<
    SelectedIngredient[]
  >([]);
  const [activeTab, setActiveTab] = useState<"search" | "pantry">("search");

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

  // Load pantry ingredients from localStorage on component mount
  useEffect(() => {
    loadPantryFromStorage();
  }, []);

  // Save pantry to localStorage whenever it changes
  useEffect(() => {
    savePantryToStorage();
  }, [pantryIngredients]);

  const loadPantryFromStorage = () => {
    try {
      const stored = localStorage.getItem(PANTRY_STORAGE_KEY);
      if (stored) {
        const pantry = JSON.parse(stored);
        setPantryIngredients(pantry);
      }
    } catch (error) {
      console.error("Failed to load pantry from storage:", error);
    }
  };

  const savePantryToStorage = () => {
    try {
      localStorage.setItem(
        PANTRY_STORAGE_KEY,
        JSON.stringify(pantryIngredients)
      );
    } catch (error) {
      console.error("Failed to save pantry to storage:", error);
    }
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    router.push(`/recipe/${recipe.id}`);
  };

  const addToPantry = (ingredients: SelectedIngredient[]) => {
    const newPantryIngredients = [...pantryIngredients];

    ingredients.forEach((ingredient) => {
      const existingIndex = newPantryIngredients.findIndex(
        (pantryItem) => pantryItem.id === ingredient.id
      );

      if (existingIndex >= 0) {
        // Update existing ingredient quantity
        newPantryIngredients[existingIndex] = {
          ...newPantryIngredients[existingIndex],
          quantity:
            (newPantryIngredients[existingIndex].quantity || 0) +
            (ingredient.quantity || 1),
        };
      } else {
        // Add new ingredient to pantry
        newPantryIngredients.push(ingredient);
      }
    });

    setPantryIngredients(newPantryIngredients);
  };

  const clearPantry = () => {
    setPantryIngredients([]);
  };

  const usePantryIngredients = () => {
    setSelectedIngredients([...pantryIngredients]);
    setActiveTab("search");
  };

  const addSelectedToPantry = () => {
    if (selectedIngredients.length > 0) {
      addToPantry(selectedIngredients);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation onSignIn={openSignIn} onSignUp={openSignUp} />

      {/* Main Content */}
      <main className="pt-24">
        {/* Hero Section */}
        <section className="px-8 md:px-16 lg:px-24 py-12 md:py-16 border-b border-[#F5F5F5]">
          <div className="max-w-4xl mx-auto text-center">
            <h1
              className="font-poppins text-3xl md:text-4xl lg:text-5xl font-semibold 
                         text-[#121212] mb-4 leading-tight"
            >
              Find Recipes by Ingredients
            </h1>
            <p className="text-lg text-[#6B7280] mb-8 max-w-2xl mx-auto">
              Tell us what you have in your kitchen, and we'll show you
              delicious recipes you can make right now
            </p>

            {/* Tab Navigation */}
            <div className="flex justify-center">
              <div className="bg-[#F5F5F5] rounded-full p-1">
                <button
                  onClick={() => setActiveTab("search")}
                  className={cn(
                    "px-6 py-3 rounded-full font-medium transition-all duration-200",
                    activeTab === "search"
                      ? "bg-[#8B4513] text-white shadow-sm"
                      : "text-[#6B7280] hover:text-[#121212]"
                  )}
                >
                  Recipe Search
                </button>
                <button
                  onClick={() => setActiveTab("pantry")}
                  className={cn(
                    "px-6 py-3 rounded-full font-medium transition-all duration-200 relative",
                    activeTab === "pantry"
                      ? "bg-[#8B4513] text-white shadow-sm"
                      : "text-[#6B7280] hover:text-[#121212]"
                  )}
                >
                  My Pantry
                  {pantryIngredients.length > 0 && (
                    <span
                      className="absolute -top-1 -right-1 bg-[#8B4513] text-white text-xs 
                                   rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      {pantryIngredients.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="px-8 md:px-16 lg:px-24 py-12 md:py-16">
          <div className="max-w-7xl mx-auto">
            {activeTab === "search" ? (
              /* Recipe Search Tab */
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
                {/* Left Column - Ingredient Selection */}
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="font-poppins text-2xl font-semibold text-[#121212]">
                      Select Ingredients
                    </h2>
                    {selectedIngredients.length > 0 && (
                      <button
                        onClick={addSelectedToPantry}
                        className="text-[#8B4513] hover:text-[#7A3E11] font-medium 
                                 transition-colors duration-200"
                      >
                        Save to Pantry
                      </button>
                    )}
                  </div>

                  <IngredientInput
                    selectedIngredients={selectedIngredients}
                    onIngredientsChange={setSelectedIngredients}
                    showQuantity={true}
                    maxIngredients={15}
                  />

                  {/* Pantry Suggestion */}
                  {selectedIngredients.length === 0 &&
                    pantryIngredients.length > 0 && (
                      <div className="mt-8 p-6 bg-[#8B4513] text-white rounded">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-2xl">💡</span>
                          <span className="font-semibold">
                            Quick Suggestion
                          </span>
                        </div>
                        <p className="mb-4 opacity-90">
                          You have {pantryIngredients.length} ingredients in
                          your pantry. Use them to find recipes you can make
                          right now!
                        </p>
                        <Button
                          variant="secondary"
                          onClick={usePantryIngredients}
                          className="bg-white text-[#8B4513] hover:bg-[#F5F5F5]"
                        >
                          Use My Pantry ({pantryIngredients.length} ingredients)
                        </Button>
                      </div>
                    )}
                </div>

                {/* Right Column - Recipe Results */}
                <div>
                  <RecipesByIngredients
                    selectedIngredients={selectedIngredients}
                    onRecipeSelect={handleRecipeSelect}
                  />
                </div>
              </div>
            ) : (
              /* Pantry Management Tab */
              <div className="max-w-4xl mx-auto">
                <div className="card-minimal p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                    <div>
                      <h2 className="font-poppins text-2xl font-semibold text-[#121212] mb-2">
                        My Pantry
                      </h2>
                      <p className="text-[#6B7280]">
                        Manage your available ingredients for quick recipe
                        suggestions
                      </p>
                    </div>
                    <div className="flex gap-3">
                      {pantryIngredients.length > 0 && (
                        <>
                          <Button
                            variant="primary"
                            onClick={usePantryIngredients}
                          >
                            🔍 Find Recipes
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={clearPantry}
                            className="text-[#6B7280] hover:text-[#121212]"
                          >
                            Clear All
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Pantry Ingredient Manager */}
                  <IngredientInput
                    selectedIngredients={pantryIngredients}
                    onIngredientsChange={setPantryIngredients}
                    placeholder="Add ingredients to your pantry..."
                    showQuantity={true}
                    maxIngredients={50}
                  />

                  {/* Pantry Stats */}
                  {pantryIngredients.length > 0 && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-6 bg-[#F5F5F5] rounded">
                        <div className="text-3xl font-poppins font-bold text-[#8B4513] mb-2">
                          {pantryIngredients.length}
                        </div>
                        <div className="text-sm font-medium text-[#6B7280]">
                          Total Ingredients
                        </div>
                      </div>
                      <div className="text-center p-6 bg-[#F5F5F5] rounded">
                        <div className="text-3xl font-poppins font-bold text-[#8B4513] mb-2">
                          {
                            pantryIngredients.filter(
                              (ing) => ing.quantity && ing.quantity > 0
                            ).length
                          }
                        </div>
                        <div className="text-sm font-medium text-[#6B7280]">
                          With Quantities
                        </div>
                      </div>
                      <div className="text-center p-6 bg-[#F5F5F5] rounded">
                        <div className="text-3xl font-poppins font-bold text-[#8B4513] mb-2">
                          {
                            new Set(
                              pantryIngredients.map((ing) => {
                                const name = ing.name.toLowerCase();
                                if (
                                  name.includes("meat") ||
                                  name.includes("chicken") ||
                                  name.includes("beef")
                                )
                                  return "Protein";
                                if (
                                  name.includes("onion") ||
                                  name.includes("tomato") ||
                                  name.includes("pepper")
                                )
                                  return "Vegetables";
                                if (
                                  name.includes("rice") ||
                                  name.includes("pasta") ||
                                  name.includes("flour")
                                )
                                  return "Grains";
                                return "Other";
                              })
                            ).size
                          }
                        </div>
                        <div className="text-sm font-medium text-[#6B7280]">
                          Categories
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Empty Pantry State */}
                  {pantryIngredients.length === 0 && (
                    <div className="text-center py-16">
                      <div className="text-6xl mb-6">🥫</div>
                      <h3 className="font-poppins text-xl font-semibold text-[#121212] mb-3">
                        Your pantry is empty
                      </h3>
                      <p className="text-[#6B7280] mb-8 max-w-md mx-auto">
                        Add ingredients you have at home to get personalized
                        recipe suggestions
                      </p>
                      <Button
                        variant="primary"
                        onClick={() => setActiveTab("search")}
                      >
                        Start Adding Ingredients
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions Footer */}
        <section className="px-8 md:px-16 lg:px-24 py-12 bg-[#F5F5F5]">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="font-poppins text-lg font-semibold text-[#121212] mb-6">
              Quick Actions
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 px-4 py-2 text-[#6B7280] hover:text-[#121212] 
                         transition-colors duration-200"
              >
                <span>🏠</span>
                <span>Browse All Recipes</span>
              </button>
              <button
                onClick={() => router.push("/my-recipes")}
                className="flex items-center gap-2 px-4 py-2 text-[#6B7280] hover:text-[#121212] 
                         transition-colors duration-200"
              >
                <span>❤️</span>
                <span>My Favorites</span>
              </button>
              {pantryIngredients.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedIngredients([...pantryIngredients]);
                    setActiveTab("search");
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-[#8B4513] hover:text-[#7A3E11] 
                           transition-colors duration-200 font-medium"
                >
                  <span>🔍</span>
                  <span>Search with Pantry</span>
                </button>
              )}
            </div>
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
