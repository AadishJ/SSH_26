import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RetinaAI — Diabetic Retinopathy Screening System",
  description:
    "AI-powered diabetic retinopathy screening for rural India. Automated fundus image analysis with Grad-CAM explainability, DR severity grading, and clinical reporting.",
  keywords: "diabetic retinopathy, AI screening, fundus analysis, ophthalmology, rural India, explainable AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
