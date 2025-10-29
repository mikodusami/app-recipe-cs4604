import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { userService } from "../services/api";
import Input from "./ui/Input";
import Button from "./ui/Button";
import Icon from "./ui/Icon";

const Profile = () => {
  const { user, updateUser, logout, isAuthenticated } = useUser();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/sign-in");
      return;
    }

    if (user) {
      setEmail(user.email || "");
    }
  }, [user, isAuthenticated, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const updateData = { email };
      if (password) {
        updateData.password = password;
      }

      const result = await userService.updateProfile(user.id, updateData);

      if (result.success) {
        updateUser(result.data);
        setSuccess("Profile updated successfully!");
        setPassword(""); // Clear password field
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const result = await userService.deleteUser(user.id);

      if (result.success) {
        logout();
        navigate("/");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to delete account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  const containerStyles = {
    minHeight: "calc(100vh - 80px)",
    padding: "40px 24px",
    backgroundColor: "#F9F9F9",
  };

  const contentStyles = {
    maxWidth: "800px",
    margin: "0 auto",
  };

  const headerStyles = {
    textAlign: "center",
    marginBottom: "40px",
  };

  const titleStyles = {
    fontSize: "40px",
    fontWeight: 700,
    color: "#333333",
    marginBottom: "8px",
  };

  const subtitleStyles = {
    fontSize: "16px",
    color: "#737373",
  };

  const cardStyles = {
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    padding: "32px",
    marginBottom: "24px",
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
    marginBottom: "24px",
  };

  const successStyles = {
    backgroundColor: "#10B981",
    color: "#FFFFFF",
    padding: "16px",
    borderRadius: "6px",
    fontSize: "16px",
    textAlign: "center",
    marginBottom: "24px",
  };

  const sectionTitleStyles = {
    fontSize: "20px",
    fontWeight: 600,
    color: "#333333",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const infoItemStyles = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 0",
    borderBottom: "1px solid #E5E5E5",
  };

  const labelStyles = {
    fontSize: "16px",
    fontWeight: 500,
    color: "#333333",
  };

  const valueStyles = {
    fontSize: "16px",
    color: "#737373",
  };

  const dangerZoneStyles = {
    marginTop: "40px",
    padding: "24px",
    border: "2px solid #EF4444",
    borderRadius: "8px",
    backgroundColor: "#FEF2F2",
  };

  const dangerTitleStyles = {
    fontSize: "20px",
    fontWeight: 600,
    color: "#EF4444",
    marginBottom: "16px",
  };

  const dangerTextStyles = {
    fontSize: "16px",
    color: "#333333",
    marginBottom: "24px",
  };

  return (
    <div style={containerStyles}>
      <div style={contentStyles}>
        <div style={headerStyles}>
          <Icon name="user" size={64} color="#FF7A00" />
          <h1 style={titleStyles}>My Profile</h1>
          <p style={subtitleStyles}>
            Manage your account settings and preferences
          </p>
        </div>

        {error && <div style={errorStyles}>{error}</div>}
        {success && <div style={successStyles}>{success}</div>}

        {/* Account Information */}
        <div style={cardStyles}>
          <h2 style={sectionTitleStyles}>
            <Icon name="user" size={24} />
            Account Information
          </h2>

          <div style={infoItemStyles}>
            <span style={labelStyles}>User ID</span>
            <span style={valueStyles}>#{user?.id}</span>
          </div>

          <div style={infoItemStyles}>
            <span style={labelStyles}>Role</span>
            <span style={valueStyles}>{user?.role || "Standard"}</span>
          </div>

          <div style={infoItemStyles}>
            <span style={labelStyles}>Member Since</span>
            <span style={valueStyles}>
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString()
                : "N/A"}
            </span>
          </div>
        </div>

        {/* Update Profile */}
        <div style={cardStyles}>
          <h2 style={sectionTitleStyles}>
            <Icon name="user" size={24} />
            Update Profile
          </h2>

          <form style={formStyles} onSubmit={handleUpdateProfile}>
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
            />

            <Input
              label="New Password (optional)"
              type="password"
              placeholder="Leave blank to keep current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={!email}
            >
              Update Profile
            </Button>
          </form>
        </div>

        {/* Danger Zone */}
        <div style={dangerZoneStyles}>
          <h2 style={dangerTitleStyles}>Danger Zone</h2>
          <p style={dangerTextStyles}>
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
          <Button
            variant="secondary"
            onClick={handleDeleteAccount}
            disabled={loading}
            style={{
              backgroundColor: "#EF4444",
              color: "#FFFFFF",
              borderColor: "#EF4444",
            }}
          >
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
