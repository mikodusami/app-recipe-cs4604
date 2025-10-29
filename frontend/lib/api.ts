import axios from "axios";
import { config } from "./config";

// // Validate configuration on import
// validateConfig();

// Create axios instance with config from environment variables
const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": config.apiKey,
  },
});

// Types
export interface User {
  id: number;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  email: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Recipe Types
export interface Recipe {
  id: number;
  name: string;
  category?: string;
  cook_time_in_minutes?: number;
  prep_time_in_minutes?: number;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
}

export interface RecipeIngredient {
  recipe_id: number;
  ingredient_id: number;
  quantity: number;
  unit?: string;
  ingredient_name?: string;
}

export interface RecipeStep {
  recipe_id: number;
  step_order: number;
  instruction: string;
  time_in_minutes?: number;
}

export interface RecipeCreate {
  name: string;
  category?: string;
  cook_time_in_minutes?: number;
  prep_time_in_minutes?: number;
  ingredients: RecipeIngredientCreate[];
  steps: RecipeStepCreate[];
}

export interface RecipeIngredientCreate {
  ingredient_id: number;
  quantity: number;
  unit?: string;
}

export interface RecipeStepCreate {
  step_order: number;
  instruction: string;
  time_in_minutes?: number;
}

export interface RecipeUpdate {
  name?: string;
  category?: string;
  cook_time_in_minutes?: number;
  prep_time_in_minutes?: number;
}

export interface RecipeListParams {
  skip?: number;
  limit?: number;
  category?: string;
  search?: string;
}

export interface RecipeMatch {
  recipe: Recipe;
  match_percentage: number;
  missing_ingredients: string[];
  available_ingredients: string[];
}

// Ingredient Types
export interface Ingredient {
  id: number;
  name: string;
  category?: string;
  substitutes: IngredientSubstitute[];
}

export interface IngredientSubstitute {
  source_ingredient_id: number;
  name: string;
  unit?: string;
  category?: string;
}

export interface IngredientCreate {
  name: string;
  category?: string;
}

export interface IngredientUpdate {
  name?: string;
  category?: string;
}

export interface IngredientListParams {
  skip?: number;
  limit?: number;
  category?: string;
  search?: string;
}

// Favorite Recipe Types
export interface FavoriteRecipe {
  user_id: number;
  recipe_id: number;
  user_note?: string;
  favorited_at: string;
  recipe_name?: string;
}

export interface FavoriteRecipeCreate {
  recipe_id: number;
  user_note?: string;
}

export interface FavoriteRecipeUpdate {
  user_note?: string;
}

export interface FavoriteListParams {
  skip?: number;
  limit?: number;
}

// Auth service
export const authService = {
  register: async (userData: UserCreate): Promise<ApiResponse<User>> => {
    try {
      const response = await api.post("/users/register", {
        email: userData.email,
        role: userData.role || "standard",
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Registration failed",
      };
    }
  },

  // Simple login - looks up user by email
  login: async (loginData: LoginRequest): Promise<ApiResponse<User>> => {
    try {
      const response = await api.post("/users/login", {
        email: loginData.email,
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "User not found",
      };
    }
  },

  // Legacy method for backward compatibility
  authenticate: async (credentials: {
    email: string;
    password?: string;
  }): Promise<ApiResponse<User>> => {
    return authService.login({ email: credentials.email });
  },
};

// User service
export const userService = {
  getUsers: async (skip = 0, limit = 100): Promise<ApiResponse<User[]>> => {
    try {
      const response = await api.get(`/users/?skip=${skip}&limit=${limit}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to fetch users",
      };
    }
  },

  getUserProfile: async (userId: number): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get(`/users/profile/${userId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to fetch profile",
      };
    }
  },

  updateProfile: async (
    userId: number,
    userData: Partial<UserCreate>
  ): Promise<ApiResponse<User>> => {
    try {
      const response = await api.put(`/users/profile/${userId}`, userData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to update profile",
      };
    }
  },

  deleteUser: async (userId: number): Promise<ApiResponse<void>> => {
    try {
      await api.delete(`/users/profile/${userId}`);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to delete user",
      };
    }
  },
};

// Recipe service
export const recipeService = {
  getRecipes: async (
    params: RecipeListParams = {}
  ): Promise<ApiResponse<Recipe[]>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params.skip !== undefined)
        queryParams.append("skip", params.skip.toString());
      if (params.limit !== undefined)
        queryParams.append("limit", params.limit.toString());
      if (params.category) queryParams.append("category", params.category);
      if (params.search) queryParams.append("search", params.search);

      const response = await api.get(`/recipes/?${queryParams.toString()}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to fetch recipes",
      };
    }
  },

  getRecipe: async (id: number): Promise<ApiResponse<Recipe>> => {
    try {
      const response = await api.get(`/recipes/${id}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to fetch recipe",
      };
    }
  },

