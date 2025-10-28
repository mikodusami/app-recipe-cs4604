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
    <div className={cn("bg-white", className)}>
      {/* Serving Size Adjuster - Mobile optimized */}
      {showScaling && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Servings:</span>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleServingsChange(currentServings - 1)}
                disabled={currentServings <= 1}
                className={cn(
                  "w-10 h-10 p-0 touch-manipulation",
                  "min-h-[44px] min-w-[44px]", // Better touch target
                  "text-lg font-bold",
                  "active:scale-90 transition-transform"
                )}
              >
                −
              </Button>
              <span className="w-12 text-center font-semibold text-lg">
                {currentServings}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleServingsChange(currentServings + 1)}
                className={cn(
                  "w-10 h-10 p-0 touch-manipulation",
                  "min-h-[44px] min-w-[44px]", // Better touch target
                  "text-lg font-bold",
                  "active:scale-90 transition-transform"
                )}
              >
                +
              </Button>
            </div>
          </div>
          {currentServings !== servings && (
            <p className="text-xs text-gray-500 mt-2">
              Quantities adjusted for {currentServings} servings
            </p>
          )}
        </div>
      )}

      {/* Ingredients List */}
      <div className="space-y-6">
        {Object.entries(groupedIngredients).map(
          ([category, categoryIngredients]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                {category}
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
                          "flex items-start gap-3 p-3 sm:p-4 rounded-lg border transition-all cursor-pointer touch-manipulation",
                          "min-h-[60px]", // Minimum touch target height
                          "active:scale-[0.98] active:shadow-sm transition-transform",
                          isChecked
                            ? "bg-green-50 border-green-200 shadow-sm"
                            : "bg-white border-gray-200 hover:bg-gray-50 hover:shadow-sm"
                        )}
                        onClick={() =>
                          toggleIngredientCheck(ingredient.ingredient_id)
                        }
                      >
                        {/* Checkbox - Larger for mobile */}
                        <div
                          className={cn(
                            "w-6 h-6 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center mt-1 transition-colors shrink-0",
                            isChecked
                              ? "bg-green-500 border-green-500"
                              : "border-gray-300 group-hover:border-gray-400"
                          )}
                        >
                          {isChecked && (
                            <span className="text-white text-xs font-bold">
                              ✓
                            </span>
                          )}
                        </div>

                        {/* Ingredient Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                                <span
                                  className={cn(
                                    "font-medium text-sm sm:text-base",
                                    isChecked
                                      ? "text-green-800 line-through"
                                      : "text-gray-900"
                                  )}
                                >
                                  {formatQuantity(
                                    ingredient.quantity,
                                    ingredient.unit
                                  )}
                                </span>
                                <span
                                  className={cn(
                                    "text-sm sm:text-base wrap-break-word",
                                    isChecked
                                      ? "text-green-700 line-through"
                                      : "text-gray-700"
                                  )}
                                >
                                  {ingredient.ingredient_name}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Substitution Suggestions */}
                          {substitutes.length > 0 && (
                            <div className="mt-2 text-xs sm:text-xs text-gray-500">
                              <span className="font-medium">Substitutes:</span>{" "}
                              <span className="wrap-break-word">
                                {substitutes.join(", ")}
                              </span>
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
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-800">
              {checkedIngredients.size} of {ingredients.length} ingredients
              checked
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCheckedIngredients(new Set())}
              className="text-green-700 hover:text-green-800"
            >
              Clear all
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
