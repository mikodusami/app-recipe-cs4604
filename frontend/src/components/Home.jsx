import React from "react";
import { useUser } from "../contexts/UserContext";
import Icon from "./ui/Icon";
import { colors, spacing, typography } from "../theme/tokens";

const Home = () => {
  const { isAuthenticated, user } = useUser();

  const containerStyles = {
    minHeight: "calc(100vh - 80px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    textAlign: "center",
  };

  const iconContainerStyles = {
    marginBottom: spacing.lg,
  };

  const titleStyles = {
    fontSize: typography.fontSize.h1,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.text,
    marginBottom: spacing.md,
  };

  const subtitleStyles = {
    fontSize: typography.fontSize.body,
    color: colors.neutral.gray[600],
    marginBottom: spacing.lg,
  };

  const welcomeStyles = {
    fontSize: typography.fontSize.h3,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  };

  return (
    <div style={containerStyles}>
      <div style={iconContainerStyles}>
        <Icon name="chef" size={80} color={colors.primary} />
      </div>

      <h1 style={titleStyles}>Recipe Assistant</h1>
      <p style={subtitleStyles}>
        Your cooking companion for discovering and managing recipes
      </p>

      {isAuthenticated && (
        <p style={welcomeStyles}>
          Welcome back, {user?.email?.split("@")[0] || "Chef"}! 👋
        </p>
      )}
    </div>
  );
};

export default Home;