  createRecipe: async (recipe: RecipeCreate): Promise<ApiResponse<Recipe>> => {
    try {
      const response = await api.post("/recipes/", recipe);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to create recipe",
      };
    }
  },

  updateRecipe: async (
    id: number,
    recipe: RecipeUpdate
  ): Promise<ApiResponse<Recipe>> => {
    try {
      const response = await api.put(`/recipes/${id}`, recipe);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to update recipe",
      };
    }
  },

  deleteRecipe: async (id: number): Promise<ApiResponse<void>> => {
    try {
      await api.delete(`/recipes/${id}`);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to delete recipe",
      };
    }
  },

  getCategories: async (): Promise<ApiResponse<string[]>> => {
    try {
      // Get unique categories from existing recipes
      const recipesResponse = await recipeService.getRecipes({ limit: 1000 });
      if (recipesResponse.success && recipesResponse.data) {
        const categories = Array.from(
          new Set(
            recipesResponse.data
              .map((recipe) => recipe.category)
              .filter((category) => category !== null && category !== undefined)
          )
        ) as string[];
        return { success: true, data: categories };
      }
      return { success: false, error: "Failed to fetch categories" };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to fetch categories",
      };
    }
  },

  getRecipesByIngredients: async (
    ingredientIds: number[],
    params: { skip?: number; limit?: number } = {}
  ): Promise<ApiResponse<RecipeMatch[]>> => {
    try {
      const queryParams = new URLSearchParams();
      ingredientIds.forEach((id) =>
        queryParams.append("ingredient_ids", id.toString())
      );
      if (params.skip !== undefined)
        queryParams.append("skip", params.skip.toString());
      if (params.limit !== undefined)
        queryParams.append("limit", params.limit.toString());

      const response = await api.get(
        `/recipes/by-ingredients/?${queryParams.toString()}`
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.detail ||
          "Failed to find recipes by ingredients",
      };
    }
  },
};

// Ingredient service
export const ingredientService = {
  getIngredients: async (
    params: IngredientListParams = {}
  ): Promise<ApiResponse<Ingredient[]>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params.skip !== undefined)
        queryParams.append("skip", params.skip.toString());
      if (params.limit !== undefined)
        queryParams.append("limit", params.limit.toString());
      if (params.category) queryParams.append("category", params.category);
      if (params.search) queryParams.append("search", params.search);

      const response = await api.get(`/ingredients/?${queryParams.toString()}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to fetch ingredients",
      };
    }
  },

  getIngredient: async (id: number): Promise<ApiResponse<Ingredient>> => {
    try {
      const response = await api.get(`/ingredients/${id}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to fetch ingredient",
      };
    }
  },

  createIngredient: async (
    ingredient: IngredientCreate
  ): Promise<ApiResponse<Ingredient>> => {
    try {
      const response = await api.post("/ingredients/", ingredient);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to create ingredient",
      };
    }
  },

  updateIngredient: async (
    id: number,
    ingredient: IngredientUpdate
  ): Promise<ApiResponse<Ingredient>> => {
    try {
      const response = await api.put(`/ingredients/${id}`, ingredient);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to update ingredient",
      };
    }
  },

  deleteIngredient: async (id: number): Promise<ApiResponse<void>> => {
    try {
      await api.delete(`/ingredients/${id}`);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to delete ingredient",
      };
    }
  },

  getCategories: async (): Promise<ApiResponse<string[]>> => {
    try {
      const response = await api.get("/ingredients/categories");
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.detail ||
          "Failed to fetch ingredient categories",
      };
    }
  },

  searchIngredients: async (
    query: string,
    limit: number = 10
  ): Promise<ApiResponse<Ingredient[]>> => {
    try {
      const response = await api.get(
        `/ingredients/?search=${encodeURIComponent(query)}&limit=${limit}`
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to search ingredients",
      };
    }
  },
};

// Favorites service
export const favoritesService = {
  getFavorites: async (
    userId: number,
    params: FavoriteListParams = {}
  ): Promise<ApiResponse<FavoriteRecipe[]>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params.skip !== undefined)
        queryParams.append("skip", params.skip.toString());
      if (params.limit !== undefined)
        queryParams.append("limit", params.limit.toString());

      const response = await api.get(
        `/users/${userId}/favorites/?${queryParams.toString()}`
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to fetch favorites",
      };
    }
  },

  getFavorite: async (
    userId: number,
    recipeId: number
  ): Promise<ApiResponse<FavoriteRecipe>> => {
    try {
      const response = await api.get(`/users/${userId}/favorites/${recipeId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to fetch favorite",
      };
    }
  },

  addFavorite: async (
    userId: number,
    favorite: FavoriteRecipeCreate
  ): Promise<ApiResponse<FavoriteRecipe>> => {
    try {
      const response = await api.post(`/users/${userId}/favorites/`, favorite);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to add favorite",
      };
    }
  },

  updateFavorite: async (
    userId: number,
    recipeId: number,
    favorite: FavoriteRecipeUpdate
  ): Promise<ApiResponse<FavoriteRecipe>> => {
    try {
      const response = await api.put(
        `/users/${userId}/favorites/${recipeId}`,
        favorite
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to update favorite",
      };
    }
  },

  removeFavorite: async (
    userId: number,
    recipeId: number
  ): Promise<ApiResponse<void>> => {
    try {
      await api.delete(`/users/${userId}/favorites/${recipeId}`);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to remove favorite",
      };
    }
  },

  checkFavorite: async (
    userId: number,
    recipeId: number
  ): Promise<ApiResponse<{ is_favorited: boolean }>> => {
    try {
      const response = await api.get(
        `/users/${userId}/favorites/${recipeId}/check`
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.detail || "Failed to check favorite status",
      };
    }
  },
};

export default api;
