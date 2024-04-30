import type { Metadata } from "next";
import "./globals.css";
import {Providers} from "./providers";

export const metadata: { description: string; title: string } = {
  title: "Chat App",
  description: "Front end of the chat app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" className='dark'>
      <body>
      <Providers>
        {children}
      </Providers>
      </body>
      </html>
  );
}
