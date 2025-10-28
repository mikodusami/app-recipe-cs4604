// Frontend configuration settings
interface Config {
  apiBaseUrl: string;
  apiKey: string;
  environment: string;
}

// Get configuration from environment variables
const getConfig = (): Config => {
  return {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000",
    apiKey: process.env.API_KEY || "dev",
    environment: process.env.NODE_ENV || "development",
  };
};

export const config = getConfig();

// // Validation function to ensure required env vars are set
// export const validateConfig = (): void => {
//   // Skip validation during build time
//   if (typeof window === "undefined" && process.env.NODE_ENV === "production") {
//     return;
//   }

//   const requiredEnvVars = ["API_BASE_URL", "API_KEY"];

//   const missingVars = requiredEnvVars.filter(
//     (varName) => !process.env[varName]
//   );

//   if (missingVars.length > 0) {
//     console.warn(
//       `Warning: Missing environment variables in ${config.environment}:`,
//       missingVars.join(", ")
//     );

//     // Only throw error in production runtime (not build time)
//     if (config.environment === "production" && typeof window !== "undefined") {
//       throw new Error(
//         `Required environment variables missing: ${missingVars.join(", ")}`
//       );
//     }
//   }
// };
