import { NextRequest, NextResponse } from "next/server";

const KEY = "7f34f78e26294cdbb74d05b254a16312";
const HOST = "ingredipeek.com";

async function submitToIndexNow(urls: string[]) {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList: urls.slice(0, 1000),
    }),
  });
  return res.status;
}

export async function GET() {
  const urls = [
    `https://${HOST}/`,
    `https://${HOST}/sitemap.xml`,
  ];
  const status = await submitToIndexNow(urls);
  return NextResponse.json({ ok: true, submitted: urls.length, indexnowStatus: status });
}

export async function POST(req: NextRequest) {
  const { urls } = await req.json();
  if (!urls?.length) return NextResponse.json({ error: "urls required" }, { status: 400 });
  const status = await submitToIndexNow(urls);
  return NextResponse.json({ ok: true, submitted: urls.length, indexnowStatus: status });
}
