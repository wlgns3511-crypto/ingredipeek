import type { Metadata } from "next";
import { headers } from 'next/headers';
import { Inter } from "next/font/google";
import "./globals.css";
import { UpgradeAnalytics } from "@/components/upgrades/UpgradeAnalytics";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const SITE_NAME = "IngrediPeek";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ingredipeek.com";

const ROOT_LOCALES = ['es'] as const;
type RootLocale = (typeof ROOT_LOCALES)[number];
const ROOT_ALTERNATE_LANGUAGES = {
  en: `${SITE_URL}/`,
  es: `${SITE_URL}/es/`,
  'x-default': `${SITE_URL}/`,
} as const;

function getHtmlLang(pathname: string | null): string {
  const locale = pathname?.split('/').filter(Boolean)[0] as RootLocale | undefined;
  return locale && ROOT_LOCALES.includes(locale) ? locale : 'en';
}


export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} - Food Allergen & Ingredient Checker`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Check food allergens, ingredients, and dietary compatibility for thousands of products. Find gluten-free, vegan, halal, and nut-free foods instantly.",
  metadataBase: new URL(SITE_URL),
  alternates: { languages: ROOT_ALTERNATE_LANGUAGES },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  other: { "google-adsense-account": "ca-pub-5724806562146685" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const pathname = headerStore.get('x-pathname');
  const htmlLang = getHtmlLang(pathname);
  return (
    <html lang={htmlLang}>
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-SEE7EBSJ3C" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-SEE7EBSJ3C');`,
          }}
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5724806562146685"
          crossOrigin="anonymous"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "name": SITE_NAME,
              "url": SITE_URL,
              "description": "Check food allergens, ingredients, and dietary compatibility for thousands of products. Find gluten-free, vegan, halal, and nut-free foods instantly.",
              "inLanguage": "en-US",
              "potentialAction": {
                "@type": "SearchAction",
                "target": `${SITE_URL}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string"
              }
            },
            {
              "@type": "Organization",
              "name": SITE_NAME,
              "url": SITE_URL,
              "description": "Check food allergens, ingredients, and dietary compatibility for thousands of products. Find gluten-free, vegan, halal, and nut-free foods instantly.",
              "parentOrganization": {
                "@type": "Organization",
                "name": "DataPeek Research Network",
                "url": "https://datapeekfacts.com"
              }
            }
          ]
        }) }} />
      </head>
      <body
        className={`${inter.className} antialiased bg-white text-slate-900 min-h-screen flex flex-col`}
      >
        <UpgradeAnalytics />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-blue-600 focus:border focus:rounded">Skip to content</a>
        <header className="border-b border-green-100 bg-white sticky top-0 z-50 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-green-700 flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              {SITE_NAME}
            </a>
            <nav className="flex gap-5 text-sm font-medium">
              <a href="/allergen/gluten-free/" className="text-slate-600 hover:text-green-700 transition-colors">
                Gluten-Free
              </a>
              <a href="/allergen/vegan/" className="text-slate-600 hover:text-green-700 transition-colors">
                Vegan
              </a>
              <a href="/allergen/halal/" className="text-slate-600 hover:text-green-700 transition-colors">
                Halal
              </a>
              <a href="/checker/" className="text-slate-600 hover:text-green-700 transition-colors">
                Checker
              </a>
              <a href="/state/" className="text-slate-600 hover:text-green-700 transition-colors">By State</a>
              <a href="/guide/" className="text-slate-600 hover:text-green-700 transition-colors">Guides</a>
              <a href="/blog/" className="text-slate-600 hover:text-green-700 transition-colors">Articles</a>
              <a href="/about/" className="text-slate-600 hover:text-green-700 transition-colors">
                About
              </a>
              <a href="/es/" className="text-slate-600 hover:text-green-700 transition-colors font-semibold">
                ES
              </a>
            </nav>
          </div>
        </header>
        <main id="main-content" className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
          {children}
        </main>
        <footer className="border-t border-slate-200 mt-16">
          <div className="max-w-5xl mx-auto px-4 py-6 text-sm text-slate-500">
            <p className="font-medium text-slate-600 mb-1">{SITE_NAME}</p>
            <p className="text-xs">
              Food allergen and ingredient data powered by Open Food Facts, an open database of food products from around the world.
            </p>
            <p className="mt-3">
              <a href="/about/" className="hover:text-green-700">About</a>
              {" | "}
              <a href="/privacy/" className="hover:text-green-700">Privacy</a>
              {" | "}
              <a href="/terms/" className="hover:text-green-700">Terms</a>
              {" | "}
              <a href="/disclaimer/" className="hover:text-green-700">Disclaimer</a>
              {" | "}
              <a href="/contact/" className="hover:text-green-700">Contact</a>
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                Additional Resources
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                <a href="https://caloriewize.com" className="hover:text-green-700" rel="nofollow noopener">Nutrition</a>
                <a href="https://calcpeek.com" className="hover:text-green-700" rel="nofollow noopener">Calculators</a>
                <a href="https://nameblooms.com" className="hover:text-green-700" rel="nofollow noopener">Baby Names</a>
              </div>
            </div>
            <p className="mt-3 text-xs italic text-slate-400">Helping people with food allergies eat safer, every day.</p>
            <p className="mt-1 text-xs">
              &copy; {new Date().getFullYear()} {SITE_NAME}. Always verify allergen information with product packaging.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
