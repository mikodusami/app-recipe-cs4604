"use client";

import { useState, useEffect } from "react";
import { config } from "@/lib/config";

export function DevIndicator() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [buildTime, setBuildTime] = useState<string>("");

  useEffect(() => {
    // Show indicator in development
    const isDev = config.environment === "development";
    setIsVisible(isDev);

    // Set build time
    setBuildTime(new Date().toLocaleString());
  }, []);

  // if (!isVisible) return null;

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Double click to hide completely (useful for screenshots)
    setIsVisible(false);
    setTimeout(() => setIsVisible(true), 5000); // Show again after 5 seconds
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div
        className={`
          bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-lg cursor-pointer
          transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl
          ${isExpanded ? "w-72 p-4" : "px-3 py-2"}
          border border-orange-400
        `}
        onClick={handleToggle}
        onDoubleClick={handleDoubleClick}
        title="Click to expand, double-click to hide temporarily"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="font-bold text-sm tracking-wide">
            {isExpanded ? "DEVELOPMENT MODE" : "DEV"}
          </span>
          {!isExpanded && (
            <div className="text-xs opacity-75">{config.environment}</div>
          )}
        </div>

        {isExpanded && (
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <div className="font-semibold text-orange-200">Environment</div>
                <div className="font-mono bg-orange-600 px-2 py-1 rounded">
                  {config.environment}
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-semibold text-orange-200">API Key</div>
                <div className="font-mono bg-orange-600 px-2 py-1 rounded">
                  {config.apiKey === "dev"
                    ? "dev"
                    : `${config.apiKey.substring(0, 3)}***`}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-semibold text-orange-200 text-xs">
                API Endpoint
              </div>
              <div className="font-mono text-xs bg-orange-600 px-2 py-1 rounded break-all">
                {config.apiBaseUrl}
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-semibold text-orange-200 text-xs">
                Session Started
              </div>
              <div className="font-mono text-xs bg-orange-600 px-2 py-1 rounded">
                {buildTime}
              </div>
            </div>

            <div className="pt-2 border-t border-orange-400">
              <div className="text-center text-xs opacity-75">
                Click to collapse • Double-click to hide
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
