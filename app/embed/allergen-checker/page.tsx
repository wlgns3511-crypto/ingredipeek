import { Metadata } from "next";
import { AllergenChecker } from "@/components/AllergenChecker";

export const metadata: Metadata = {
  title: "Allergen Checker - Embeddable Widget",
  robots: "noindex, nofollow",
  openGraph: { url: "/embed/allergen-checker/" },
};

export default function EmbedAllergenCheckerPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <AllergenChecker />
      <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 12 }}>
        Powered by{" "}
        <a href="https://ingredipeek.com" target="_blank" rel="noopener" style={{ color: "#3b82f6", textDecoration: "underline" }}>
          IngrediPeek
        </a>
      </p>
    </div>
  );
}
