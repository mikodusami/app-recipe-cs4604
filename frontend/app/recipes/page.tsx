"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { AuthModal } from "@/components/AuthModal";
import { SearchBar } from "@/components/SearchBar";
import { RecipeFilters } from "@/components/RecipeFilters";
import { RecipeList } from "@/components/RecipeList";

interface RecipeFiltersState {
  category?: string;
  maxCookTime?: number;
  maxPrepTime?: number;
  ingredients?: string[];
  dietaryRestrictions?: string[];
}

function RecipesContent() {
  const searchParams = useSearchParams();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [filters, setFilters] = useState<RecipeFiltersState>({
    category: searchParams.get("category") || undefined,
    maxCookTime: undefined,
    maxPrepTime: undefined,
    ingredients: [],
    dietaryRestrictions: [],
  });

  const [showFilters, setShowFilters] = useState(false);

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

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: RecipeFiltersState) => {
    setFilters(newFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: undefined,
      maxCookTime: undefined,
      maxPrepTime: undefined,
      ingredients: [],
      dietaryRestrictions: [],
    });
    setSearchQuery("");
  };

  // Get active filters count
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation onSignIn={openSignIn} onSignUp={openSignUp} />

      {/* Main Content */}
      <main className="pt-20 pb-12">
        {/* Header */}
        <section className="bg-card border-b border-border py-8">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-card-foreground mb-2">
                  Browse Recipes
                </h1>
                <p className="text-muted-foreground">
                  Discover amazing recipes from our collection
                </p>
              </div>

              {/* Search Bar */}
              <div className="lg:max-w-md lg:w-full">
                <SearchBar
                  initialValue={searchQuery}
                  onSearch={handleSearch}
                  placeholder="Search recipes..."
                  showFiltersToggle={true}
                  onToggleFilters={() => setShowFilters(!showFilters)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Results */}
        <section className="py-8">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar */}
              <div className="lg:w-64 shrink-0">
                <div className="bg-card rounded-lg border p-6 sticky top-24">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-card-foreground">
                      Filters
                    </h2>
                    {activeFiltersCount > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="bg-orange-100 text-orange-800 text-sm font-medium px-2 py-1 rounded-full">
                          {activeFiltersCount}
                        </span>
                        <button
                          onClick={clearFilters}
                          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                        >
                          Clear All
                        </button>
                      </div>
                    )}
                  </div>

                  <RecipeFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    isOpen={true}
                  />
                </div>
              </div>

              {/* Results */}
              <div className="flex-1">
                {/* Recipe List */}
                <RecipeList
                  searchParams={{
                    search: searchQuery || undefined,
                    category: filters.category || undefined,
                  }}
                  filters={filters}
                />
              </div>
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

export default function RecipesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading recipes...</p>
      </div>
    </div>}>
      <RecipesContent />
    </Suspense>
  );
}
