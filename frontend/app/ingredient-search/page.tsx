"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const [selectedIngredients, setSelectedIngredients] = useState<
    SelectedIngredient[]
  >([]);
  const [pantryIngredients, setPantryIngredients] = useState<
    SelectedIngredient[]
  >([]);
  const [showPantryManager, setShowPantryManager] = useState(false);
  const [activeTab, setActiveTab] = useState<"search" | "pantry">("search");

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

  const removeFromPantry = (ingredientId: number) => {
    setPantryIngredients(
      pantryIngredients.filter((ing) => ing.id !== ingredientId)
    );
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
      setShowPantryManager(true);
    }
  };

  const getRecipeSuggestions = () => {
    if (pantryIngredients.length === 0) return null;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">💡</span>
            <span className="font-medium text-blue-900">Quick Suggestion</span>
          </div>
        </div>
        <p className="text-blue-800 text-sm mb-3">
          You have {pantryIngredients.length} ingredients in your pantry. Use
          them to find recipes you can make right now!
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={usePantryIngredients}
          className="border-blue-300 text-blue-700 hover:bg-blue-100"
        >
          Use My Pantry ({pantryIngredients.length} ingredients)
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Find Recipes by Ingredients
          </h1>
          <p className="text-lg text-muted-foreground">
            Select ingredients you have and discover recipes you can make
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-card rounded-lg p-1 border">
            <button
              onClick={() => setActiveTab("search")}
              className={cn(
                "px-6 py-2 rounded-md font-medium transition-colors",
                activeTab === "search"
                  ? "bg-orange-500 text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Recipe Search
            </button>
            <button
              onClick={() => setActiveTab("pantry")}
              className={cn(
                "px-6 py-2 rounded-md font-medium transition-colors relative",
                activeTab === "pantry"
                  ? "bg-orange-500 text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              My Pantry
              {pantryIngredients.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pantryIngredients.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {activeTab === "search" ? (
          /* Recipe Search Tab */
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Ingredient Selection */}
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-card-foreground">
                  Select Ingredients
                </h2>
                {selectedIngredients.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addSelectedToPantry}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    Save to Pantry
                  </Button>
                )}
              </div>

              <IngredientInput
                selectedIngredients={selectedIngredients}
                onIngredientsChange={setSelectedIngredients}
                showQuantity={true}
                maxIngredients={15}
              />

              {/* Pantry Suggestion */}
              {selectedIngredients.length === 0 && getRecipeSuggestions()}
            </div>

            {/* Right Column - Recipe Results */}
            <div className="bg-card rounded-lg border p-6">
              <RecipesByIngredients
                selectedIngredients={selectedIngredients}
                onRecipeSelect={handleRecipeSelect}
              />
            </div>
          </div>
        ) : (
          /* Pantry Management Tab */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    My Pantry
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Manage your available ingredients for quick recipe
                    suggestions
                  </p>
                </div>
                <div className="flex gap-2">
                  {pantryIngredients.length > 0 && (
                    <>
                      <Button
                        variant="secondary"
                        onClick={usePantryIngredients}
                      >
                        🔍 Find Recipes
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={clearPantry}
                        className="text-red-600 hover:text-red-700"
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
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {pantryIngredients.length}
                    </div>
                    <div className="text-sm text-blue-800">
                      Total Ingredients
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {
                        pantryIngredients.filter(
                          (ing) => ing.quantity && ing.quantity > 0
                        ).length
                      }
                    </div>
                    <div className="text-sm text-green-800">
                      With Quantities
                    </div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
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
                    <div className="text-sm text-purple-800">Categories</div>
                  </div>
                </div>
              )}

              {/* Empty Pantry State */}
              {pantryIngredients.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🥫</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Your pantry is empty
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Add ingredients you have at home to get personalized recipe
                    suggestions
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setActiveTab("search")}
                    >
                      Start Adding Ingredients
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/")}
                className="text-gray-600"
              >
                🏠 Browse All Recipes
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push("/my-recipes")}
                className="text-gray-600"
              >
                ❤️ My Favorites
              </Button>
              {pantryIngredients.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedIngredients([...pantryIngredients]);
                    setActiveTab("search");
                  }}
                  className="text-blue-600"
                >
                  🔍 Search with Pantry
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
