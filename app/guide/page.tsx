import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllGuides } from '@/lib/guides';

export const metadata: Metadata = {
  title: 'Ingredient Guides — GRAS, Additives, Labels, Allergens, Seed Oils',
  description: 'In-depth guides on food ingredients, GRAS additives, allergen labeling, seed oils, and how to decode ingredient lists — backed by FDA and Open Food Facts data.',
  alternates: { canonical: '/guide/' },
  openGraph: { url: '/guide/' },
};

export default function GuidesIndex() {
  const guides = getAllGuides();
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Ingredient Guides',
            url: 'https://ingredipeek.com/guide/',
            numberOfItems: guides.length,
            itemListElement: guides.map((g, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: g.title,
              url: `https://ingredipeek.com/guide/${g.slug}/`,
            })),
          }),
        }}
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Ingredient Guides</h1>
        <p className="text-slate-600 max-w-3xl">
          Long-form, evidence-based guides on food ingredients and additives — GRAS substances,
          allergen labeling rules, seed oil science, and how to read ingredient lists like a pro.
          Every guide links to our ingredient checker so you can verify claims instantly.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        {guides.map((g) => (
          <Link
            key={g.slug}
            href={`/guide/${g.slug}/`}
            className="block rounded-xl border border-slate-200 hover:border-green-400 hover:bg-green-50 p-5 transition-colors"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-green-600 mb-1">{g.category}</div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">{g.title}</h2>
            <p className="text-sm text-slate-600">{g.description}</p>
          </Link>
        ))}
      </div>

      <section className="mt-12 rounded-xl bg-green-50 border border-green-200 p-6 text-center">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Check any product&apos;s ingredients</h2>
        <p className="text-sm text-slate-600 mb-4">Use our ingredient checker to find allergens, additives, and dietary flags in thousands of products.</p>
        <Link href="/checker/" className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
          Open Checker
        </Link>
      </section>
    </div>
  );
}
