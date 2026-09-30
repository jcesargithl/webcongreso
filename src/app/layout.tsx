import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IV Congreso Internacional de Investigación Científica",
  description: "Transformando la educación: investigación, innovación e inteligencia artificial para los desafíos del siglo XXI.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;800;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
