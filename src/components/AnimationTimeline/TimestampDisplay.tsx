interface TimestampDisplayProps {
  current: string;
  start: string;
  end: string;
}

export function TimestampDisplay({ current, start, end }: TimestampDisplayProps) {
  return (
    <div className="mt-flex mt-items-center mt-gap-2 mt-text-xs mt-text-[var(--mt-text-secondary)]">
      <span className="mt-font-medium mt-text-[var(--mt-text-primary)]">{current}</span>
      <span>/</span>
      <span>
        {start} - {end}
      </span>
    </div>
  );
}
