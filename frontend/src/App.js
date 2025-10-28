import React from "react";
import { Routes, Route } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import Navigation from "./components/Navigation";
import Home from "./components/Home";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Profile from "./components/Profile";
import "./App.css";

// Loading component
const LoadingScreen = () => {
  const containerStyles = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#F9F9F9",
  };

  const textStyles = {
    marginTop: "16px",
    fontSize: "1rem",
    color: "#737373",
  };

  return (
    <div style={containerStyles}>
      <div className="spinner"></div>
      <p style={textStyles}>Loading Recipe Assistant...</p>
    </div>
  );
};

function App() {
  const { loading } = useUser();

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Navigation />}>
          <Route index element={<Home />} />
          <Route path="sign-in" element={<SignIn />} />
          <Route path="sign-up" element={<SignUp />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
