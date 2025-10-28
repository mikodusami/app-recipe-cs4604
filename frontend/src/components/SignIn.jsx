import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { authService } from "../services/api";
import Input from "./ui/Input";
import Button from "./ui/Button";
import Icon from "./ui/Icon";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useUser();
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await authService.authenticate({ email, password });

      if (result.success) {
        login(result.data);
        navigate("/");
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

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        <div style={headerStyles}>
          <Icon name="login" size={48} color="#FF7A00" />
          <h1 style={titleStyles}>Welcome Back</h1>
          <p style={subtitleStyles}>Sign in to your account to continue</p>
        </div>

        {error && <div style={errorStyles}>{error}</div>}

        <form style={formStyles} onSubmit={handleSignIn}>
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
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            loading={loading}
            disabled={!email || !password}
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <div style={linkContainerStyles}>
          <p style={linkTextStyles}>
            Don't have an account?{" "}
            <Link to="/sign-up" style={linkStyles}>
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
