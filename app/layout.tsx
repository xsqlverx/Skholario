import type { Metadata, Viewport } from "next";
import { Shell } from "@/components/study/Shell";
import { EmailSyncModal } from "@/components/study/EmailSyncModal";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Study Hub — One topic at a time",
    template: "%s · Study Hub",
  },
  description:
    "Your subjects, your next topic, your little bit of progress. A personal study space for B.Tech students.",
  icons: { icon: "/icon.svg", apple: "/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#f5f3eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Shell>
          <EmailSyncModal />
          {children}
        </Shell>
      </body>
    </html>
  );
}
