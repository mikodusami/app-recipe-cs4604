"use client";

import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { authService } from "@/lib/api";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "signin" | "signup";
  onSwitchMode: () => void;
}

export function AuthModal({
  isOpen,
  onClose,
  mode,
  onSwitchMode,
}: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { login } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (mode === "signup") {
      try {
        const result = await authService.register({ email });

        if (result.success) {
          setSuccess("Account created successfully! You can now sign in.");
          setTimeout(() => {
            onSwitchMode();
            setSuccess("");
          }, 2000);
        } else {
          setError(result.error || "Registration failed");
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
      }
    } else {
      // Sign in
      try {
        const result = await authService.login({ email });

        if (result.success && result.data) {
          login(result.data);
          onClose();
          resetForm();
        } else {
          setError(result.error || "Sign in failed");
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
      }
    }

    setLoading(false);
  };

  const resetForm = () => {
    setEmail("");
    setError("");
    setSuccess("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === "signin" ? "Welcome Back" : "Create Account"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-xl">
              {mode === "signin" ? "🔑" : "👤"}
            </span>
          </div>
          <p className="text-gray-600">
            {mode === "signin"
              ? "Enter your email to sign in"
              : "Enter your email to create an account"}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            disabled={!email}
            className="w-full"
          >
            {loading
              ? mode === "signin"
                ? "Signing In..."
                : "Creating Account..."
              : mode === "signin"
              ? "Sign In"
              : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center pt-4 border-t border-gray-200">
          <p className="text-gray-600">
            {mode === "signin"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              onClick={onSwitchMode}
              className="text-orange-500 font-medium hover:text-orange-600"
            >
              {mode === "signin" ? "Create one here" : "Sign in here"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
