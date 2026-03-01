interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayingChange: (playing: boolean) => void;
  onStepBack?: () => void;
  onStepForward?: () => void;
  disableBack?: boolean;
  disableForward?: boolean;
}

export function PlaybackControls({
  isPlaying,
  onPlayingChange,
  onStepBack,
  onStepForward,
  disableBack,
  disableForward
}: PlaybackControlsProps) {
  return (
    <div className="mt-flex mt-items-center mt-gap-1">
      {onStepBack ? (
        <button
          type="button"
          className="mt-rounded mt-border mt-border-[var(--mt-border)] mt-px-2 mt-py-1 mt-text-xs disabled:mt-opacity-50"
          onClick={onStepBack}
          disabled={disableBack}
          aria-label="Step back"
        >
          ◀
        </button>
      ) : null}

      <button
        type="button"
        className="mt-rounded-full mt-bg-[var(--mt-accent)] mt-text-white mt-px-3 mt-py-1 mt-text-xs hover:mt-opacity-90"
        onClick={() => onPlayingChange(!isPlaying)}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? "Pause" : "Play"}
      </button>

      {onStepForward ? (
        <button
          type="button"
          className="mt-rounded mt-border mt-border-[var(--mt-border)] mt-px-2 mt-py-1 mt-text-xs disabled:mt-opacity-50"
          onClick={onStepForward}
          disabled={disableForward}
          aria-label="Step forward"
        >
          ▶
        </button>
      ) : null}
    </div>
  );
}
