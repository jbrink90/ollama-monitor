import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Ollama Monitor - Monitor Local AI Models and GPU Usage",
    template: "%s | Ollama Monitor",
  },
  description:
    "Monitor locally running Ollama models, GPU and VRAM usage, CPU and RAM usage, context length, and model activity with a lightweight, cross-platform dashboard.",
  keywords: [
    "Ollama Monitor",
    "Ollama dashboard",
    "Ollama monitoring",
    "Ollama GPU monitor",
    "Ollama VRAM usage",
    "Ollama GPU usage",
    "local AI monitor",
    "local LLM monitor",
    "Ollama resource monitor",
    "LLM monitoring",
    "local AI dashboard",
    "self hosted AI",
    "open source",
  ],
  authors: [
    {
      name: "Jbrink90",
    },
  ],
  applicationName: "Ollama Monitor",
  openGraph: {
    title: "Ollama Monitor - Monitor Local AI Models and GPU Usage",
    description:
      "A lightweight, cross-platform dashboard for monitoring locally running Ollama models and system resources.",
    type: "website",
    siteName: "Ollama Monitor",
  },
  twitter: {
    card: "summary",
    title: "Ollama Monitor - Monitor Local AI Models and GPU Usage",
    description:
      "A lightweight, cross-platform dashboard for monitoring locally running Ollama models and system resources.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
