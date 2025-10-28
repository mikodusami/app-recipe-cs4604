"use client";

import React, { useState, useEffect } from "react";
import { recipeService, ingredientService, Ingredient } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export interface RecipeFiltersState {
  category?: string;
  maxCookTime?: number;
  maxPrepTime?: number;
  ingredients?: string[];
  dietaryRestrictions?: string[];
}

interface RecipeFiltersProps {
  filters: RecipeFiltersState;
  onFiltersChange: (filters: RecipeFiltersState) => void;
  isOpen: boolean;
  onClose?: () => void;
  className?: string;
}

const DIETARY_RESTRICTIONS = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten-Free" },
  { id: "dairy-free", label: "Dairy-Free" },
  { id: "low-carb", label: "Low-Carb" },
  { id: "keto", label: "Keto" },
];

const TIME_OPTIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
];

export function RecipeFilters({
  filters,
  onFiltersChange,
  isOpen,
  onClose,
  className,
}: RecipeFiltersProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<
    Ingredient[]
  >([]);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [showIngredientSearch, setShowIngredientSearch] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingIngredients, setLoadingIngredients] = useState(false);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Search ingredients when search term changes
  useEffect(() => {
    if (ingredientSearch.trim().length > 2) {
      searchIngredients(ingredientSearch);
    } else {
      setAvailableIngredients([]);
    }
  }, [ingredientSearch]);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await recipeService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const searchIngredients = async (query: string) => {
    setLoadingIngredients(true);
    try {
      const response = await ingredientService.searchIngredients(query, 10);
      if (response.success && response.data) {
        setAvailableIngredients(response.data);
      }
    } catch (error) {
      console.error("Failed to search ingredients:", error);
    } finally {
      setLoadingIngredients(false);
    }
  };

  const updateFilters = (updates: Partial<RecipeFiltersState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const handleCategoryChange = (category: string) => {
    updateFilters({
      category: filters.category === category ? undefined : category,
    });
  };

  const handleTimeChange = (
    timeType: "maxCookTime" | "maxPrepTime",
    value: number
  ) => {
    updateFilters({
      [timeType]: filters[timeType] === value ? undefined : value,
    });
  };

  const handleDietaryRestrictionToggle = (restriction: string) => {
    const current = filters.dietaryRestrictions || [];
    const updated = current.includes(restriction)
      ? current.filter((r) => r !== restriction)
      : [...current, restriction];

    updateFilters({
      dietaryRestrictions: updated.length > 0 ? updated : undefined,
    });
  };

  const handleIngredientToggle = (ingredientName: string) => {
    const current = filters.ingredients || [];
    const updated = current.includes(ingredientName)
      ? current.filter((i) => i !== ingredientName)
      : [...current, ingredientName];

    updateFilters({
      ingredients: updated.length > 0 ? updated : undefined,
    });
  };

  const handleReset = () => {
    onFiltersChange({});
    setIngredientSearch("");
    setShowIngredientSearch(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.maxCookTime) count++;
    if (filters.maxPrepTime) count++;
    if (filters.ingredients?.length) count++;
    if (filters.dietaryRestrictions?.length) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-lg shadow-lg",
        "p-4 sm:p-6 touch-manipulation",
        className
      )}
    >
      {/* Header - Mobile optimized */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Filters
          </h3>
          {activeFiltersCount > 0 && (
            <span className="bg-orange-100 text-orange-800 text-xs sm:text-sm font-medium px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className={cn(
                "touch-manipulation min-h-[44px] px-3",
                "active:scale-95 transition-transform"
              )}
            >
              Reset
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={cn(
                "touch-manipulation min-h-[44px] min-w-[44px]",
                "active:scale-95 transition-transform"
              )}
            >
              <span className="text-gray-500 font-bold text-sm">✕</span>
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Categories */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Category</h4>
          {loadingCategories ? (
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 sm:h-8 w-20 bg-gray-200 rounded animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={cn(
                    "px-3 py-2 sm:py-1.5 text-sm font-medium rounded-full border transition-all touch-manipulation",
                    "min-h-[40px] sm:min-h-[32px]", // Better touch targets
                    "active:scale-95 transition-transform",
                    filters.category === category
                      ? "bg-orange-100 border-orange-300 text-orange-800 shadow-sm"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:shadow-sm"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cooking Time */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Max Cooking Time
          </h4>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            {TIME_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleTimeChange("maxCookTime", option.value)}
                className={cn(
                  "px-3 py-2 sm:py-1.5 text-sm font-medium rounded-full border transition-all touch-manipulation",
                  "min-h-[40px] sm:min-h-[32px]", // Better touch targets
                  "active:scale-95 transition-transform",
                  filters.maxCookTime === option.value
                    ? "bg-orange-100 border-orange-300 text-orange-800 shadow-sm"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:shadow-sm"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prep Time */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Max Prep Time
          </h4>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            {TIME_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleTimeChange("maxPrepTime", option.value)}
                className={cn(
                  "px-3 py-2 sm:py-1.5 text-sm font-medium rounded-full border transition-all touch-manipulation",
                  "min-h-[40px] sm:min-h-[32px]", // Better touch targets
                  "active:scale-95 transition-transform",
                  filters.maxPrepTime === option.value
                    ? "bg-orange-100 border-orange-300 text-orange-800 shadow-sm"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:shadow-sm"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Dietary Restrictions
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-2">
            {DIETARY_RESTRICTIONS.map((restriction) => (
              <button
                key={restriction.id}
                onClick={() => handleDietaryRestrictionToggle(restriction.id)}
                className={cn(
                  "px-3 py-2 sm:py-1.5 text-sm font-medium rounded-full border transition-all touch-manipulation",
                  "flex items-center justify-center sm:justify-start gap-2",
                  "min-h-[40px] sm:min-h-[32px]", // Better touch targets
                  "active:scale-95 transition-transform",
                  filters.dietaryRestrictions?.includes(restriction.id)
                    ? "bg-green-100 border-green-300 text-green-800 shadow-sm"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:shadow-sm"
                )}
              >
                <span className="font-bold text-sm">{restriction.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Ingredients</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowIngredientSearch(!showIngredientSearch)}
              className={cn(
                "touch-manipulation min-h-[40px] px-3",
                "active:scale-95 transition-transform"
              )}
            >
              {showIngredientSearch ? "Hide" : "Add"}
            </Button>
          </div>

          {/* Selected Ingredients */}
          {filters.ingredients && filters.ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {filters.ingredients.map((ingredient) => (
                <button
                  key={ingredient}
                  onClick={() => handleIngredientToggle(ingredient)}
                  className={cn(
                    "px-3 py-2 sm:py-1.5 text-sm font-medium rounded-full",
                    "bg-blue-100 border border-blue-300 text-blue-800 hover:bg-blue-200",
                    "transition-all touch-manipulation",
                    "flex items-center gap-2 min-h-[36px]",
                    "active:scale-95 transition-transform"
                  )}
                >
                  <span className="wrap-break-word">{ingredient}</span>
                  <span className="text-blue-600 font-bold text-xs">
                    REMOVE
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Ingredient Search */}
          {showIngredientSearch && (
            <div className="space-y-3">
              <Input
                type="search"
                placeholder="Search ingredients..."
                value={ingredientSearch}
                onChange={(e) => setIngredientSearch(e.target.value)}
                className={cn("text-base min-h-[48px] touch-manipulation")}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
              />

              {loadingIngredients && (
                <div className="text-sm text-gray-500 px-2">Searching...</div>
              )}

              {availableIngredients.length > 0 && (
                <div className="max-h-48 sm:max-h-32 overflow-y-auto border border-gray-200 rounded-md touch-manipulation">
                  {availableIngredients.map((ingredient) => (
                    <button
                      key={ingredient.id}
                      onClick={() => {
                        handleIngredientToggle(ingredient.name);
                        setIngredientSearch("");
                      }}
                      className={cn(
                        "w-full text-left px-3 py-3 sm:py-2 hover:bg-gray-50 transition-colors",
                        "text-sm touch-manipulation min-h-[48px] sm:min-h-[36px]",
                        "active:bg-gray-100 border-b border-gray-100 last:border-b-0"
                      )}
                    >
                      <div className="wrap-break-word">
                        {ingredient.name}
                        {ingredient.category && (
                          <span className="text-gray-500 ml-2 text-xs">
                            ({ingredient.category})
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
