import axios from "axios";

const NEXT_PUBLIC_API_BASE_URL = "http://127.0.0.1:8000";
const API_KEY = "dev"; // Development API key

// Create axios instance with default config
const api = axios.create({
  baseURL: NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
  },
});

// Auth service
export const authService = {
  register: async (userData) => {
    try {
      const response = await api.post("/users/register", {
        email: userData.email,
        password: userData.password,
        role: "standard",
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Registration failed",
      };
    }
  },

  // Simple authentication - in a real app you'd have a proper login endpoint
  authenticate: async (credentials) => {
    try {
      // For now, we'll create a user if they don't exist, or "login" if they do
      // This is a simplified approach for development
      const users = await userService.getUsers();

      if (users.success) {
        const existingUser = users.data.find(
          (u) => u.email === credentials.email
        );

        if (existingUser) {
          // User exists, simulate login (in real app, verify password on backend)
          return { success: true, data: existingUser };
        } else {
          // User doesn't exist, show error
          return {
            success: false,
            error: "User not found. Please register first.",
          };
        }
      }

      return { success: false, error: "Authentication failed" };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Authentication failed",
      };
    }
  },
};

// User service
export const userService = {
  getUsers: async (skip = 0, limit = 100) => {
    try {
      const response = await api.get(`/users/?skip=${skip}&limit=${limit}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to fetch users",
      };
    }
  },

  getUserProfile: async (userId) => {
    try {
      const response = await api.get(`/users/profile/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to fetch profile",
      };
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to fetch user",
      };
    }
  },

  updateProfile: async (userId, userData) => {
    try {
      const response = await api.put(`/users/profile/${userId}`, userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to update profile",
      };
    }
  },

  deleteUser: async (userId) => {
    try {
      await api.delete(`/users/profile/${userId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to delete user",
      };
    }
  },
};

export default api;
