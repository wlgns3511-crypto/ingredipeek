import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Privacy Policy - IngrediPeek",
  description: "IngrediPeek privacy policy. How we collect, use, and protect your information.",
};

export default function PrivacyPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />

      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-8">Last updated: March 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-700">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Information We Collect</h2>
            <p>
              IngrediPeek collects minimal data to provide our allergen reference service. We may collect:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
              <li>Usage analytics (pages visited, search queries) via Google Analytics</li>
              <li>Search queries to improve our product database</li>
              <li>Feedback submitted via our data accuracy feedback forms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Google Analytics</h2>
            <p className="text-sm">
              We use Google Analytics to understand how visitors use IngrediPeek. Google Analytics collects
              anonymized data including pages visited, time on site, and general geographic location.
              You can opt out of Google Analytics by installing the{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 hover:underline"
              >
                Google Analytics Opt-out Browser Add-on
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Advertising</h2>
            <p className="text-sm">
              IngrediPeek uses Google AdSense to display advertisements. Google may use cookies to serve ads
              based on your prior visits to our website or other websites. You can opt out of personalized
              advertising by visiting{" "}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 hover:underline"
              >
                Google Ads Settings
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Cookies</h2>
            <p className="text-sm">
              We use cookies for analytics and advertising purposes as described above. We do not use cookies
              to store personal health or allergen information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Data Security</h2>
            <p className="text-sm">
              IngrediPeek does not collect, store, or transmit personal health information, medical records,
              or allergy diagnoses. Our site provides reference information only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Contact</h2>
            <p className="text-sm">
              For privacy-related inquiries, please visit our{" "}
              <a href="/contact" className="text-green-700 hover:underline">
                Contact page
              </a>.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
