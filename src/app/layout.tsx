import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sharma Clinic",
  description: "Foundational application for Sharma Clinic",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
