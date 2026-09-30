import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IV Congreso Internacional de Investigación Científica",
  description: "Transformando la educación: investigación, innovación e inteligencia artificial para los desafíos del siglo XXI.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es"><body>{children}</body></html>
  );
}
