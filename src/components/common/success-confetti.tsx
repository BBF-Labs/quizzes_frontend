"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

/**
 * Fires a small, on-brand confetti burst from the top of the page.
 * Used by success-state pages (newsletter confirm, payment callback, etc.)
 * to celebrate a moment without overwhelming the rest of the copy.
 */
export function SuccessConfetti() {
  useEffect(() => {
    const end = Date.now() + 600;
    const colors = ["#0C60FC", "#7C3AED", "#F59E0B", "#10B981", "#DFFF61"];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.25 },
        colors,
        zIndex: 9999,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.25 },
        colors,
        zIndex: 9999,
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return null;
}
