import { ImageResponse } from "next/og";
import { getProductBySlug } from "@/lib/db";
import { getContainedAllergens } from "@/lib/analysis";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#16a34a",
            color: "white",
            fontFamily: "sans-serif",
            fontSize: 48,
            fontWeight: 800,
          }}
        >
          IngrediPeek
        </div>
      ),
      { ...size }
    );
  }

  const contained = getContainedAllergens(product);
  const isGlutenFree = product.is_gluten_free === 1;
  const isVegan = product.is_vegan === 1;
  const isHalal = product.is_halal === 1;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#f0fdf4",
          padding: "48px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              backgroundColor: "#16a34a",
              color: "white",
              fontSize: 20,
              fontWeight: 800,
              padding: "8px 16px",
              borderRadius: "8px",
            }}
          >
            🌿 IngrediPeek
          </div>
          <div style={{ fontSize: 16, color: "#64748b" }}>
            Allergen & Ingredient Checker
          </div>
        </div>

        {/* Product name */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: "#1e293b",
            lineHeight: 1.2,
            marginBottom: "24px",
            flex: 1,
          }}
        >
          {product.name.length > 60
            ? product.name.substring(0, 57) + "..."
            : product.name}
        </div>

        {product.brand && (
          <div style={{ fontSize: 24, color: "#16a34a", marginBottom: "24px", fontWeight: 600 }}>
            {product.brand}
          </div>
        )}

        {/* Allergen status */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
          {contained.length === 0 ? (
            <div
              style={{
                backgroundColor: "#dcfce7",
                color: "#15803d",
                padding: "8px 16px",
                borderRadius: "9999px",
                fontSize: 20,
                fontWeight: 700,
                border: "2px solid #86efac",
              }}
            >
              ✓ No Major Allergens
            </div>
          ) : (
            <div
              style={{
                backgroundColor: "#fee2e2",
                color: "#b91c1c",
                padding: "8px 16px",
                borderRadius: "9999px",
                fontSize: 20,
                fontWeight: 700,
                border: "2px solid #fca5a5",
              }}
            >
              ⚠ Contains: {contained.slice(0, 3).join(", ")}
              {contained.length > 3 ? ` +${contained.length - 3} more` : ""}
            </div>
          )}
        </div>

        {/* Diet badges */}
        <div style={{ display: "flex", gap: "10px" }}>
          {isGlutenFree && (
            <div
              style={{
                backgroundColor: "#fef9c3",
                color: "#854d0e",
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: 16,
                fontWeight: 600,
                border: "1px solid #fde047",
              }}
            >
              🌾 Gluten-Free
            </div>
          )}
          {isVegan && (
            <div
              style={{
                backgroundColor: "#dcfce7",
                color: "#15803d",
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: 16,
                fontWeight: 600,
                border: "1px solid #86efac",
              }}
            >
              🌱 Vegan
            </div>
          )}
          {isHalal && (
            <div
              style={{
                backgroundColor: "#f0fdfa",
                color: "#0f766e",
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: 16,
                fontWeight: 600,
                border: "1px solid #5eead4",
              }}
            >
              ☪️ Halal
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
