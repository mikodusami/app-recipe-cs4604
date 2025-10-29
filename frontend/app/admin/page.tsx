"use client";

import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Navigation } from "@/components/Navigation";
import { AuthModal } from "@/components/AuthModal";
import { AdminRecipeManager } from "@/components/AdminRecipeManager";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type AdminTabType = "recipes" | "users" | "analytics";

export default function AdminPage() {
  const { isAuthenticated, user } = useUser();
  const router = useRouter();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [activeTab, setActiveTab] = useState<AdminTabType>("recipes");

  const isAdmin = user?.role === "admin";

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

  // Show authentication required message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation onSignIn={openSignIn} onSignUp={openSignUp} />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="font-poppins text-3xl font-semibold text-[#121212] mb-4">
              Sign in Required
            </h1>
            <p className="text-[#6B7280] mb-8">
              Please sign in to access the admin dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" onClick={openSignUp}>
                Sign Up
              </Button>
              <Button variant="secondary" onClick={openSignIn}>
                Sign In
              </Button>
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

  // Show admin access required message
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation onSignIn={openSignIn} onSignUp={openSignUp} />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="text-6xl mb-6">⚙️</div>
            <h1 className="font-poppins text-3xl font-semibold text-[#121212] mb-4">
              Admin Access Required
            </h1>
            <p className="text-[#6B7280] mb-8">
              You need administrator privileges to access this dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" onClick={() => router.push("/")}>
                Go Home
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.push("/my-recipes")}
              >
                My Recipes
              </Button>
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

      {/* Main Content */}
      <main className="pt-24">
        {/* Hero Section */}
        <section className="px-8 md:px-16 lg:px-24 py-12 md:py-16 border-b border-[#F5F5F5]">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <h1
                  className="font-poppins text-3xl md:text-4xl lg:text-5xl font-semibold 
                             text-[#121212] mb-4 leading-tight"
                >
                  Admin Dashboard
                </h1>
                <p className="text-lg text-[#6B7280] max-w-2xl">
                  Manage recipes, users, and system settings
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-[#F5F5F5] rounded">
                  <div className="text-2xl font-poppins font-bold text-[#8B4513]">
                    {/* TODO: Add dynamic count */}10
                  </div>
                  <div className="text-xs font-medium text-[#6B7280]">
                    Total Recipes
                  </div>
                </div>
                <div className="text-center p-4 bg-[#F5F5F5] rounded">
                  <div className="text-2xl font-poppins font-bold text-[#8B4513]">
                    {/* TODO: Add dynamic count */}2
                  </div>
                  <div className="text-xs font-medium text-[#6B7280]">
                    Total Users
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center lg:justify-start mt-8">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("recipes")}
                  className={cn(
                    "px-6 py-3 rounded font-medium transition-all duration-200 flex items-center gap-2",
                    activeTab === "recipes"
                      ? "bg-[#8B4513] text-white shadow-sm"
                      : "bg-[#F5F5F5] text-[#6B7280] hover:text-[#121212] hover:bg-[#E5E5E5]"
                  )}
                >
                  <span className="text-sm">🍳</span>
                  <span>Recipes</span>
                </button>
                <button
                  onClick={() => setActiveTab("users")}
                  className={cn(
                    "px-6 py-3 rounded font-medium transition-all duration-200 flex items-center gap-2",
                    activeTab === "users"
                      ? "bg-[#8B4513] text-white shadow-sm"
                      : "bg-[#F5F5F5] text-[#6B7280] hover:text-[#121212] hover:bg-[#E5E5E5]"
                  )}
                >
                  <span className="text-sm">👥</span>
                  <span>Users</span>
                </button>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={cn(
                    "px-6 py-3 rounded font-medium transition-all duration-200 flex items-center gap-2",
                    activeTab === "analytics"
                      ? "bg-[#8B4513] text-white shadow-sm"
                      : "bg-[#F5F5F5] text-[#6B7280] hover:text-[#121212] hover:bg-[#E5E5E5]"
                  )}
                >
                  <span className="text-sm">📊</span>
                  <span>Analytics</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="px-8 md:px-16 lg:px-24 py-12 md:py-16">
          <div className="max-w-7xl mx-auto">
            {activeTab === "recipes" && (
              <AdminRecipeManager className="w-full" />
            )}

            {activeTab === "users" && (
              <div className="text-center py-16">
                <div className="text-6xl mb-6">👥</div>
                <h3 className="font-poppins text-xl font-semibold text-[#121212] mb-3">
                  User Management
                </h3>
                <p className="text-[#6B7280] mb-8 max-w-md mx-auto">
                  User management functionality will be available in a future
                  update.
                </p>
                <Button variant="secondary" disabled>
                  Coming Soon
                </Button>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="text-center py-16">
                <div className="text-6xl mb-6">📊</div>
                <h3 className="font-poppins text-xl font-semibold text-[#121212] mb-3">
                  Analytics Dashboard
                </h3>
                <p className="text-[#6B7280] mb-8 max-w-md mx-auto">
                  Analytics and reporting features will be available in a future
                  update.
                </p>
                <Button variant="secondary" disabled>
                  Coming Soon
                </Button>
              </div>
            )}
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
