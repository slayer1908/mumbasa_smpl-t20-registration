import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const eventName =
  process.env.NEXT_PUBLIC_EVENT_NAME || "Summer Mombasa Premier League T20";

export const metadata: Metadata = {
  title: `${eventName} | Player Registration`,
  description:
    "Official individual player registration for the Summer Mombasa Premier League T20 - Kenya Tour. Register now, secure your spot on tour.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
