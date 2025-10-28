import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { UserProvider } from "@/contexts/UserContext";
import { DevIndicator } from "@/components/DevIndicator";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Recipe Assistant",
  description: "Your cooking companion for discovering and managing recipes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <UserProvider>
          {children}
          <DevIndicator />
        </UserProvider>
      </body>
    </html>
  );
}
