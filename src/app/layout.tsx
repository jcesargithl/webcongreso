import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IV Congreso Internacional de Investigación Científica | EPEP – UNA Puno",
  description:
    "Transformando la educación: investigación, innovación e inteligencia artificial para los desafíos del siglo XXI. 25–27 noviembre 2026 · Modalidad híbrida.",
  keywords:
    "congreso, investigación científica, educación, inteligencia artificial, innovación pedagógica, UNA Puno, EPEP",
  openGraph: {
    title: "IV Congreso Internacional de Investigación Científica",
    description:
      "Transformando la educación: investigación, innovación e IA para los desafíos del siglo XXI.",
    type: "website",
    locale: "es_PE",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
