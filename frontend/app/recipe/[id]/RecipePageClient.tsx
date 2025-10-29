"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Recipe, recipeService } from "@/lib/api";
import { RecipeDetail } from "@/components/RecipeDetail";
import { Navigation } from "@/components/Navigation";
import { AuthModal } from "@/components/AuthModal";

interface RecipePageClientProps {
  recipeId: string;
}

export function RecipePageClient({ recipeId }: RecipePageClientProps) {
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

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

  useEffect(() => {
    if (recipeId) {
      loadRecipe(parseInt(recipeId));
    }
  }, [recipeId]);

  const loadRecipe = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await recipeService.getRecipe(id);
      if (response.success && response.data) {
        setRecipe(response.data);
      } else {
        setError(response.error || "Failed to load recipe");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation onSignIn={openSignIn} onSignUp={openSignUp} />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto mb-6"></div>
            <p className="text-[#6B7280] font-medium">Loading recipe...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation onSignIn={openSignIn} onSignUp={openSignUp} />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="text-[#8B4513] font-poppins font-bold text-2xl mb-4">
              RECIPE NOT FOUND
            </div>
            <h1 className="text-2xl font-semibold text-[#121212] mb-4">
              Oops! This recipe doesn't exist
            </h1>
            <p className="text-[#6B7280] mb-8">
              {error ||
                "The recipe you're looking for might have been moved or deleted."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-[#8B4513] text-white rounded-full hover:bg-[#7A3E11] 
                         transition-colors duration-200 font-medium"
              >
                Go Back
              </button>
              <button
                onClick={() => router.push("/recipes")}
                className="px-6 py-3 border border-[#F5F5F5] text-[#121212] rounded 
                         hover:bg-[#F5F5F5] transition-colors duration-200 font-medium"
              >
                Browse Recipes
              </button>
            </div>
          </div>
        </div>
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          mode={authMode}
          onSwitchMode={switchAuthMode}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation onSignIn={openSignIn} onSignUp={openSignUp} />
      <main className="pt-24">
        <RecipeDetail recipe={recipe} onBack={handleBack} />
      </main>
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={switchAuthMode}
      />
    </div>
  );
}
