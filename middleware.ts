// HCU 2026-04-24 crawl hygiene middleware for ingredipeek.
//
// Problem: 1-month-old site with 21k products + 1.2k compares ships too
// thin — Google shows 41k discovered-not-indexed, 8.3k soft-404-ish,
// 4.5k duplicate-no-canonical on /compare/, and only 56% of bot crawls
// return 200. Solution is crawl-budget surgery:
//
//   1. 410 Gone for all /es/product/*  — Spanish tree is 1,000 thin pages
//      (sparse translation, no clicks in GSC). Keep only /es/ landing for
//      hreflang.
//   2. 410 Gone for /compare/<slug>/ when slug is NOT in the 200-slug
//      keep-set (100 canonical pairs + their reverses). Google has queued
//      4,551 duplicate-no-canonical /compare/ URLs — these deindex fast
//      under 410.
//   3. 410 Gone for /product/<slug>/ when slug is NOT in the 2,000-slug
//      keep-set (top-brand, real-ingredients filter from build-keep-sets).
//   4. 301 www.ingredipeek.com -> ingredipeek.com backup. next.config.ts
//      already does this but Google is STILL crawling www 16,681x/day,
//      suggesting pre-301 crawl queue. Middleware catches anything that
//      slips past the Next.js redirect layer.
//
// Keep-sets are built at build time via scripts/build-keep-sets.ts and
// imported as plain JSON — Edge-runtime safe (no fs, no sqlite).
//
// 410 vs 404: 410 is a stronger deindex signal (permanent vs temporary).
// Same pattern used on tariffpeek yesterday — 6,843 pages 410'd, ~800
// confirmed dropped within 24h of IndexNow submission.

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import productKeep from '@/lib/generated/product-keep.json';
import compareKeep from '@/lib/generated/compare-keep.json';

const PRODUCT_KEEP = new Set<string>(productKeep as string[]);
const COMPARE_KEEP = new Set<string>(compareKeep as string[]);

// Strip optional trailing slash so keep-set lookups are slash-agnostic.
// (next.config trailingSlash=true but crawlers hit both forms.)
function stripSlash(p: string): string {
  return p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p;
}

function gone(): NextResponse {
  return new NextResponse(
    '<!doctype html><meta charset=utf-8><title>410 Gone</title><h1>410 Gone</h1><p>This page has been permanently removed.</p>',
    { status: 410, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=86400' } }
  );
}

export function middleware(request: NextRequest) {
  const { pathname, host } = request.nextUrl;

  // (1) www -> apex 301 backup. Next.js config handles this but we double
  //     up at the edge to drain the residual www crawl queue.
  if (host === 'www.ingredipeek.com') {
    const url = request.nextUrl.clone();
    url.host = 'ingredipeek.com';
    return NextResponse.redirect(url, 301);
  }

  const clean = stripSlash(pathname);

  // (2) Kill /es/product/* entirely. /es/ landing stays (clean === '/es').
  if (clean.startsWith('/es/product/')) {
    return gone();
  }

  // (2b) 2026-04-28 — kill /food/* entirely. Pre-migration legacy namespace
  //      (renamed to /product/ early on). CF analytics shows 6+ top-404 hits
  //      on /food/<slug>/ over 24h — Google still polls stale URLs. 410 = drop.
  if (clean.startsWith('/food/') || clean === '/food') {
    return gone();
  }

  // (3) Non-keep /compare/<slug>/ → 410. Route-level dynamicParams=false
  //     would already 404 these, but 410 is a stronger deindex signal and
  //     avoids burning render budget on unknown slugs.
  if (clean.startsWith('/compare/')) {
    const slug = clean.slice('/compare/'.length);
    // Only enforce for direct slug paths (no further nested segments).
    if (slug && !slug.includes('/') && !COMPARE_KEEP.has(slug)) {
      return gone();
    }
  }

  // (4) Non-keep /product/<slug>/ → 410.
  if (clean.startsWith('/product/')) {
    const slug = clean.slice('/product/'.length);
    if (slug && !slug.includes('/') && !PRODUCT_KEEP.has(slug)) {
      return gone();
    }
  }

  // Preserve original x-pathname header for downstream route handlers.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|robots.txt|sitemap.xml|api).*)'],
};
