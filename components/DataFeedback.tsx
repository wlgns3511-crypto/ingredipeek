"use client";
import { useState } from "react";

export function DataFeedback() {
  const [state, setState] = useState<"idle" | "yes" | "no">("idle");

  if (state !== "idle") {
    return (
      <div className="mt-6 text-center text-sm text-slate-500 py-3">
        {state === "yes"
          ? "Thanks for confirming! This helps us keep allergen data accurate."
          : "Thanks for letting us know. We'll review this allergen data."}
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col items-center gap-2 py-3">
      <p className="text-sm text-slate-500">Is this allergen information accurate?</p>
      <div className="flex gap-3">
        <button
          onClick={() => setState("yes")}
          className="px-4 py-1.5 text-sm rounded-full border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors cursor-pointer"
        >
          Yes, accurate
        </button>
        <button
          onClick={() => setState("no")}
          className="px-4 py-1.5 text-sm rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
        >
          Needs correction
        </button>
      </div>
    </div>
  );
}
