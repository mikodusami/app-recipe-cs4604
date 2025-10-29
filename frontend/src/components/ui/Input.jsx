import React from "react";

const Input = ({
  label,
  error,
  type = "text",
  placeholder,
  value,
  onChange,
  disabled = false,
  fullWidth = false,
  style = {},
  ...props
}) => {
  const inputStyles = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "16px",
    padding: "12px 16px",
    border: `2px solid ${error ? "#EF4444" : "#D1D1D1"}`,
    borderRadius: "8px",
    backgroundColor: disabled ? "#F7F7F7" : "#FFFFFF",
    color: "#333333",
    width: fullWidth ? "100%" : "auto",
    outline: "none",
    transition: "border-color 0.2s ease-in-out",
    boxSizing: "border-box",
    ...style,
  };

  const labelStyles = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "16px",
    fontWeight: 500,
    color: "#333333",
    marginBottom: "8px",
    display: "block",
  };

  const errorStyles = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "14px",
    color: "#EF4444",
    marginTop: "8px",
  };

  const containerStyles = {
    width: fullWidth ? "100%" : "auto",
  };

  return (
    <div style={containerStyles}>
      {label && <label style={labelStyles}>{label}</label>}
      <input
        style={inputStyles}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        onFocus={(e) => (e.target.style.borderColor = "#FF7A00")}
        onBlur={(e) =>
          (e.target.style.borderColor = error ? "#EF4444" : "#D1D1D1")
        }
        {...props}
      />
      {error && <div style={errorStyles}>{error}</div>}
    </div>
  );
};

export default Input;
