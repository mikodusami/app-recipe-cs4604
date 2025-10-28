import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/api";
import Input from "./ui/Input";
import Button from "./ui/Button";
import Icon from "./ui/Icon";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const result = await authService.register({ email, password });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/sign-in");
        }, 2000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const containerStyles = {
    minHeight: "calc(100vh - 80px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    backgroundColor: "#F9F9F9",
  };

  const cardStyles = {
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    padding: "40px",
    width: "100%",
    maxWidth: "400px",
  };

  const headerStyles = {
    textAlign: "center",
    marginBottom: "32px",
  };

  const titleStyles = {
    fontSize: "28px",
    fontWeight: 700,
    color: "#333333",
    marginBottom: "8px",
  };

  const subtitleStyles = {
    fontSize: "16px",
    color: "#737373",
  };

  const formStyles = {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  };

  const errorStyles = {
    backgroundColor: "#EF4444",
    color: "#FFFFFF",
    padding: "16px",
    borderRadius: "6px",
    fontSize: "16px",
    textAlign: "center",
  };

  const successStyles = {
    backgroundColor: "#10B981",
    color: "#FFFFFF",
    padding: "16px",
    borderRadius: "6px",
    fontSize: "16px",
    textAlign: "center",
  };

  const linkContainerStyles = {
    textAlign: "center",
    marginTop: "24px",
    padding: "24px",
    borderTop: "1px solid #E5E5E5",
  };

  const linkTextStyles = {
    fontSize: "16px",
    color: "#737373",
  };

  const linkStyles = {
    color: "#FF7A00",
    fontWeight: 500,
    textDecoration: "none",
  };

  if (success) {
    return (
      <div style={containerStyles}>
        <div style={cardStyles}>
          <div style={headerStyles}>
            <Icon name="user" size={48} color="#10B981" />
            <h1 style={titleStyles}>Account Created!</h1>
            <p style={subtitleStyles}>
              Your account has been successfully created. Redirecting to sign
              in...
            </p>
          </div>
          <div style={successStyles}>Welcome to Recipe Assistant! 🎉</div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        <div style={headerStyles}>
          <Icon name="user" size={48} color="#FF7A00" />
          <h1 style={titleStyles}>Create Account</h1>
          <p style={subtitleStyles}>
            Join Recipe Assistant to start your culinary journey
          </p>
        </div>

        {error && <div style={errorStyles}>{error}</div>}

        <form style={formStyles} onSubmit={handleSignUp}>
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Create a password (min. 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            loading={loading}
            disabled={!email || !password || !confirmPassword}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div style={linkContainerStyles}>
          <p style={linkTextStyles}>
            Already have an account?{" "}
            <Link to="/sign-in" style={linkStyles}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
