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
      <div className={cn("text-center py-16", className)}>
        <div className="text-6xl mb-6">🔒</div>
        <h3 className="font-poppins text-xl font-semibold text-[#121212] mb-3">
          Sign in required
        </h3>
        <p className="text-[#6B7280]">
          Please sign in to view and manage your profile.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      {/* Profile Header */}
      <div className="card-minimal p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="w-20 h-20 bg-[#8B4513] rounded-full flex items-center justify-center">
              <span className="text-2xl text-white font-bold">
                {user.email.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* User Info */}
            <div>
              <h1 className="font-poppins text-2xl font-semibold text-[#121212]">
                {user.email}
              </h1>
              <p className="text-[#6B7280] capitalize">{user.role} User</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#F5F5F5] rounded p-6">
              <div className="flex items-center space-x-4">
                <span className="text-3xl">❤️</span>
                <div>
                  <p className="text-3xl font-poppins font-bold text-[#8B4513]">
                    {stats.favoritesCount}
                  </p>
                  <p className="text-sm font-medium text-[#6B7280]">
                    Favorite {stats.favoritesCount === 1 ? "Recipe" : "Recipes"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#F5F5F5] rounded p-6">
              <div className="flex items-center space-x-4">
                <span className="text-3xl">📅</span>
                <div>
                  <p className="text-sm font-semibold text-[#8B4513] tracking-wide">
                    MEMBER SINCE
                  </p>
                  <p className="text-sm font-medium text-[#6B7280]">
                    {stats.joinDate}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-[#8B4513] text-white rounded">
            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-[#F5F5F5] border border-[#E5E5E5] rounded">
            <p className="text-[#8B4513] text-sm font-medium">{error}</p>
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
      <div className="card-minimal p-8">
        <h2 className="font-poppins text-lg font-semibold text-[#121212] mb-6">
          Account Settings
        </h2>

        <div className="space-y-8">
          {/* Privacy Settings */}
          <div className="border-b border-[#F5F5F5] pb-6">
            <h3 className="text-md font-semibold text-[#121212] mb-3">
              Privacy & Data
            </h3>
            <p className="text-sm text-[#6B7280] mb-4">
              Your account data is kept private and secure. We only use your
              information to provide recipe recommendations and save your
              preferences.
            </p>
            <div className="flex items-center space-x-3">
              <span className="text-[#8B4513]">✓</span>
              <span className="text-sm font-medium text-[#6B7280]">
                Data encrypted and secure
              </span>
            </div>
          </div>

          {/* Account Actions */}
          <div>
            <h3 className="text-md font-semibold text-[#121212] mb-4">
              Account Actions
            </h3>

            <div className="space-y-4">
              <Button
                onClick={logout}
                variant="secondary"
                className="w-full justify-center"
              >
                Sign Out
              </Button>

              <Button
                onClick={handleDeleteAccount}
                variant="ghost"
                className="w-full justify-center text-[#6B7280] hover:text-[#121212] hover:bg-[#F5F5F5]"
                disabled={loading}
              >
                {loading ? "Processing..." : "Delete Account"}
              </Button>
            </div>

            <p className="text-xs text-[#6B7280] mt-4">
              Deleting your account will permanently remove all your data,
              including favorites and preferences. This action cannot be undone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
