import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "I Congreso Internacional de Investigación Científica",
  description: "I Congreso Internacional de Investigación Científica: Perspectivas, desafíos y políticas educativas.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es"><body>{children}</body></html>
  );
}
