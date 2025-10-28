"use client";

import React, { useState, useEffect, useRef } from "react";
import { ingredientService, Ingredient } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface SelectedIngredient {
  id: number;
  name: string;
  quantity?: number;
  unit?: string;
}

interface IngredientInputProps {
  selectedIngredients: SelectedIngredient[];
  onIngredientsChange: (ingredients: SelectedIngredient[]) => void;
  placeholder?: string;
  showQuantity?: boolean;
  maxIngredients?: number;
  className?: string;
}

const COMMON_INGREDIENTS = [
  { id: -1, name: "Chicken Breast", category: "Meat" },
  { id: -2, name: "Ground Beef", category: "Meat" },
  { id: -3, name: "Large Egg", category: "Dairy" },
  { id: -4, name: "Onion", category: "Produce" },
  { id: -5, name: "Garlic", category: "Produce" },
  { id: -6, name: "Tomato", category: "Produce" },
  { id: -7, name: "Bell Pepper", category: "Produce" },
  { id: -8, name: "Rice", category: "Pantry" },
  { id: -9, name: "Spaghetti", category: "Pantry" },
  { id: -10, name: "All-Purpose Flour", category: "Pantry" },
  { id: -11, name: "Olive Oil", category: "Pantry" },
  { id: -12, name: "Butter", category: "Dairy" },
];

const COMMON_UNITS = [
  "cups",
  "tbsp",
  "tsp",
  "oz",
  "lbs",
  "g",
  "kg",
  "ml",
  "l",
  "pieces",
  "cloves",
  "slices",
];

