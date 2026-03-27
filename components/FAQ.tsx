interface FAQItem {
  question: string;
  answer: string;
}

export function FAQ({ items }: { items: FAQItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
      <div className="space-y-3">
        {items.map((item, i) => (
          <details
            key={i}
            className="border border-slate-200 rounded-lg"
            open={i === 0}
          >
            <summary className="p-4 cursor-pointer font-medium hover:bg-green-50 rounded-lg list-none flex items-center justify-between">
              <span>{item.question}</span>
              <svg
                className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2 transition-transform details-open:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-4 pb-4 text-slate-600 text-sm leading-relaxed">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
