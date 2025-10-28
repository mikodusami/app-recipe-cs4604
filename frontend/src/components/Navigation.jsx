import { Link, Outlet, useNavigate } from "react-router-dom";
import { Fragment } from "react";
import { useUser } from "../contexts/UserContext";
import Icon from "./ui/Icon";
import Button from "./ui/Button";

const Navigation = () => {
  const { user, logout, isAuthenticated } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navStyles = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    zIndex: 1000,
    borderBottom: "1px solid #E5E5E5",
  };

  const containerStyles = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "80px",
  };

  const logoStyles = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    fontSize: "20px",
    fontWeight: 700,
    color: "#FF7A00",
    textDecoration: "none",
  };

  const navLinksStyles = {
    display: "flex",
    alignItems: "center",
    gap: "32px",
  };

  const linkStyles = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#333333",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: 500,
    padding: "8px 16px",
    borderRadius: "6px",
    transition: "all 0.2s ease-in-out",
  };

  const userInfoStyles = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  };

  const welcomeTextStyles = {
    fontSize: "16px",
    color: "#333333",
    fontWeight: 500,
  };

  return (
    <Fragment>
      <nav style={navStyles}>
        <div style={containerStyles}>
          {/* Logo */}
          <Link to="/" style={logoStyles}>
            <Icon name="chef" size={32} color="#FF7A00" />
            Recipe Assistant
          </Link>

          {/* Navigation Links */}
          <div style={navLinksStyles}>
            <Link
              to="/"
              style={linkStyles}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#F7F7F7")}
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "transparent")
              }
            >
              <Icon name="home" size={20} />
              Home
            </Link>

            {/* Authentication Section */}
            {isAuthenticated ? (
              <div style={userInfoStyles}>
                <span style={welcomeTextStyles}>
                  Welcome, {user?.email?.split("@")[0] || "User"}!
                </span>
                <Link
                  to="/profile"
                  style={linkStyles}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#F7F7F7")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "transparent")
                  }
                >
                  <Icon name="user" size={20} />
                  Profile
                </Link>
                <Button variant="ghost" size="small" onClick={handleLogout}>
                  <Icon name="logout" size={16} />
                  Logout
                </Button>
              </div>
            ) : (
              <div style={userInfoStyles}>
                <Link to="/sign-in">
                  <Button variant="ghost" size="small">
                    <Icon name="login" size={16} />
                    Sign In
                  </Button>
                </Link>
                <Link to="/sign-up">
                  <Button variant="primary" size="small">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      <div style={{ paddingTop: "80px" }}>
        <Outlet />
      </div>
    </Fragment>
  );
};

export default Navigation;
