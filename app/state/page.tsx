import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllStates } from '@/lib/states-data';
import { breadcrumbJsonLd } from '@/lib/schema';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ingredipeek.com';

export const metadata: Metadata = {
  title: 'Food Products & Ingredients by State — All 50 States + DC',
  description: 'Explore food manufacturing, organic farms, FDA-registered facilities, and local specialty foods across all 50 US states and Washington, D.C.',
  alternates: { canonical: '/state/' },
  openGraph: { url: '/state/' },
};

export default function StatesIndex() {
  const states = getAllStates();

  const crumbs = [
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'By State', url: `${SITE_URL}/state/` },
  ];

  const totalManufacturers = states.reduce((sum, s) => sum + s.foodManufacturingEstablishments, 0);
  const totalOrganic = states.reduce((sum, s) => sum + s.organicFarmCount, 0);
  const totalFda = states.reduce((sum, s) => sum + s.fdaRegisteredFacilities, 0);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(crumbs)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Food Products & Ingredients by State',
            url: `${SITE_URL}/state/`,
            numberOfItems: states.length,
            itemListElement: states.map((s, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: s.name,
              url: `${SITE_URL}/state/${s.slug}/`,
            })),
          }),
        }}
      />

      <header className="mb-8">
        <nav className="text-sm text-slate-500 mb-4">
          <Link href="/" className="hover:text-green-700">Home</Link>
          <span className="mx-2">&rsaquo;</span>
          <span className="text-slate-700">By State</span>
        </nav>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Food Products &amp; Ingredients by State</h1>
        <p className="text-slate-600 max-w-3xl">
          Explore food manufacturing, organic farming, FDA-registered facilities, and local specialty foods across all 50 US states and Washington, D.C.
        </p>
      </header>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
          <div className="text-2xl font-bold text-green-800">{totalManufacturers.toLocaleString()}</div>
          <div className="text-xs text-slate-600 mt-1">Food Manufacturers</div>
        </div>
        <div className="rounded-xl border border-lime-200 bg-lime-50 p-4 text-center">
          <div className="text-2xl font-bold text-lime-800">{totalOrganic.toLocaleString()}</div>
          <div className="text-xs text-slate-600 mt-1">Organic Farms</div>
        </div>
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-center">
          <div className="text-2xl font-bold text-orange-800">{totalFda.toLocaleString()}</div>
          <div className="text-xs text-slate-600 mt-1">FDA Facilities</div>
        </div>
      </div>

      {/* State grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {states.map((s) => (
          <Link
            key={s.slug}
            href={`/state/${s.slug}/`}
            className="block rounded-xl border border-slate-200 hover:border-green-400 hover:bg-green-50 p-4 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-slate-900">{s.name}</h2>
              <span className="text-xs font-mono text-slate-400">{s.code}</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
              <span>{s.foodManufacturingEstablishments.toLocaleString()} manufacturers</span>
              <span>{s.organicFarmCount.toLocaleString()} organic farms</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {s.localSpecialtyFoods.slice(0, 2).map((food) => (
                <span key={food} className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">
                  {food}
                </span>
              ))}
              {s.localSpecialtyFoods.length > 2 && (
                <span className="text-xs text-slate-400">+{s.localSpecialtyFoods.length - 2} more</span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* CTA */}
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
