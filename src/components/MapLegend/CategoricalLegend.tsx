import type { CategoricalLegendConfig } from "./types";

interface CategoricalLegendProps {
  config: CategoricalLegendConfig;
}

export function CategoricalLegend({ config }: CategoricalLegendProps) {
  const { categories, shape = "square" } = config;

  return (
    <ul className="mt-list-none mt-m-0 mt-p-0 mt-space-y-1">
      {categories.map((cat) => (
        <li key={cat.value} className="mt-flex mt-items-center mt-gap-2 mt-text-[var(--mt-font-size-sm)]">
          <span
            className={[
              "mt-inline-block mt-shrink-0",
              shape === "line" ? "mt-w-4 mt-h-[2px] mt-rounded-full" : "mt-w-3 mt-h-3",
              shape === "circle" ? "mt-rounded-full" : "mt-rounded-sm"
            ].join(" ")}
            style={{ backgroundColor: cat.color }}
            aria-hidden="true"
          />
          <span className="mt-text-[var(--mt-text-primary)]">{cat.label ?? cat.value}</span>
        </li>
      ))}
    </ul>
  );
}
