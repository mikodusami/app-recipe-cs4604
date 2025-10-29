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
    <div className={cn("space-y-6", className)}>
      {/* Header - Clean, minimal */}
      {onClose && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="font-poppins text-lg font-semibold text-[#121212]">
              Filters
            </h3>
            {activeFiltersCount > 0 && (
              <span className="bg-[#8B4513] text-white text-xs font-semibold px-2 py-1 rounded-full">
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
                className="text-[#8B4513] hover:text-[#7A3E11] hover:bg-[#F5F5F5]"
              >
                Reset
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-[#6B7280] hover:text-[#121212] hover:bg-[#F5F5F5] p-2"
            >
              <span className="font-bold text-sm">✕</span>
            </Button>
          </div>
        </div>
      )}

      {/* Categories */}
      <div>
        <h4 className="text-sm font-semibold text-[#121212] mb-4 tracking-wide">
          CATEGORY
        </h4>
        {loadingCategories ? (
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-10 w-20 bg-[#F5F5F5] rounded animate-pulse"
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
                  "px-4 py-2 text-sm font-medium rounded transition-all duration-200",
                  "min-h-[40px] touch-manipulation",
                  filters.category === category
                    ? "bg-[#8B4513] text-white shadow-sm"
                    : "bg-[#F5F5F5] text-[#6B7280] hover:bg-[#E5E5E5] hover:text-[#121212]"
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
        <h4 className="text-sm font-semibold text-[#121212] mb-4 tracking-wide">
          COOKING TIME
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {TIME_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleTimeChange("maxCookTime", option.value)}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded transition-all duration-200",
                "min-h-[40px] touch-manipulation",
                filters.maxCookTime === option.value
                  ? "bg-[#8B4513] text-white shadow-sm"
                  : "bg-[#F5F5F5] text-[#6B7280] hover:bg-[#E5E5E5] hover:text-[#121212]"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prep Time */}
      <div>
        <h4 className="text-sm font-semibold text-[#121212] mb-4 tracking-wide">
          PREP TIME
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {TIME_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleTimeChange("maxPrepTime", option.value)}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded transition-all duration-200",
                "min-h-[40px] touch-manipulation",
                filters.maxPrepTime === option.value
                  ? "bg-[#8B4513] text-white shadow-sm"
                  : "bg-[#F5F5F5] text-[#6B7280] hover:bg-[#E5E5E5] hover:text-[#121212]"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dietary Restrictions */}
      <div>
        <h4 className="text-sm font-semibold text-[#121212] mb-4 tracking-wide">
          DIETARY
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {DIETARY_RESTRICTIONS.map((restriction) => (
            <button
              key={restriction.id}
              onClick={() => handleDietaryRestrictionToggle(restriction.id)}
              className={cn(
                "px-4 py-3 text-sm font-medium rounded transition-all duration-200",
                "flex items-center justify-start gap-3 min-h-[48px] touch-manipulation",
                filters.dietaryRestrictions?.includes(restriction.id)
                  ? "bg-[#8B4513] text-white shadow-sm"
                  : "bg-[#F5F5F5] text-[#6B7280] hover:bg-[#E5E5E5] hover:text-[#121212]"
              )}
            >
              <span className="w-4 h-4 rounded border-2 flex items-center justify-center">
                {filters.dietaryRestrictions?.includes(restriction.id) && (
                  <span className="text-xs">✓</span>
                )}
              </span>
              <span>{restriction.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-[#121212] tracking-wide">
            INGREDIENTS
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowIngredientSearch(!showIngredientSearch)}
            className="text-[#8B4513] hover:text-[#7A3E11] hover:bg-[#F5F5F5] px-3 py-1"
          >
            {showIngredientSearch ? "Hide" : "Add"}
          </Button>
        </div>

        {/* Selected Ingredients */}
        {filters.ingredients && filters.ingredients.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.ingredients.map((ingredient) => (
              <button
                key={ingredient}
                onClick={() => handleIngredientToggle(ingredient)}
                className="px-3 py-2 text-sm font-medium rounded bg-[#8B4513] text-white 
                         hover:bg-[#7A3E11] transition-colors duration-200 flex items-center gap-2"
              >
                <span>{ingredient}</span>
                <span className="text-xs">✕</span>
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
              className="text-base min-h-[48px]"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
            />

            {loadingIngredients && (
              <div className="text-sm text-[#6B7280] px-2">Searching...</div>
            )}

            {availableIngredients.length > 0 && (
              <div className="max-h-48 overflow-y-auto border border-[#F5F5F5] rounded">
                {availableIngredients.map((ingredient) => (
                  <button
                    key={ingredient.id}
                    onClick={() => {
                      handleIngredientToggle(ingredient.name);
                      setIngredientSearch("");
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-[#F5F5F5] transition-colors duration-200
                             text-sm border-b border-[#F5F5F5] last:border-b-0"
                  >
                    <div>
                      {ingredient.name}
                      {ingredient.category && (
                        <span className="text-[#6B7280] ml-2 text-xs">
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
  );
}
