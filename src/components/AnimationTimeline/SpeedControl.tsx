import type { SpeedOption } from "./types";

interface SpeedControlProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
  options: SpeedOption[];
}

export function SpeedControl({ speed, onSpeedChange, options }: SpeedControlProps) {
  return (
    <div className="mt-flex mt-items-center mt-gap-1" role="radiogroup" aria-label="Playback speed">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`mt-rounded mt-px-1.5 mt-py-0.5 mt-text-[10px] ${
            speed === opt.value
              ? "mt-bg-[var(--mt-accent-light)] mt-text-[var(--mt-accent)]"
              : "mt-border mt-border-[var(--mt-border)] mt-text-[var(--mt-text-secondary)]"
          }`}
          onClick={() => onSpeedChange(opt.value)}
          role="radio"
          aria-checked={speed === opt.value}
          aria-label={`Speed ${opt.label}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
