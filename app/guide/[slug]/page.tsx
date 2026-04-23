import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllGuides, getGuideBySlug } from '@/lib/guides';
import { breadcrumbJsonLd, faqJsonLd, articleSchema } from '@/lib/schema';
import { AuthorBox } from '@/components/AuthorBox';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { TrustBlock } from '@/components/upgrades/TrustBlock';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;
export const revalidate = 86400;

export function generateStaticParams() {
  return getAllGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guide/${slug}/` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `/guide/${slug}/`,
      type: 'article',
      modifiedTime: guide.updatedAt,
    },
    other: { 'article:modified_time': guide.updatedAt },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'Guides', url: '/guide/' },
    { name: guide.title, url: `/guide/${slug}/` },
  ];

  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(guide.faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema({ title: guide.title, description: guide.description, slug: `guide/${slug}`, publishedAt: guide.updatedAt, updatedAt: guide.updatedAt, category: guide.category })) }} />

      <nav className="not-prose text-sm text-slate-500 mb-4">
        <Link href="/" className="hover:text-green-700">Home</Link>
        <span className="mx-2">&rsaquo;</span>
        <Link href="/guide/" className="hover:text-green-700">Guides</Link>
        <span className="mx-2">&rsaquo;</span>
        <span className="text-slate-700">{guide.title}</span>
      </nav>

      <h1>{guide.title}</h1>
      <p className="not-prose text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Last updated <time dateTime={guide.updatedAt}>{guide.updatedAt}</time>
        </span>
        {' · '}
        <span>{guide.category}</span>
        {' · '}
        <a href="/methodology/" className="text-green-700 hover:underline">Methodology</a>
      </p>

      <div dangerouslySetInnerHTML={{ __html: guide.intro }} />

      <TrustBlock sources={[{name:"Open Food Facts",url:"https://world.openfoodfacts.org/"},{name:"FDA Standards",url:"https://www.fda.gov/food"},{name:"USDA Standards",url:"https://www.usda.gov/"}]} updated="Open Food Facts live database" />

      {/* Table of contents */}
      <nav aria-label="Table of contents" className="not-prose my-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">On this page</p>
        <ol className="space-y-1.5 text-sm">
          {guide.sections.map((s, i) => (
            <li key={i}>
              <a href={`#section-${i}`} className="text-green-700 hover:underline">{s.heading}</a>
            </li>
          ))}
          <li><a href="#faq" className="text-green-700 hover:underline">Frequently Asked Questions</a></li>
        </ol>
      </nav>

      {guide.sections.map((s, i) => (
        <section key={i} id={`section-${i}`}>
          <h2>{s.heading}</h2>
          <div dangerouslySetInnerHTML={{ __html: s.html }} />
        </section>
      ))}

      <section id="faq">
        <h2>Frequently Asked Questions</h2>
        <div className="not-prose space-y-3">
          {guide.faqs.map((f, i) => (
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

      <AuthorBox />
      <CrossSiteLinks current="IngrediPeek" />
    </article>
  );
}
