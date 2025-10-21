"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { AuthProvider } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Footer from "@/components/Footer";
import clsx from "clsx";
import { useState } from "react";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <html lang="vi" className="h-full">
      <body
        className={clsx(
          geistSans.variable,
          geistMono.variable,
          "antialiased h-full bg-[#f7fbff] text-gray-800"
        )}
      >
        <AuthProvider>
          <Providers>
            <div className="flex h-screen overflow-hidden">
              {/* ===== SIDEBAR ===== */}
              <aside
                className={clsx(
                  "border-r border-gray-200 shadow-sm flex-shrink-0 flex flex-col bg-white transition-all duration-300",
                  collapsed ? "w-[78px]" : "w-[280px]"
                )}
              >
                <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
              </aside>

              {/* ===== MAIN CONTENT AREA ===== */}
              <div
                className={clsx(
                  "flex flex-col flex-1 min-h-0 bg-[#F7FBFF] transition-all duration-300"
                )}
              >
                {/* ===== TOPBAR ===== */}
                <header
                  className={clsx(
                    "sticky top-0 z-30 flex items-center justify-between h-[64px] bg-[#DFF2FD] p-6",
                  )}
                >
                  <Topbar />
                </header>

                {/* ===== PAGE CONTENT ===== */}
                <main
                  className={clsx(
                    "flex-1 overflow-y-auto px-6 py-6 text-gray-900",
                    "bg-[#DFF2FD]"
                  )}
                  style={{
                    transition: "all 0.3s ease-in-out",
                    marginLeft: collapsed ? "0" : "0", // để auto fit, không dư khoảng trắng
                  }}
                >
                  {children}
                </main>

                {/* ===== FOOTER ===== */}
                <footer
                  className={clsx(
                    "h-[48px] bg-white border-t border-gray-200 shadow-sm",
                    "flex items-center justify-center text-sm text-gray-600",
                    "transition-all duration-300"
                  )}
                >
                  <Footer />
                </footer>
              </div>
            </div>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
