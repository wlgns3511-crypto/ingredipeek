import { getRecentProducts } from "@/lib/db";

export async function GET() {
  const now = new Date().toUTCString();
  const products = getRecentProducts(15);

  const items = products
    .map((p) => {
      const allergens = p.allergens ? JSON.parse(p.allergens).join(", ") : "None listed";
      return `
    <item>
      <title>${escapeXml(p.name)} - Allergen &amp; Ingredient Check</title>
      <link>https://ingredipeek.com/product/${p.slug}</link>
      <description>${escapeXml(p.name)}: Allergens: ${allergens}. Check full ingredients at IngrediPeek.</description>
      <pubDate>${now}</pubDate>
      <guid isPermaLink="false">https://ingredipeek.com/product/${p.slug}#${Date.now()}</guid>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>IngrediPeek - Food Allergen &amp; Ingredient Database</title>
    <link>https://ingredipeek.com</link>
    <description>Check allergens, ingredients, and dietary compatibility for thousands of food products.</description>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="https://ingredipeek.com/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
