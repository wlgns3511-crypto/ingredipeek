import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const SITE_NAME = "IngrediPeek";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ingredipeek.com";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} - Food Allergen & Ingredient Checker`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Check food allergens, ingredients, and dietary compatibility for thousands of products. Find gluten-free, vegan, halal, and nut-free foods instantly.",
  metadataBase: new URL(SITE_URL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-XXXXXXX');`,
          }}
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5724806562146685"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${inter.className} antialiased bg-white text-slate-900 min-h-screen flex flex-col`}
      >
        <header className="border-b border-green-100 bg-white sticky top-0 z-50 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-green-700 flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              {SITE_NAME}
            </a>
            <nav className="flex gap-5 text-sm font-medium">
              <a href="/allergen/gluten-free" className="text-slate-600 hover:text-green-700 transition-colors">
                Gluten-Free
              </a>
              <a href="/allergen/vegan" className="text-slate-600 hover:text-green-700 transition-colors">
                Vegan
              </a>
              <a href="/allergen/halal" className="text-slate-600 hover:text-green-700 transition-colors">
                Halal
              </a>
              <a href="/checker" className="text-slate-600 hover:text-green-700 transition-colors">
                Checker
              </a>
              <a href="/about" className="text-slate-600 hover:text-green-700 transition-colors">
                About
              </a>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
          {children}
        </main>
        <footer className="border-t border-slate-200 mt-16">
          <div className="max-w-5xl mx-auto px-4 py-6 text-sm text-slate-500">
            <p className="font-medium text-slate-600 mb-1">{SITE_NAME}</p>
            <p className="text-xs">
              Food allergen and ingredient data sourced from Open Food Facts, an open database of food products from around the world.
            </p>
            <p className="mt-3">
              <a href="/about" className="hover:text-green-700">About</a>
              {" | "}
              <a href="/privacy" className="hover:text-green-700">Privacy</a>
              {" | "}
              <a href="/terms" className="hover:text-green-700">Terms</a>
              {" | "}
              <a href="/contact" className="hover:text-green-700">Contact</a>
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                DataPeek Insights Network
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                <a href="https://salarybycity.com" className="hover:text-green-700">Salaries</a>
                <a href="https://costbycity.com" className="hover:text-green-700">Cost of Living</a>
                <a href="https://zippeek.com" className="hover:text-green-700">ZIP Codes</a>
                <a href="https://guidebycity.com" className="hover:text-green-700">City Guides</a>
                <a href="https://degreewize.com" className="hover:text-green-700">Colleges</a>
                <a href="https://caloriewize.com" className="hover:text-green-700">Nutrition</a>
                <a href="https://nameblooms.com" className="hover:text-green-700">Baby Names</a>
                <a href="https://vocabwize.com" className="hover:text-green-700">Vocabulary</a>
                <a href="https://calcpeek.com" className="hover:text-green-700">Calculators</a>
                <a href="https://tariffpeek.com" className="hover:text-green-700">HS Codes &amp; Tariffs</a>
              </div>
            </div>
            <p className="mt-2 text-xs">
              &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved. Always verify allergen information with product packaging.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
