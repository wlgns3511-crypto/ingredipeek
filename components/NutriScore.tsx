interface Props {
  score: string | null;
}

const SCORES = ["a", "b", "c", "d", "e"];

const COLOR_MAP: Record<string, string> = {
  a: "bg-green-600",
  b: "bg-lime-500",
  c: "bg-yellow-400",
  d: "bg-orange-500",
  e: "bg-red-600",
};

const LABEL_MAP: Record<string, string> = {
  a: "Excellent nutritional quality",
  b: "Good nutritional quality",
  c: "Moderate nutritional quality",
  d: "Poor nutritional quality",
  e: "Very poor nutritional quality",
};

export function NutriScore({ score }: Props) {
  if (!score) return null;
  const normalized = score.toLowerCase();

  return (
    <div>
      <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">Nutri-Score</p>
      <div className="flex items-end gap-1">
        {SCORES.map((s) => {
          const isActive = s === normalized;
          return (
            <div
              key={s}
              className={`flex items-center justify-center rounded font-bold text-white ${
                COLOR_MAP[s] || "bg-slate-300"
              } ${isActive ? "w-10 h-10 text-lg ring-2 ring-offset-1 ring-slate-800" : "w-7 h-7 text-sm opacity-40"}`}
            >
              {s.toUpperCase()}
            </div>
          );
        })}
      </div>
      {LABEL_MAP[normalized] && (
        <p className="text-xs text-slate-500 mt-1">{LABEL_MAP[normalized]}</p>
      )}
    </div>
  );
}

interface NovaProps {
  group: number | null;
}

const NOVA_COLOR: Record<number, string> = {
  1: "bg-green-600",
  2: "bg-lime-500",
  3: "bg-orange-400",
  4: "bg-red-600",
};

const NOVA_LABEL: Record<number, string> = {
  1: "Unprocessed / Minimally processed",
  2: "Processed culinary ingredients",
  3: "Processed foods",
  4: "Ultra-processed foods",
};

export function NovaGroup({ group }: NovaProps) {
  if (!group) return null;

  return (
    <div>
      <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">NOVA Group</p>
      <div className="flex items-center gap-2">
        <div
          className={`w-10 h-10 rounded flex items-center justify-center text-white font-bold text-lg ${
            NOVA_COLOR[group] || "bg-slate-300"
          }`}
        >
          {group}
        </div>
        <span className="text-sm text-slate-600">{NOVA_LABEL[group] || `Group ${group}`}</span>
      </div>
    </div>
  );
}
