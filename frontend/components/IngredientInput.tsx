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
      {/* Search Input */}
      <div className="relative mb-6">
        <Input
          ref={inputRef}
          type="search"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pr-12 text-base min-h-[48px] touch-manipulation"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
        />

        {/* Clear Search Button */}
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSearchResults([]);
              setShowCommonIngredients(true);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center
                     text-[#6B7280] hover:text-[#121212] transition-colors duration-200
                     touch-manipulation rounded-full hover:bg-[#F5F5F5]"
          >
            <span className="font-bold text-sm">✕</span>
          </button>
        )}

        {/* Search Suggestions */}
        {showSuggestions && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#F5F5F5] 
                     rounded shadow-sm z-50 max-h-80 overflow-y-auto touch-manipulation"
          >
            {loading && (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8B4513] mx-auto mb-3"></div>
                <span className="text-[#6B7280] font-medium">Searching...</span>
              </div>
            )}

            {/* Search Results */}
            {!loading && searchResults.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-[#8B4513] tracking-wide mb-2">
                  SEARCH RESULTS
                </div>
                {searchResults.map((ingredient) => (
                  <button
                    key={ingredient.id}
                    onClick={async () => await addIngredient(ingredient)}
                    className="w-full text-left px-4 py-3 hover:bg-[#F5F5F5] rounded transition-colors duration-200
                             flex items-center gap-3 touch-manipulation min-h-[48px]"
                  >
                    <div className="w-2 h-2 bg-[#8B4513] rounded-full shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[#121212]">
                        {ingredient.name}
                      </div>
                      {ingredient.category && (
                        <div className="text-xs text-[#6B7280] mt-0.5">
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
              <div className="p-6 text-center">
                <div className="text-[#6B7280] font-poppins font-bold text-lg mb-2">
                  NO RESULTS
                </div>
                <div className="text-sm text-[#6B7280]">
                  No ingredients found for "{searchQuery}"
                </div>
              </div>
            )}

            {/* Common Ingredients */}
            {!loading &&
              showCommonIngredients &&
              availableCommonIngredients.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-[#8B4513] tracking-wide mb-2">
                    COMMON INGREDIENTS
                  </div>
                  {availableCommonIngredients.slice(0, 8).map((ingredient) => (
                    <button
                      key={ingredient.id}
                      onClick={async () => await addIngredient(ingredient)}
                      className="w-full text-left px-4 py-3 hover:bg-[#F5F5F5] rounded transition-colors duration-200
                               flex items-center gap-3 touch-manipulation min-h-[48px]"
                    >
                      <div className="w-2 h-2 bg-[#6B7280] rounded-full shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[#121212]">
                          {ingredient.name}
                        </div>
                        <div className="text-xs text-[#6B7280] mt-0.5">
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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#121212] tracking-wide">
              SELECTED INGREDIENTS ({selectedIngredients.length})
            </h3>
            <button
              onClick={clearAllIngredients}
              className="text-[#6B7280] hover:text-[#121212] font-medium transition-colors duration-200"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-3">
            {selectedIngredients.map((ingredient) => (
              <div
                key={ingredient.id}
                className="flex items-center gap-4 p-4 bg-[#F5F5F5] rounded border border-[#E5E5E5]"
              >
                <div className="w-3 h-3 bg-[#8B4513] rounded-full shrink-0"></div>

                <div className="flex-1">
                  {editingIngredient === ingredient.id ? (
                    /* Edit Mode */
                    <div className="flex items-center gap-3">
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
                            className="px-3 py-2 border border-[#E5E5E5] rounded text-sm bg-white"
                          >
                            {COMMON_UNITS.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </>
                      )}
                      <span className="font-medium text-[#121212]">
                        {ingredient.name}
                      </span>
                      <div className="flex gap-2 ml-auto">
                        <button
                          onClick={saveIngredientEdit}
                          className="text-[#8B4513] hover:text-[#7A3E11] font-medium px-2 py-1"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelIngredientEdit}
                          className="text-[#6B7280] hover:text-[#121212] font-medium px-2 py-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Mode */
                    <div className="flex items-center justify-between">
                      <div>
                        {showQuantity && ingredient.quantity && (
                          <span className="font-semibold text-[#8B4513] mr-3">
                            {ingredient.quantity} {ingredient.unit}
                          </span>
                        )}
                        <span className="font-medium text-[#121212]">
                          {ingredient.name}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {showQuantity && (
                          <button
                            onClick={() => startEditingIngredient(ingredient)}
                            className="text-[#6B7280] hover:text-[#121212] font-medium px-2 py-1"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => removeIngredient(ingredient.id)}
                          className="text-[#6B7280] hover:text-[#121212] font-medium px-2 py-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Ingredient Limit Warning */}
          {selectedIngredients.length >= maxIngredients && (
            <div className="text-sm text-[#8B4513] bg-[#F5F5F5] border border-[#E5E5E5] rounded p-4">
              Maximum of {maxIngredients} ingredients reached. Remove some to
              add more.
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {selectedIngredients.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🥕</div>
          <div className="font-poppins font-bold text-xl text-[#8B4513] mb-3">
            No Ingredients Selected
          </div>
          <p className="text-[#6B7280]">
            Start typing to search for ingredients or select from common
            ingredients above
          </p>
        </div>
      )}
    </div>
  );
}
