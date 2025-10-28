import React from "react";

const Button = ({
  children,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = "button",
  style = {},
  ...props
}) => {
  const baseStyles = {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    borderRadius: "8px",
    border: "none",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    transition: "all 0.2s ease-in-out",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: fullWidth ? "100%" : "auto",
    opacity: disabled || loading ? 0.6 : 1,
    textDecoration: "none",
  };

  const variants = {
    primary: {
      backgroundColor: "#FF7A00",
      color: "#FFFFFF",
      "&:hover": {
        backgroundColor: "#E66A00",
      },
    },
    secondary: {
      backgroundColor: "transparent",
      color: "#FF7A00",
      border: "2px solid #FF7A00",
      "&:hover": {
        backgroundColor: "#FF7A00",
        color: "#FFFFFF",
      },
    },
    ghost: {
      backgroundColor: "transparent",
      color: "#333333",
      "&:hover": {
        backgroundColor: "#F7F7F7",
      },
    },
  };

  const sizes = {
    small: {
      padding: "8px 16px",
      fontSize: "14px",
    },
    medium: {
      padding: "12px 24px",
      fontSize: "16px",
    },
    large: {
      padding: "16px 32px",
      fontSize: "18px",
    },
  };

  const buttonStyles = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size],
    ...style,
  };

  return (
    <button
      style={buttonStyles}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      {...props}
    >
      {loading && <span>⏳</span>}
      {children}
    </button>
  );
};

export default Button;
