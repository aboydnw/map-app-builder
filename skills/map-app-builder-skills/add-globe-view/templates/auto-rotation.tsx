// Auto-rotation with pause-on-interaction.
// Merge this into your globe component — add the state/ref declarations,
// the useEffect, and the onViewStateChange handler to your DeckGL props.

import { useEffect, useRef, useState } from "react";
import DeckGL from "@deck.gl/react";

// --- Add to your component's state ---

const [rotating, setRotating] = useState(true);
const animationRef = useRef<number>();

// --- Add this useEffect ---

useEffect(() => {
  if (!rotating) {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    return;
  }
  const animate = () => {
    setViewState((prev) => ({ ...prev, longitude: prev.longitude + 0.1 }));
    animationRef.current = requestAnimationFrame(animate);
  };
  animationRef.current = requestAnimationFrame(animate);
  return () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };
}, [rotating]);

// --- Update your DeckGL props to pause rotation on interaction ---

<DeckGL
  onViewStateChange={({ viewState: vs, interactionState }) => {
    setViewState(vs as ViewState);
    if (interactionState?.isDragging) setRotating(false);
  }}
/>;
