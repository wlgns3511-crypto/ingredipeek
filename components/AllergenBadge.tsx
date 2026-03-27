interface Props {
  name: string;
  contains: boolean | null;
  size?: "sm" | "md";
}

export function AllergenBadge({ name, contains, size = "md" }: Props) {
  if (contains === null) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border font-medium ${
          size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
        } bg-slate-50 border-slate-200 text-slate-500`}
      >
        <span className="text-slate-400">?</span>
        {name}
      </span>
    );
  }

  if (contains) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border font-medium ${
          size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
        } bg-red-50 border-red-200 text-red-700`}
      >
        <span>⚠</span>
        {name}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      } bg-green-50 border-green-200 text-green-700`}
    >
      <span>✓</span>
      {name}-Free
    </span>
  );
}

interface AllergenGridProps {
  allergens: {
    name: string;
    contains: boolean | null;
  }[];
}

export function AllergenGrid({ allergens }: AllergenGridProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {allergens.map((a) => (
        <AllergenBadge key={a.name} name={a.name} contains={a.contains} />
      ))}
    </div>
  );
}
