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
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🍳</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Recipe Assistant
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <a
              href="/"
              className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
            >
              Home
            </a>

            {/* Recipe browsing and search links */}
            <a
              href="/recipes"
              className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
            >
              Browse Recipes
            </a>

            <a
              href="/ingredient-search"
              className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
            >
              Find by Ingredients
            </a>

            {/* User-specific navigation items */}
            {isAuthenticated && (
              <>
                <a
                  href="/my-recipes"
                  className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
                >
                  My Favorites
                </a>
              </>
            )}

            {/* Authentication Section */}
            {isAuthenticated ? (
              <div className="relative flex items-center gap-4">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-gray-700 hover:text-orange-500 font-medium transition-colors"
                >
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-semibold text-sm">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <span className="hidden md:inline">
                    {user?.email?.split("@")[0] || "User"}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
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

                {/* User dropdown menu */}
                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.email?.split("@")[0] || "User"}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <p className="text-xs text-gray-400 capitalize">
                        {user?.role || "standard"} user
                      </p>
                    </div>
                    <a
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Profile Settings
                    </a>
                    <a
                      href="/my-recipes"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Favorites
                    </a>
                    <a
                      href="/pantry"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Pantry
                    </a>
                    {user?.role === "admin" && (
                      <>
                        <div className="border-t border-gray-100 my-1"></div>
                        <a
                          href="/admin"
                          className="block px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 transition-colors font-medium"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Admin Dashboard
                        </a>
                      </>
                    )}
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
