import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Contact IngrediPeek",
  description: "Contact IngrediPeek for data corrections, partnership inquiries, or general questions about our food allergen database.",
};

export default function ContactPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />

      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
        <p className="text-slate-600 mb-8">
          Have a question, found a data error, or want to report missing allergen information?
          We&apos;d love to hear from you.
        </p>

        <div className="grid gap-6 mb-8">
          <div className="border border-slate-200 rounded-xl p-5">
            <h2 className="font-bold text-slate-800 mb-1">Data Corrections</h2>
            <p className="text-sm text-slate-600">
              If you find incorrect allergen information, please use the feedback button on the product page
              or email us with the product name and the correct information.
            </p>
          </div>
          <div className="border border-slate-200 rounded-xl p-5">
            <h2 className="font-bold text-slate-800 mb-1">Missing Products</h2>
            <p className="text-sm text-slate-600">
              Our database is sourced from Open Food Facts. To add a missing product,{" "}
              <a
                href="https://world.openfoodfacts.org/contribute"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 hover:underline"
              >
                contribute to Open Food Facts
              </a>{" "}
              and it will appear in our database.
            </p>
          </div>
          <div className="border border-slate-200 rounded-xl p-5">
            <h2 className="font-bold text-slate-800 mb-1">Business Inquiries</h2>
            <p className="text-sm text-slate-600">
              For advertising, partnership, or API inquiries, please reach out via email.
            </p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <h2 className="font-bold text-green-900 mb-2">Get in Touch</h2>
          <p className="text-sm text-slate-600 mb-3">
            Send us an email and we&apos;ll respond within 2-3 business days.
          </p>
          <a
            href="mailto:datapeekfacts@gmail.com"
            className="inline-flex items-center gap-2 bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            datapeekfacts@gmail.com
          </a>
        </div>

        <div className="mt-8 text-sm text-slate-500">
          <p>
            IngrediPeek is part of the{" "}
            <a href="https://salarybycity.com" className="text-green-700 hover:underline">
              DataPeek Insights Network
            </a>.
          </p>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200">
        <h2 className="text-xl font-semibold mb-3">DataPeek Facts Network</h2>
        <p>
          IngrediPeek is part of the{" "}
          <a href="https://datapeekfacts.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
            DataPeek Facts
          </a>{" "}
          network of free US data tools. For general inquiries about the network, partnerships, or cross-platform
          questions, contact the DataPeek Facts team at{" "}
          <a href="mailto:datapeekfacts@gmail.com" className="text-blue-600 hover:underline">
            datapeekfacts@gmail.com
          </a>.
        </p>
      </div>
    </>
  );
}
