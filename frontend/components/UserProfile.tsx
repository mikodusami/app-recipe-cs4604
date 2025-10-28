"use client";

import React, { useState, useEffect } from "react";
import { User, favoritesService, userService } from "@/lib/api";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

interface UserProfileProps {
  className?: string;
}

interface ProfileStats {
  favoritesCount: number;
  joinDate: string;
}

export function UserProfile({ className }: UserProfileProps) {
  const { user, isAuthenticated, updateUser, logout } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: user?.email || "",
    role: user?.role || "standard",
  });

  // Load profile stats when component mounts
  useEffect(() => {
    if (isAuthenticated && user) {
      loadProfileStats();
    }
  }, [isAuthenticated, user]);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        role: user.role,
      });
    }
  }, [user]);

  const loadProfileStats = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load favorites count
      const favoritesResponse = await favoritesService.getFavorites(user.id, {
        limit: 1,
      });
      const favoritesCount = favoritesResponse.success
        ? favoritesResponse.data?.length || 0
        : 0;

      // Format join date
      const joinDate = new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      setStats({
        favoritesCount,
        joinDate,
      });
    } catch (error) {
      console.error("Failed to load profile stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear messages when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form data
      setFormData({
        email: user?.email || "",
        role: user?.role || "standard",
      });
      setError(null);
      setSuccess(null);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    // Validate form
    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await userService.updateProfile(user.id, {
        email: formData.email.trim(),
        role: formData.role,
      });

      if (response.success && response.data) {
        // Update user context
        updateUser(response.data);
        setSuccess("Profile updated successfully!");
        setIsEditing(false);

        // Reload stats in case anything changed
        loadProfileStats();
      } else {
        setError(response.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and will remove all your favorites and data."
    );

    if (!confirmed) return;

    const doubleConfirmed = window.confirm(
      "This will permanently delete your account and all associated data. Are you absolutely sure?"
    );

    if (!doubleConfirmed) return;

    setLoading(true);
    try {
      const response = await userService.deleteUser(user.id);

      if (response.success) {
        // Log out user and redirect
        logout();
        window.location.href = "/";
      } else {
        setError(response.error || "Failed to delete account");
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
      setError("Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  // Show authentication required message
  if (!isAuthenticated || !user) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Sign in required
        </h3>
        <p className="text-gray-600">
          Please sign in to view and manage your profile.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("max-w-2xl mx-auto", className)}>
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="w-16 h-16 bg-linear-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
              <span className="text-2xl text-white font-bold">
                {user.email.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* User Info */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.email}</h1>
              <p className="text-gray-600 capitalize">{user.role} User</p>
            </div>
          </div>

          {/* Edit Button */}
          <Button
            onClick={handleEditToggle}
            variant={isEditing ? "secondary" : "primary"}
            disabled={loading || saving}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        {/* Profile Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">❤️</span>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.favoritesCount}
                  </p>
                  <p className="text-sm text-gray-600">
                    Favorite {stats.favoritesCount === 1 ? "Recipe" : "Recipes"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Member Since
                  </p>
                  <p className="text-sm text-gray-600">{stats.joinDate}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Profile Form */}
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Account Type
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="standard">Standard User</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? "Saving..." : "Save Changes"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={handleEditToggle}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <p className="text-gray-900">{user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type
              </label>
              <p className="text-gray-900 capitalize">{user.role}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Member Since
              </label>
              <p className="text-gray-900">{stats?.joinDate || "Loading..."}</p>
            </div>
          </div>
        )}
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Account Settings
        </h2>

        <div className="space-y-4">
          {/* Privacy Settings */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-md font-medium text-gray-900 mb-2">
              Privacy & Data
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Your account data is kept private and secure. We only use your
              information to provide recipe recommendations and save your
              preferences.
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm text-gray-700">
                Data encrypted and secure
              </span>
            </div>
          </div>

          {/* Account Actions */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-2">
              Account Actions
            </h3>

            <div className="space-y-3">
              <Button
                onClick={logout}
                variant="secondary"
                className="w-full justify-center"
              >
                Sign Out
              </Button>

              <Button
                onClick={handleDeleteAccount}
                variant="secondary"
                className="w-full justify-center text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                disabled={loading}
              >
                {loading ? "Processing..." : "Delete Account"}
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Deleting your account will permanently remove all your data,
              including favorites and preferences. This action cannot be undone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
