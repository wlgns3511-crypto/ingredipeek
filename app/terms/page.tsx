import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Terms of Service - IngrediPeek",
  description: "Terms of service for IngrediPeek food allergen and ingredient checker.",
};

export default function TermsPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Terms of Service" }]} />

      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-slate-500 text-sm mb-8">Last updated: March 2026</p>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
          <p className="text-red-800 font-medium text-sm">
            ⚠ Important Medical Disclaimer
          </p>
          <p className="text-red-700 text-sm mt-1">
            IngrediPeek is not a medical service. The allergen information provided is for general reference only
            and should never replace professional medical advice, diagnosis, or treatment. Always verify allergen
            information on physical product packaging before consuming, especially if you have a life-threatening allergy.
          </p>
        </div>

        <div className="space-y-6 text-slate-700 text-sm">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using IngrediPeek (ingredipeek.com), you accept and agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Information Accuracy</h2>
            <p>
              IngrediPeek strives to provide accurate allergen and ingredient information sourced from Open Food Facts.
              However, we cannot guarantee the accuracy, completeness, or timeliness of this information.
              Product formulations change frequently. Always verify information on the current product packaging.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. No Medical Advice</h2>
            <p>
              The information provided on IngrediPeek is for general informational purposes only and does not
              constitute medical, nutritional, or dietary advice. Consult a qualified healthcare provider, registered
              dietitian, or allergist for personalized advice regarding food allergies and dietary restrictions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Limitation of Liability</h2>
            <p>
              IngrediPeek and its operators shall not be liable for any harm, injury, or damages arising from
              reliance on information provided on this website. Use this site at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Intellectual Property</h2>
            <p>
              Product data is sourced from Open Food Facts under the Open Database License (ODbL).
              Site design, code, and original content are the property of IngrediPeek.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of IngrediPeek after
              changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Contact</h2>
            <p>
              Questions about these terms? Visit our{" "}
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
