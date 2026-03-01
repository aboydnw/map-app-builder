export type TimelineMode = "timestamp" | "window";

export interface SpeedOption {
  label: string;
  value: number;
}

export interface Timestep {
  time: number | string;
  label?: string;
}

export interface HistogramBin {
  start: number;
  end: number;
  count: number;
}

export interface AnimationTimelineProps {
  timestamps: Timestep[];
  mode?: TimelineMode;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  windowStart?: number;
  windowEnd?: number;
  onWindowChange?: (start: number, end: number) => void;
  isPlaying: boolean;
  onPlayingChange: (playing: boolean) => void;
  speed?: number;
  onSpeedChange?: (speed: number) => void;
  speedOptions?: SpeedOption[];
  formatLabel?: (time: number | string, index: number) => string;
  showStepControls?: boolean;
  showSpeedControl?: boolean;
  histogram?: HistogramBin[];
  position?: "bottom" | "top";
  className?: string;
}
