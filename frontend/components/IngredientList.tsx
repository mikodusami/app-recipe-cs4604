"use client";

import React, { useState } from "react";
import { RecipeIngredient } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface IngredientListProps {
  ingredients: RecipeIngredient[];
  servings?: number;
  onServingsChange?: (servings: number) => void;
  showScaling?: boolean;
  className?: string;
}

export function IngredientList({
  ingredients,
  servings = 4,
  onServingsChange,
  showScaling = true,
  className,
}: IngredientListProps) {
  const [currentServings, setCurrentServings] = useState(servings);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(
    new Set()
  );

  const handleServingsChange = (newServings: number) => {
    if (newServings < 1) return;
    setCurrentServings(newServings);
    if (onServingsChange) {
      onServingsChange(newServings);
    }
  };

  const toggleIngredientCheck = (ingredientId: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(ingredientId)) {
      newChecked.delete(ingredientId);
    } else {
      newChecked.add(ingredientId);
    }
    setCheckedIngredients(newChecked);
  };

  const formatQuantity = (quantity: number, unit?: string) => {
    // Scale quantity based on servings
    const scaledQuantity = (quantity * currentServings) / servings;

    // Format the number nicely
    let formattedQuantity: string;
    if (scaledQuantity % 1 === 0) {
      formattedQuantity = scaledQuantity.toString();
    } else if (scaledQuantity < 1) {
      // Convert to fraction for small amounts
      const fraction = toFraction(scaledQuantity);
      formattedQuantity = fraction;
    } else {
      formattedQuantity = scaledQuantity.toFixed(2).replace(/\.?0+$/, "");
    }

    return unit ? `${formattedQuantity} ${unit}` : formattedQuantity;
  };

  const toFraction = (decimal: number): string => {
    const tolerance = 1.0e-6;
    let h1 = 1,
      h2 = 0,
      k1 = 0,
      k2 = 1;
    let b = decimal;

    do {
      const a = Math.floor(b);
      let aux = h1;
      h1 = a * h1 + h2;
      h2 = aux;
      aux = k1;
      k1 = a * k1 + k2;
      k2 = aux;
      b = 1 / (b - a);
    } while (Math.abs(decimal - h1 / k1) > decimal * tolerance);

    // Common fractions
    const commonFractions: { [key: string]: string } = {
      "0.25": "¼",
      "0.33": "⅓",
      "0.5": "½",
      "0.67": "⅔",
      "0.75": "¾",
    };

    const decimalStr = decimal.toFixed(2);
    if (commonFractions[decimalStr]) {
      return commonFractions[decimalStr];
    }

    return `${h1}/${k1}`;
  };

  const categorizeIngredient = (name: string): string => {
    const lowerName = name.toLowerCase();

    if (
      lowerName.includes("meat") ||
      lowerName.includes("chicken") ||
      lowerName.includes("beef") ||
      lowerName.includes("pork") ||
      lowerName.includes("fish") ||
      lowerName.includes("salmon")
    ) {
      return "Proteins";
    }

    if (
      lowerName.includes("onion") ||
      lowerName.includes("garlic") ||
      lowerName.includes("carrot") ||
      lowerName.includes("celery") ||
      lowerName.includes("pepper") ||
      lowerName.includes("tomato")
    ) {
      return "Vegetables";
    }

    if (
      lowerName.includes("flour") ||
      lowerName.includes("rice") ||
      lowerName.includes("pasta") ||
      lowerName.includes("bread")
    ) {
      return "Grains & Starches";
    }

    if (
      lowerName.includes("milk") ||
      lowerName.includes("cheese") ||
      lowerName.includes("butter") ||
      lowerName.includes("cream") ||
      lowerName.includes("yogurt")
    ) {
      return "Dairy";
    }

    if (
      lowerName.includes("salt") ||
      lowerName.includes("pepper") ||
      lowerName.includes("spice") ||
      lowerName.includes("herb") ||
      lowerName.includes("oregano") ||
      lowerName.includes("basil")
    ) {
      return "Seasonings";
    }

    return "Other";
  };

  // Group ingredients by category if available
  const groupedIngredients = ingredients.reduce((groups, ingredient) => {
    // For now, we'll use a simple categorization based on common ingredient types
    // In a real app, this would come from the ingredient data
    const category = categorizeIngredient(ingredient.ingredient_name || "");
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(ingredient);
    return groups;
  }, {} as Record<string, RecipeIngredient[]>);

  const getSubstituteSuggestions = (ingredientName: string): string[] => {
    // Simple substitution suggestions - in a real app, this would come from the API
    const substitutions: { [key: string]: string[] } = {
      butter: ["margarine", "coconut oil", "vegetable oil"],
      milk: ["almond milk", "soy milk", "oat milk"],
      eggs: ["flax eggs", "applesauce", "banana"],
      flour: ["almond flour", "coconut flour", "oat flour"],
      sugar: ["honey", "maple syrup", "stevia"],
    };

    const lowerName = ingredientName.toLowerCase();
    for (const [ingredient, subs] of Object.entries(substitutions)) {
      if (lowerName.includes(ingredient)) {
        return subs;
      }
    }
    return [];
  };

  return (
    <div className={cn("", className)}>
      {/* Serving Size Adjuster */}
      {showScaling && (
        <div className="mb-8 p-6 bg-[#F5F5F5] rounded">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#121212] tracking-wide">
              SERVINGS
            </span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleServingsChange(currentServings - 1)}
                disabled={currentServings <= 1}
                className="w-10 h-10 flex items-center justify-center rounded-full 
                         bg-white text-[#8B4513] hover:bg-[#E5E5E5] transition-colors duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
              >
                −
              </button>
              <span className="w-12 text-center font-poppins font-semibold text-xl text-[#121212]">
                {currentServings}
              </span>
              <button
                onClick={() => handleServingsChange(currentServings + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-full 
                         bg-white text-[#8B4513] hover:bg-[#E5E5E5] transition-colors duration-200
                         font-bold text-lg"
              >
                +
              </button>
            </div>
          </div>
          {currentServings !== servings && (
            <p className="text-xs text-[#6B7280] mt-3 text-center">
              Quantities adjusted for {currentServings} servings
            </p>
          )}
        </div>
      )}

      {/* Ingredients List */}
      <div className="space-y-8">
        {Object.entries(groupedIngredients).map(
          ([category, categoryIngredients]) => (
            <div key={category}>
              <h3
                className="text-sm font-semibold text-[#8B4513] tracking-wide mb-4 
                           border-b border-[#F5F5F5] pb-2"
              >
                {category.toUpperCase()}
              </h3>
              <div className="space-y-3">
                {categoryIngredients.map((ingredient, index) => {
                  const ingredientKey = `${ingredient.ingredient_id}-${index}`;
                  const isChecked = checkedIngredients.has(
                    ingredient.ingredient_id
                  );
                  const substitutes = getSubstituteSuggestions(
                    ingredient.ingredient_name || ""
                  );

                  return (
                    <div key={ingredientKey} className="group">
                      <div
                        className={cn(
                          "flex items-start gap-4 p-4 rounded cursor-pointer transition-all duration-200",
                          "min-h-[60px] touch-manipulation",
                          isChecked
                            ? "bg-[#8B4513] text-white"
                            : "bg-white hover:bg-[#F5F5F5] border border-[#F5F5F5]"
                        )}
                        onClick={() =>
                          toggleIngredientCheck(ingredient.ingredient_id)
                        }
                      >
                        {/* Checkbox */}
                        <div
                          className={cn(
                            "w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors shrink-0",
                            isChecked
                              ? "bg-white border-white"
                              : "border-[#E5E5E5] group-hover:border-[#8B4513]"
                          )}
                        >
                          {isChecked && (
                            <span className="text-[#8B4513] text-xs font-bold">
                              ✓
                            </span>
                          )}
                        </div>

                        {/* Ingredient Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-3">
                            <span
                              className={cn(
                                "font-semibold text-base",
                                isChecked
                                  ? "text-white line-through"
                                  : "text-[#8B4513]"
                              )}
                            >
                              {formatQuantity(
                                ingredient.quantity,
                                ingredient.unit
                              )}
                            </span>
                            <span
                              className={cn(
                                "text-base",
                                isChecked
                                  ? "text-white line-through"
                                  : "text-[#121212]"
                              )}
                            >
                              {ingredient.ingredient_name}
                            </span>
                          </div>

                          {/* Substitution Suggestions */}
                          {substitutes.length > 0 && !isChecked && (
                            <div className="mt-2 text-xs text-[#6B7280]">
                              <span className="font-medium">Substitutes:</span>{" "}
                              <span>{substitutes.join(", ")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}
      </div>

      {/* Shopping List Summary */}
      {checkedIngredients.size > 0 && (
        <div className="mt-8 p-4 bg-[#8B4513] text-white rounded">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {checkedIngredients.size} of {ingredients.length} ingredients
              checked
            </span>
            <button
              onClick={() => setCheckedIngredients(new Set())}
              className="text-sm font-medium hover:underline"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
