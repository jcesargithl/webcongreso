import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IV Congreso EPEP",
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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
