"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onToggleFilters?: () => void;
  placeholder?: string;
  initialValue?: string;
  showFiltersToggle?: boolean;
  className?: string;
}

const SEARCH_HISTORY_KEY = "recipe_search_history";
const MAX_HISTORY_ITEMS = 5;

export function SearchBar({
  onSearch,
  onToggleFilters,
  placeholder = "Search recipes...",
  initialValue = "",
  showFiltersToggle = true,
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load search history on component mount
  useEffect(() => {
    loadSearchHistory();
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        onSearch(query.trim());
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, onSearch]);

  // Update suggestions based on query and history
  useEffect(() => {
    if (query.trim().length > 0) {
      const filteredHistory = searchHistory.filter(
        (item) =>
          item.toLowerCase().includes(query.toLowerCase()) && item !== query
      );
      setSuggestions(filteredHistory);
    } else {
      setSuggestions(searchHistory.slice(0, 3));
    }
  }, [query, searchHistory]);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadSearchHistory = () => {
    try {
      const history = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error("Failed to load search history:", error);
    }
  };

  const saveToHistory = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    try {
      const updatedHistory = [
        searchQuery,
        ...searchHistory.filter((item) => item !== searchQuery),
      ].slice(0, MAX_HISTORY_ITEMS);

      setSearchHistory(updatedHistory);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Failed to save search history:", error);
    }
  };

  const clearSearchHistory = () => {
    try {
      setSearchHistory([]);
      localStorage.removeItem(SEARCH_HISTORY_KEY);
      setShowSuggestions(false);
    } catch (error) {
      console.error("Failed to clear search history:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
    saveToHistory(suggestion);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      saveToHistory(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className={cn("relative w-full max-w-2xl", className)}>
      <form onSubmit={handleSubmit} className="w-full">
        {/* Search Input */}
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="search"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              "pr-12 sm:pr-10 text-base border-[#F5F5F5] focus:border-[#8B4513] focus:ring-[#8B4513]",
              "min-h-[48px] bg-white text-[#121212]",
              "touch-manipulation rounded"
            )}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
          />

          {/* Clear Button - Mobile optimized */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2",
                "w-8 h-8 flex items-center justify-center",
                "text-[#6B7280] hover:text-[#121212] transition-colors duration-200",
                "touch-manipulation rounded-full hover:bg-[#F5F5F5]",
                "min-h-[32px] min-w-[32px]"
              )}
            >
              <span className="font-bold text-sm">✕</span>
            </button>
          )}
        </div>
      </form>

      {/* Search Suggestions - Mobile optimized */}
      {showSuggestions &&
        (suggestions.length > 0 || searchHistory.length > 0) && (
          <div
            ref={suggestionsRef}
            className={cn(
              "absolute top-full left-0 right-0 mt-2 bg-white border border-[#F5F5F5] rounded shadow-sm z-50",
              "max-h-64 sm:max-h-80 overflow-y-auto",
              "touch-manipulation"
            )}
          >
            {/* Current suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2">
                {query.trim() && (
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Recent searches
                  </div>
                )}
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={cn(
                      "w-full text-left px-3 py-3 sm:py-2 hover:bg-gray-50 rounded-md transition-colors",
                      "flex items-center gap-3 touch-manipulation",
                      "min-h-[48px] sm:min-h-[36px]", // Better touch targets
                      "active:bg-gray-100"
                    )}
                  >
                    <span className="text-gray-400 font-bold text-xs">
                      RECENT
                    </span>
                    <span className="flex-1 text-base sm:text-sm wrap-break-word">
                      {suggestion}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Search history when no query */}
            {!query.trim() && searchHistory.length > 0 && (
              <div className="p-2">
                <div className="flex items-center justify-between px-3 py-2 mb-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Recent searches
                  </span>
                  <button
                    onClick={clearSearchHistory}
                    className={cn(
                      "text-xs text-gray-400 hover:text-gray-600 transition-colors",
                      "px-2 py-1 rounded touch-manipulation",
                      "min-h-[32px]"
                    )}
                  >
                    Clear
                  </button>
                </div>
                {searchHistory.slice(0, 3).map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(item)}
                    className={cn(
                      "w-full text-left px-3 py-3 sm:py-2 hover:bg-gray-50 rounded-md transition-colors",
                      "flex items-center gap-3 touch-manipulation",
                      "min-h-[48px] sm:min-h-[36px]", // Better touch targets
                      "active:bg-gray-100"
                    )}
                  >
                    <span className="text-gray-400 font-bold text-xs">
                      RECENT
                    </span>
                    <span className="flex-1 text-base sm:text-sm wrap-break-word">
                      {item}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
    </div>
  );
}
