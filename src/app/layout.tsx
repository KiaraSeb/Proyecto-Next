import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sitio de Reseñas de Libros",
  description: "Deja tu reseña del libro que leíste :)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono&family=Geist+Sans&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-geist">
        {children}
      </body>
    </html>
  );
}
