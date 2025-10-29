import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { UserProvider } from "@/contexts/UserContext";
import { DevIndicator } from "@/components/DevIndicator";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
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
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased`}
      >
        <UserProvider>
          {children}
          <DevIndicator />
        </UserProvider>
      </body>
    </html>
  );
}
