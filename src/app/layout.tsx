import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IV Congreso Internacional de Investigación Científica",
  description: "Congreso híbrido de investigación científica EPEP.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es"><body>{children}</body></html>
  );
}
