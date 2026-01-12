import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Plenartrend | Intelligent Information Mining",
  description: "Web database for political trend analysis and campaign management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full bg-slate-50">
      <body className={`${inter.className} h-full`}>
         <ClientLayout>
           {children}
         </ClientLayout>
      </body>
    </html>
  );
}
