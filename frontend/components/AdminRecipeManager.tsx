"use client";

import React, { useState } from "react";
import { recipeService, ingredientService, Ingredient } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

interface AdminRecipeManagerProps {
  className?: string;
}

interface RecipeIngredient {
  ingredient_id: number;
  ingredient_name: string;
  quantity: number;
  unit: string;
}

interface RecipeStep {
  step_order: number;
  instruction: string;
  time_in_minutes?: number;
}

interface RecipeFormData {
  name: string;
  category: string;
  prep_time_in_minutes: number;
  cook_time_in_minutes: number;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
}

const COMMON_CATEGORIES = [
  "Appetizers",
  "Main Course",
  "Side Dishes",
  "Desserts",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snacks",
  "Beverages",
  "Salads",
  "Soups",
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
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

export function AdminRecipeManager({ className }: AdminRecipeManagerProps) {
  const [formData, setFormData] = useState<RecipeFormData>({
    name: "",
    category: "",
    prep_time_in_minutes: 0,
    cook_time_in_minutes: 0,
    ingredients: [],
    steps: [],
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Ingredient search state
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [ingredientResults, setIngredientResults] = useState<Ingredient[]>([]);
  const [searchingIngredients, setSearchingIngredients] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("time") ? parseInt(value) || 0 : value,
    }));

    // Clear messages when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const searchIngredients = async (query: string) => {
    if (query.trim().length < 2) {
      setIngredientResults([]);
      return;
    }

    setSearchingIngredients(true);
    try {
      const response = await ingredientService.searchIngredients(query, 10);
      if (response.success && response.data) {
        setIngredientResults(response.data);
      }
    } catch (error) {
      console.error("Failed to search ingredients:", error);
    } finally {
      setSearchingIngredients(false);
    }
  };

  const addIngredient = (ingredient: Ingredient) => {
    const newIngredient: RecipeIngredient = {
      ingredient_id: ingredient.id,
      ingredient_name: ingredient.name,
      quantity: 1,
      unit: "pieces",
    };

    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient],
    }));

    setIngredientSearch("");
    setIngredientResults([]);
  };

  const updateIngredient = (
    index: number,
    field: keyof RecipeIngredient,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      ),
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const addStep = () => {
    const newStep: RecipeStep = {
      step_order: formData.steps.length + 1,
      instruction: "",
      time_in_minutes: undefined,
    };

    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
  };

  const updateStep = (index: number, field: keyof RecipeStep, value: any) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((step, i) =>
        i === index
          ? {
              ...step,
              [field]:
                field === "time_in_minutes"
                  ? parseInt(value) || undefined
                  : value,
            }
          : step
      ),
    }));
  };

  const removeStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps
        .filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, step_order: i + 1 })),
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return "Recipe name is required";
    if (!formData.category.trim()) return "Category is required";
    if (formData.ingredients.length === 0)
      return "At least one ingredient is required";
    if (formData.steps.length === 0) return "At least one step is required";

    // Validate ingredients
    for (const ingredient of formData.ingredients) {
      if (!ingredient.ingredient_name.trim())
        return "All ingredients must have a name";
      if (ingredient.quantity <= 0)
        return "All ingredients must have a positive quantity";
      if (!ingredient.unit.trim()) return "All ingredients must have a unit";
    }

    // Validate steps
    for (const step of formData.steps) {
      if (!step.instruction.trim()) return "All steps must have instructions";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await recipeService.createRecipe({
        name: formData.name.trim(),
        category: formData.category.trim(),
        prep_time_in_minutes: formData.prep_time_in_minutes || undefined,
        cook_time_in_minutes: formData.cook_time_in_minutes || undefined,
        ingredients: formData.ingredients,
        steps: formData.steps,
      });

      if (response.success) {
        setSuccess(`Recipe "${formData.name}" created successfully!`);
        // Reset form
        setFormData({
          name: "",
          category: "",
          prep_time_in_minutes: 0,
          cook_time_in_minutes: 0,
          ingredients: [],
          steps: [],
        });
      } else {
        setError(response.error || "Failed to create recipe");
      }
    } catch (error) {
      console.error("Failed to create recipe:", error);
      setError("Failed to create recipe");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      prep_time_in_minutes: 0,
      cook_time_in_minutes: 0,
      ingredients: [],
      steps: [],
    });
    setError(null);
    setSuccess(null);
  };

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      <div className="card-minimal p-8">
        <div className="mb-8">
          <h2 className="font-poppins text-2xl font-semibold text-[#121212] mb-2">
            Create New Recipe
          </h2>
          <p className="text-[#6B7280]">
            Add a new recipe to the database for all users to discover
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-[#8B4513] text-white rounded">
            <p className="font-medium">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-[#F5F5F5] border border-[#E5E5E5] rounded">
            <p className="text-[#8B4513] font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-[#121212] tracking-wide">
              BASIC INFORMATION
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Recipe Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter recipe name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#121212] mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-[#F5F5F5] rounded bg-white text-[#121212]
                           focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:border-[#8B4513]
                           transition-colors duration-200"
                  required
                >
                  <option value="">Select a category</option>
                  {COMMON_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Prep Time (minutes)"
                  name="prep_time_in_minutes"
                  type="number"
                  value={formData.prep_time_in_minutes}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <Input
                  label="Cook Time (minutes)"
                  name="cook_time_in_minutes"
                  type="number"
                  value={formData.cook_time_in_minutes}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#121212] tracking-wide">
                INGREDIENTS ({formData.ingredients.length})
              </h3>
            </div>

            {/* Ingredient Search */}
            <div className="relative">
              <Input
                label="Search and Add Ingredients"
                value={ingredientSearch}
                onChange={(e) => {
                  setIngredientSearch(e.target.value);
                  searchIngredients(e.target.value);
                }}
                placeholder="Search for ingredients..."
              />

              {/* Search Results */}
              {ingredientResults.length > 0 && (
                <div
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#F5F5F5] 
                             rounded shadow-sm z-50 max-h-60 overflow-y-auto"
                >
                  {ingredientResults.map((ingredient) => (
                    <button
                      key={ingredient.id}
                      type="button"
                      onClick={() => addIngredient(ingredient)}
                      className="w-full text-left px-4 py-3 hover:bg-[#F5F5F5] transition-colors duration-200
                               flex items-center gap-3"
                    >
                      <div className="w-2 h-2 bg-[#8B4513] rounded-full shrink-0"></div>
                      <div>
                        <div className="font-medium text-[#121212]">
                          {ingredient.name}
                        </div>
                        {ingredient.category && (
                          <div className="text-xs text-[#6B7280]">
                            {ingredient.category}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Ingredients List */}
            {formData.ingredients.length > 0 && (
              <div className="space-y-3">
                {formData.ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-[#F5F5F5] rounded"
                  >
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-2">
                        <span className="font-medium text-[#121212]">
                          {ingredient.ingredient_name}
                        </span>
                      </div>
                      <div>
                        <input
                          type="number"
                          value={ingredient.quantity}
                          onChange={(e) =>
                            updateIngredient(
                              index,
                              "quantity",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 border border-[#E5E5E5] rounded text-sm"
                          min="0"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <select
                          value={ingredient.unit}
                          onChange={(e) =>
                            updateIngredient(index, "unit", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-[#E5E5E5] rounded text-sm"
                        >
                          {COMMON_UNITS.map((unit) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="text-[#6B7280] hover:text-[#121212] p-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Steps Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#121212] tracking-wide">
                COOKING STEPS ({formData.steps.length})
              </h3>
              <Button type="button" onClick={addStep} variant="secondary">
                Add Step
              </Button>
            </div>

            {formData.steps.length > 0 && (
              <div className="space-y-4">
                {formData.steps.map((step, index) => (
                  <div key={index} className="p-4 bg-[#F5F5F5] rounded">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-[#8B4513] text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                        {step.step_order}
                      </div>
                      <div className="flex-1 space-y-3">
                        <textarea
                          value={step.instruction}
                          onChange={(e) =>
                            updateStep(index, "instruction", e.target.value)
                          }
                          placeholder="Enter step instructions..."
                          className="w-full px-3 py-2 border border-[#E5E5E5] rounded resize-none"
                          rows={3}
                          required
                        />
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium text-[#6B7280]">
                            Time (minutes):
                          </label>
                          <input
                            type="number"
                            value={step.time_in_minutes || ""}
                            onChange={(e) =>
                              updateStep(
                                index,
                                "time_in_minutes",
                                e.target.value
                              )
                            }
                            className="w-24 px-3 py-2 border border-[#E5E5E5] rounded text-sm"
                            min="0"
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="text-[#6B7280] hover:text-[#121212] p-2"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {formData.steps.length === 0 && (
              <div className="text-center py-8 text-[#6B7280]">
                <p>No steps added yet. Click "Add Step" to get started.</p>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-[#F5F5F5]">
            <Button
              type="submit"
              disabled={saving}
              variant="primary"
              className="flex-1"
            >
              {saving ? "Creating Recipe..." : "Create Recipe"}
            </Button>
            <Button
              type="button"
              onClick={resetForm}
              variant="secondary"
              disabled={saving}
            >
              Reset Form
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
