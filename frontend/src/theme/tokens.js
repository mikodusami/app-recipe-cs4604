// Design tokens for the Recipe App
export const colors = {
  primary: "#FF7A00", // Warm orange
  secondary: "#4CAF50", // Soft green
  accent: "#E91E63", // Deep pink/red
  neutral: {
    text: "#333333", // Dark gray for body text
    background: "#F9F9F9", // Off-white for backgrounds
    white: "#FFFFFF",
    gray: {
      100: "#F7F7F7",
      200: "#E5E5E5",
      300: "#D1D1D1",
      400: "#A3A3A3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
    },
  },
  status: {
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },
};

export const typography = {
  fontFamily: {
    primary:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
  },
  fontSize: {
    h1: "2.5rem", // 40px
    h2: "1.75rem", // 28px
    h3: "1.25rem", // 20px
    body: "1rem", // 16px
    caption: "0.875rem", // 14px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "40px",
  xxl: "64px",
};

export const borderRadius = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  full: "9999px",
};

export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
};