export function IngredientInput({
  selectedIngredients,
  onIngredientsChange,
  placeholder = "Search for ingredients...",
  showQuantity = true,
  maxIngredients = 20,
  className,
}: IngredientInputProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Ingredient[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCommonIngredients, setShowCommonIngredients] = useState(true);
  const [editingIngredient, setEditingIngredient] = useState<number | null>(
    null
  );
  const [editQuantity, setEditQuantity] = useState("");
  const [editUnit, setEditUnit] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Search ingredients with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length > 1) {
        searchIngredients(searchQuery);
      } else {
        setSearchResults([]);
        setShowCommonIngredients(true);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchIngredients = async (query: string) => {
    setLoading(true);
    setShowCommonIngredients(false);

    try {
      const response = await ingredientService.searchIngredients(query, 10);
      if (response.success && response.data) {
        // Filter out already selected ingredients
        const filtered = response.data.filter(
          (ingredient) =>
            !selectedIngredients.some(
              (selected) => selected.id === ingredient.id
            )
        );
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error("Failed to search ingredients:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(true);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const addIngredient = async (
    ingredient: Ingredient | { id: number; name: string }
  ) => {
    if (selectedIngredients.length >= maxIngredients) {
      return;
    }

    let finalIngredient = ingredient;

    // If this is a common ingredient with negative ID, search for the real ingredient
    if (ingredient.id < 0) {
      console.log("Searching for real ingredient:", ingredient.name);
      try {
        const response = await ingredientService.searchIngredients(
          ingredient.name,
          1
        );
        console.log("Search response:", response);
        if (response.success && response.data && response.data.length > 0) {
          // Use the first matching ingredient from the database
          finalIngredient = response.data[0];
          console.log("Found real ingredient:", finalIngredient);
        } else {
          console.log("No matching ingredient found for:", ingredient.name);
        }
      } catch (error) {
        console.error("Failed to find real ingredient:", error);
        // Continue with the placeholder ingredient if search fails
      }
    }

    const newIngredient: SelectedIngredient = {
      id: finalIngredient.id,
      name: finalIngredient.name,
      quantity: showQuantity ? 1 : undefined,
      unit: showQuantity ? "pieces" : undefined,
    };

    onIngredientsChange([...selectedIngredients, newIngredient]);
    setSearchQuery("");
    setShowSuggestions(false);
    setSearchResults([]);
    setShowCommonIngredients(true);
  };

  const removeIngredient = (ingredientId: number) => {
    const updated = selectedIngredients.filter(
      (ing) => ing.id !== ingredientId
    );
    onIngredientsChange(updated);
  };

  const startEditingIngredient = (ingredient: SelectedIngredient) => {
    setEditingIngredient(ingredient.id);
    setEditQuantity(ingredient.quantity?.toString() || "1");
    setEditUnit(ingredient.unit || "pieces");
  };

  const saveIngredientEdit = () => {
    if (editingIngredient === null) return;

    const updated = selectedIngredients.map((ing) =>
      ing.id === editingIngredient
        ? {
            ...ing,
            quantity: parseFloat(editQuantity) || 1,
            unit: editUnit,
          }
        : ing
    );

    onIngredientsChange(updated);
    setEditingIngredient(null);
    setEditQuantity("");
    setEditUnit("");
  };

  const cancelIngredientEdit = () => {
    setEditingIngredient(null);
    setEditQuantity("");
    setEditUnit("");
  };

  const clearAllIngredients = () => {
    onIngredientsChange([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  // Get available common ingredients (not already selected)
  const availableCommonIngredients = COMMON_INGREDIENTS.filter(
    (ingredient) =>
      !selectedIngredients.some((selected) => selected.name === ingredient.name)
  );

  return (
    <div className={cn("w-full", className)}>
      {/* Search Input - Mobile optimized */}
      <div className="relative mb-4">
        <Input
          ref={inputRef}
          type="search" // Better mobile keyboard
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "pr-12 text-base", // Larger text for mobile
            "min-h-[48px] touch-manipulation" // Better touch target
          )}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
        />

        {/* Clear Search Button - Mobile optimized */}
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSearchResults([]);
              setShowCommonIngredients(true);
            }}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2",
              "w-8 h-8 flex items-center justify-center",
              "text-gray-400 hover:text-gray-600 transition-colors",
              "touch-manipulation rounded-full hover:bg-gray-100",
              "min-h-[32px] min-w-[32px]" // Better touch target
            )}
          >
            <span className="text-gray-500 font-bold text-sm">✕</span>
          </button>
        )}

        {/* Search Suggestions - Mobile optimized */}
        {showSuggestions && (
          <div
            ref={suggestionsRef}
            className={cn(
              "absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50",
              "max-h-64 sm:max-h-80 overflow-y-auto touch-manipulation"
            )}
          >
            {loading && (
              <div className="p-4 text-center text-gray-500">
                <span className="text-orange-500 font-bold">SEARCHING...</span>
              </div>
            )}

            {/* Search Results */}
            {!loading && searchResults.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Search Results
                </div>
                {searchResults.map((ingredient) => (
                  <button
                    key={ingredient.id}
                    onClick={async () => await addIngredient(ingredient)}
                    className={cn(
                      "w-full text-left px-3 py-3 sm:py-2 hover:bg-gray-50 rounded-md transition-colors",
                      "flex items-center gap-3 touch-manipulation",
                      "min-h-[48px] sm:min-h-[36px]", // Better touch targets
                      "active:bg-gray-100"
                    )}
                  >
                    <span className="text-green-500 font-bold text-xs">
                      INGREDIENT
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-base sm:text-sm wrap-break-word">
                        {ingredient.name}
                      </div>
                      {ingredient.category && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {ingredient.category}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && searchQuery.trim() && searchResults.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <div className="text-gray-500 font-bold text-lg mb-2">
                  NO RESULTS
                </div>
                <div className="text-sm">
                  No ingredients found for "{searchQuery}"
                </div>
              </div>
            )}

            {/* Common Ingredients */}
            {!loading &&
              showCommonIngredients &&
              availableCommonIngredients.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Common Ingredients
                  </div>
                  {availableCommonIngredients.slice(0, 8).map((ingredient) => (
                    <button
                      key={ingredient.id}
                      onClick={async () => await addIngredient(ingredient)}
                      className={cn(
                        "w-full text-left px-3 py-3 sm:py-2 hover:bg-gray-50 rounded-md transition-colors",
                        "flex items-center gap-3 touch-manipulation",
                        "min-h-[48px] sm:min-h-[36px]", // Better touch targets
                        "active:bg-gray-100"
                      )}
                    >
                      <span className="text-orange-500 font-bold text-xs">
                        COMMON
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-base sm:text-sm wrap-break-word">
                          {ingredient.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {ingredient.category}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
          </div>
        )}
      </div>

      {/* Selected Ingredients */}
      {selectedIngredients.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">
              Selected Ingredients ({selectedIngredients.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllIngredients}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear all
            </Button>
          </div>

          <div className="space-y-2">
            {selectedIngredients.map((ingredient) => (
              <div
                key={ingredient.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
              >
                <span className="text-green-500 font-bold text-xs">ITEM</span>

                <div className="flex-1">
                  {editingIngredient === ingredient.id ? (
                    /* Edit Mode */
                    <div className="flex items-center gap-2">
                      {showQuantity && (
                        <>
                          <Input
                            type="number"
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(e.target.value)}
                            className="w-20"
                            min="0"
                            step="0.1"
                          />
                          <select
                            value={editUnit}
                            onChange={(e) => setEditUnit(e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            {COMMON_UNITS.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </>
                      )}
                      <span className="font-medium">{ingredient.name}</span>
                      <div className="flex gap-1 ml-auto">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={saveIngredientEdit}
                          className="text-green-600 hover:text-green-700 px-2"
                        >
                          <span className="font-bold text-xs">SAVE</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelIngredientEdit}
                          className="text-gray-500 hover:text-gray-600 px-2"
                        >
                          <span className="font-bold text-xs">CANCEL</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Display Mode */
                    <div className="flex items-center justify-between">
                      <div>
                        {showQuantity && ingredient.quantity && (
                          <span className="font-medium text-orange-600 mr-2">
                            {ingredient.quantity} {ingredient.unit}
                          </span>
                        )}
                        <span className="font-medium">{ingredient.name}</span>
                      </div>
                      <div className="flex gap-1">
                        {showQuantity && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditingIngredient(ingredient)}
                            className="text-gray-500 hover:text-gray-700 px-2"
                          >
                            <span className="font-bold text-xs">EDIT</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIngredient(ingredient.id)}
                          className="text-red-500 hover:text-red-600 px-2"
                        >
                          <span className="font-bold text-xs">REMOVE</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Ingredient Limit Warning */}
          {selectedIngredients.length >= maxIngredients && (
            <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
              Maximum of {maxIngredients} ingredients reached. Remove some to
              add more.
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {selectedIngredients.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-green-600 font-bold text-xl mb-2">
            INGREDIENTS
          </div>
          <p className="text-sm">
            Start typing to search for ingredients or select from common
            ingredients above
          </p>
        </div>
      )}
    </div>
  );
}
