import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "IngrediPeek - Food Allergen & Ingredient Checker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#f0fdf4",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "24px",
          }}
        >
          <div style={{ fontSize: 80 }}>🌿</div>
          <div
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: "#15803d",
            }}
          >
            IngrediPeek
          </div>
        </div>
        <div
          style={{
            fontSize: 36,
            color: "#334155",
            textAlign: "center",
            maxWidth: "900px",
            lineHeight: 1.3,
          }}
        >
          Food Allergen &amp; Ingredient Checker
        </div>
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "40px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {[
            { label: "🌾 Gluten-Free", bg: "#fef9c3", text: "#854d0e", border: "#fde047" },
            { label: "🌱 Vegan", bg: "#dcfce7", text: "#15803d", border: "#86efac" },
            { label: "☪️ Halal", bg: "#f0fdfa", text: "#0f766e", border: "#5eead4" },
            { label: "🥜 Nut-Free", bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
            { label: "🥛 Dairy-Free", bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
          ].map((badge) => (
            <div
              key={badge.label}
              style={{
                backgroundColor: badge.bg,
                color: badge.text,
                border: `2px solid ${badge.border}`,
                padding: "10px 20px",
                borderRadius: "9999px",
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              {badge.label}
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: "32px",
            fontSize: 20,
            color: "#64748b",
          }}
        >
          ingredipeek.com
        </div>
      </div>
    ),
    { ...size }
  );
}
