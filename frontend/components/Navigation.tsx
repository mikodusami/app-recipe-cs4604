"use client";

import { useUser } from "@/contexts/UserContext";
import { Button } from "./ui/Button";
import { useState } from "react";

interface NavigationProps {
  onSignIn?: () => void;
  onSignUp?: () => void;
}

export function Navigation({ onSignIn, onSignUp }: NavigationProps) {
  const { user, isAuthenticated, logout } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-[#F5F5F5]">
      <div className="max-w-6xl mx-auto px-8 md:px-16 lg:px-24 py-6">
        <div className="flex items-center justify-between">
          {/* Logo - Clean, minimal approach */}
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-[#8B4513] rounded flex items-center justify-center">
              <span className="text-white font-bold text-lg">🍳</span>
            </div>
            <span className="font-poppins text-xl font-semibold text-[#121212]">
              Recipe Assistant
            </span>
          </div>

          {/* Navigation Links - Minimal, clean styling */}
          <div className="flex items-center gap-8">
            <a
              href="/"
              className="text-[#6B7280] hover:text-[#121212] font-medium transition-colors duration-200"
            >
              Home
            </a>

            <a
              href="/recipes"
              className="text-[#6B7280] hover:text-[#121212] font-medium transition-colors duration-200"
            >
              Browse Recipes
            </a>

            <a
              href="/ingredient-search"
              className="text-[#6B7280] hover:text-[#121212] font-medium transition-colors duration-200"
            >
              Find by Ingredients
            </a>

            {isAuthenticated && (
              <a
                href="/my-recipes"
                className="text-[#6B7280] hover:text-[#121212] font-medium transition-colors duration-200"
              >
                My Favorites
              </a>
            )}

            {isAuthenticated && user?.role === "admin" && (
              <a
                href="/admin"
                className="text-[#8B4513] hover:text-[#7A3E11] font-medium transition-colors duration-200"
              >
                Admin
              </a>
            )}

            {/* Authentication Section - Clean, minimal */}
            {isAuthenticated ? (
              <div className="relative flex items-center gap-4">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 text-[#6B7280] hover:text-[#121212] font-medium transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-[#F5F5F5] rounded-full flex items-center justify-center">
                    <span className="text-[#8B4513] font-semibold text-sm">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <span className="hidden md:inline">
                    {user?.email?.split("@")[0] || "User"}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      showUserMenu ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* User dropdown menu - Clean, minimal styling */}
                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded border border-[#F5F5F5] py-2 z-50 shadow-sm">
                    <div className="px-4 py-3 border-b border-[#F5F5F5]">
                      <p className="text-sm font-medium text-[#121212]">
                        {user?.email?.split("@")[0] || "User"}
                      </p>
                      <p className="text-xs text-[#6B7280]">{user?.email}</p>
                      <p className="text-xs text-[#6B7280] capitalize">
                        {user?.role || "standard"} user
                      </p>
                    </div>
                    <a
                      href="/profile"
                      className="block px-4 py-2 text-sm text-[#6B7280] hover:bg-[#F5F5F5] hover:text-[#121212] transition-colors duration-200"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Profile Settings
                    </a>
                    <a
                      href="/my-recipes"
                      className="block px-4 py-2 text-sm text-[#6B7280] hover:bg-[#F5F5F5] hover:text-[#121212] transition-colors duration-200"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Favorites
                    </a>
                    <a
                      href="/pantry"
                      className="block px-4 py-2 text-sm text-[#6B7280] hover:bg-[#F5F5F5] hover:text-[#121212] transition-colors duration-200"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Pantry
                    </a>
                    {user?.role === "admin" && (
                      <>
                        <div className="border-t border-[#F5F5F5] my-1"></div>
                        <a
                          href="/admin"
                          className="block px-4 py-2 text-sm text-[#8B4513] hover:bg-[#F5F5F5] transition-colors duration-200 font-medium"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Admin Dashboard
                        </a>
                      </>
                    )}
                    <div className="border-t border-[#F5F5F5] my-1"></div>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-[#6B7280] hover:bg-[#F5F5F5] hover:text-[#121212] transition-colors duration-200"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={onSignIn}>
                  Sign In
                </Button>
                <Button variant="primary" size="sm" onClick={onSignUp}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
}
