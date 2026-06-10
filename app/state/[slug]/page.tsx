import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllStates, getStateBySlug } from '@/lib/states-data';
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/schema';
import { AuthorBox } from '@/components/AuthorBox';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { AdSlot } from '@/components/AdSlot';
import { StateRich } from '@/components/state/StateRich';
import { ENTITY_VINTAGE } from '@/lib/authorship';
import { StateHeroImage } from '@/components/StateHeroImage';
import { getStateImageByName } from '@/lib/state-images';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;
export const revalidate = 86400;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ingredipeek.com';

export function generateStaticParams() {
  return getAllStates().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) return {};
  const title = `Food Products & Ingredients in ${state.name} — Manufacturing, Organic Farms, FDA Facilities`;
  const description = `Explore ${state.name}'s food industry: ${state.foodManufacturingEstablishments.toLocaleString()} food manufacturers, ${state.organicFarmCount.toLocaleString()} organic farms, ${state.fdaRegisteredFacilities.toLocaleString()} FDA-registered facilities, and local specialty foods.`;
  return {
    title,
    description,
    alternates: { canonical: `/state/${slug}/` },
    openGraph: {
      title,
      description,
      url: `/state/${slug}/`,
      type: 'article',
    },
  };
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

export default async function StatePage({ params }: Props) {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) notFound();

  const allStates = getAllStates();
  const currentIndex = allStates.findIndex((s) => s.slug === slug);
  const prev = currentIndex > 0 ? allStates[currentIndex - 1] : null;
  const next = currentIndex < allStates.length - 1 ? allStates[currentIndex + 1] : null;

  const crumbs = [
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'By State', url: `${SITE_URL}/state/` },
    { name: state.name, url: `${SITE_URL}/state/${slug}/` },
  ];

  const faqs = [
    {
      question: `How many FDA-registered food facilities are in ${state.name}?`,
      answer: `${state.name} has approximately ${formatNumber(state.fdaRegisteredFacilities)} FDA-registered food facilities, covering manufacturing, processing, packing, and storage operations.`,
    },
    {
      question: `What are the top agricultural products in ${state.name}?`,
      answer: `The top agricultural products in ${state.name} include ${state.topAgriculturalProducts.join(', ')}. These drive the state's food manufacturing and processing sector.`,
    },
    {
      question: `How many organic farms does ${state.name} have?`,
      answer: `${state.name} has approximately ${formatNumber(state.organicFarmCount)} certified organic farms, contributing to the state's organic food production and local food systems.`,
    },
    {
      question: `What are ${state.name}'s local specialty foods?`,
      answer: `${state.name} is known for specialty foods including ${state.localSpecialtyFoods.join(', ')}. These reflect the state's unique culinary heritage and local ingredients.`,
    },
    {
      question: `How large is ${state.name}'s food manufacturing sector?`,
      answer: `${state.name}'s food manufacturing sector employs approximately ${formatNumber(state.foodManufacturingEmployees)} workers across ${formatNumber(state.foodManufacturingEstablishments)} establishments, making it a significant contributor to the state's economy.`,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />

      {/* Breadcrumb nav */}
      <nav className="text-sm text-slate-500 mb-4">
        <Link href="/" className="hover:text-green-700">Home</Link>
        <span className="mx-2">&rsaquo;</span>
        <Link href="/state/" className="hover:text-green-700">By State</Link>
        <span className="mx-2">&rsaquo;</span>
        <span className="text-slate-700">{state.name}</span>
      </nav>

      {(() => { const stateImage = getStateImageByName(state.name); return stateImage ? <StateHeroImage img={stateImage} /> : null; })()}

      <h1 className="text-3xl font-bold text-slate-900 mb-2">
        Food Products &amp; Ingredients in {state.name}
      </h1>
      <p className="text-slate-600 mb-6">{state.description}</p>

      {/* Key stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
          <div className="text-2xl font-bold text-green-800">{formatNumber(state.foodManufacturingEstablishments)}</div>
          <div className="text-xs text-slate-600 mt-1">Food Manufacturers</div>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
          <div className="text-2xl font-bold text-blue-800">{formatNumber(state.foodManufacturingEmployees)}</div>
          <div className="text-xs text-slate-600 mt-1">Manufacturing Jobs</div>
        </div>
        <div className="rounded-xl border border-lime-200 bg-lime-50 p-4 text-center">
          <div className="text-2xl font-bold text-lime-800">{formatNumber(state.organicFarmCount)}</div>
          <div className="text-xs text-slate-600 mt-1">Organic Farms</div>
        </div>
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-center">
          <div className="text-2xl font-bold text-orange-800">{formatNumber(state.fdaRegisteredFacilities)}</div>
          <div className="text-xs text-slate-600 mt-1">FDA Facilities</div>
        </div>
      </div>

      <AdSlot id="3741591457" />

      {/* Top agricultural products */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Top Agricultural Products</h2>
        <div className="flex flex-wrap gap-2">
          {state.topAgriculturalProducts.map((product) => (
            <span key={product} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white font-medium text-slate-700">
              {product}
            </span>
          ))}
        </div>
        <p className="text-sm text-slate-600 mt-3">
          These agricultural products form the foundation of {state.name}&apos;s food supply chain, supporting local food manufacturers and ingredient suppliers.
        </p>
      </section>

      {/* Local specialty foods */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Local Specialty Foods</h2>
        <div className="grid grid-cols-2 gap-3">
          {state.localSpecialtyFoods.map((food) => (
            <div key={food} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3">
              <span className="text-green-600 text-lg">🌿</span>
              <span className="text-sm font-medium text-slate-800">{food}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Food manufacturing details */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Food Manufacturing in {state.name}</h2>
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-700 bg-slate-50 w-1/2">Manufacturing Establishments</td>
                <td className="px-4 py-3 text-slate-900 font-semibold">{formatNumber(state.foodManufacturingEstablishments)}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-700 bg-slate-50">Manufacturing Employees</td>
                <td className="px-4 py-3 text-slate-900 font-semibold">{formatNumber(state.foodManufacturingEmployees)}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-700 bg-slate-50">Organic Certified Farms</td>
                <td className="px-4 py-3 text-slate-900 font-semibold">{formatNumber(state.organicFarmCount)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-700 bg-slate-50">FDA-Registered Facilities</td>
                <td className="px-4 py-3 text-slate-900 font-semibold">{formatNumber(state.fdaRegisteredFacilities)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Sources: USDA Census of Agriculture, FDA Registered Food Facilities, Bureau of Labor Statistics. Figures are approximate.
        </p>
      </section>

      <AdSlot id="9876543210" />

      {/* FAQ */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <details key={i} className="rounded-lg border border-slate-200 bg-white p-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="cursor-pointer font-semibold text-slate-900 flex items-center justify-between gap-2">
                <span>{f.question}</span>
                <span className="text-green-600 text-sm">+</span>
              </summary>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Prev/Next navigation */}
      <div className="flex justify-between items-center gap-4 border-t border-slate-200 pt-6 mb-8">
        {prev ? (
          <Link href={`/state/${prev.slug}/`} className="text-sm text-green-700 hover:underline">
            &larr; {prev.name}
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/state/${next.slug}/`} className="text-sm text-green-700 hover:underline">
            {next.name} &rarr;
          </Link>
        ) : <span />}
      </div>

      {/* CTA */}
      <section className="rounded-xl bg-green-50 border border-green-200 p-6 text-center mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Check ingredients for any product</h2>
        <p className="text-sm text-slate-600 mb-4">
          Use our ingredient checker to find allergens, additives, and dietary flags in thousands of food products.
        </p>
        <Link href="/checker/" className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
          Open Checker
        </Link>
      </section>


      <StateRich slug={slug} state={state} />

      <AuthorBox vintage={ENTITY_VINTAGE} source="USDA + FDA + state agriculture data" />
      <CrossSiteLinks current="IngrediPeek" />
    </div>
  );
}
