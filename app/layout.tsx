import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexora — your work, in rhythm",
  description: "A thoughtful workspace for your tasks, projects, and focus.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" data-theme="dark">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
