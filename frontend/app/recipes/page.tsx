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
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "quickest">(
    "newest"
  );

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
    <div className="min-h-screen bg-white">
      <Navigation onSignIn={openSignIn} onSignUp={openSignUp} />

      {/* Main Content */}
      <main className="pt-24">
        {/* Hero Search Section - Clean, focused */}
        <section className="px-8 md:px-16 lg:px-24 py-12 md:py-16 border-b border-[#F5F5F5]">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-poppins text-3xl md:text-4xl lg:text-5xl font-semibold text-[#121212] mb-4 leading-tight">
              Browse Recipes
            </h1>
            <p className="text-lg text-[#6B7280] mb-8 max-w-2xl mx-auto">
              Discover amazing recipes from our collection of{" "}
              {/* TODO: Add dynamic count */}1,000+ recipes
            </p>

            {/* Main Search Bar */}
            <div className="max-w-2xl mx-auto">
              <SearchBar
                initialValue={searchQuery}
                onSearch={handleSearch}
                placeholder="Search by recipe name, ingredient, or cuisine..."
                showFiltersToggle={false}
              />
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="px-8 md:px-16 lg:px-24 py-8 md:py-12">
          <div className="max-w-7xl mx-auto">
            {/* Results Header with Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
              <div className="flex items-center gap-4">
                {/* Active Filters Display */}
                {activeFiltersCount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#6B7280]">Filters:</span>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#8B4513] text-white text-xs font-semibold px-2 py-1 rounded-full">
                        {activeFiltersCount}
                      </span>
                      <button
                        onClick={clearFilters}
                        className="text-sm text-[#8B4513] hover:text-[#7A3E11] font-medium transition-colors duration-200"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#6B7280] font-medium">
                  Sort by:
                </span>
                <div className="flex gap-2">
                  {[
                    { key: "newest", label: "Newest" },
                    { key: "popular", label: "Popular" },
                    { key: "quickest", label: "Quickest" },
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setSortBy(option.key as any)}
                      className={`px-3 py-1.5 text-sm font-medium rounded transition-colors duration-200 ${
                        sortBy === option.key
                          ? "bg-[#8B4513] text-white"
                          : "text-[#6B7280] hover:text-[#121212] hover:bg-[#F5F5F5]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar - Hidden by default on mobile */}
              <div
                className={`lg:w-80 shrink-0 ${
                  showFilters ? "block" : "hidden lg:block"
                }`}
              >
                <div className="card-minimal p-6 sticky top-32">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-poppins text-lg font-semibold text-[#121212]">
                      Refine Results
                    </h2>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="lg:hidden text-[#6B7280] hover:text-[#121212] p-2"
                    >
                      <span className="font-bold text-sm">✕</span>
                    </button>
                  </div>

                  <RecipeFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    isOpen={true}
                  />
                </div>
              </div>

              {/* Results */}
              <div className="flex-1 min-w-0">
                <RecipeList
                  searchParams={{
                    search: searchQuery || undefined,
                    category: filters.category || undefined,
                  }}
                  filters={filters}
                  sortBy={sortBy}
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto mb-6"></div>
            <p className="text-[#6B7280] font-medium">Loading recipes...</p>
          </div>
        </div>
      }
    >
      <RecipesContent />
    </Suspense>
  );
}
