import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Multipart file upload",
  description: "Multipart file upload generated with next js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link
          rel="stylesheet"
          href="https://site-assets.fontawesome.com/releases/v6.7.2/css/all.css"
        />
      </head>
      <body
        className={`${geistSans.className} bg-main bg-cover bg-no-repeat bg-fixed bg-center bg-blend-multiply bg-black/10`}
      >
        {children}
      </body>
    </html>
  );
}
