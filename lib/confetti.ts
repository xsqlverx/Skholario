import confetti from "canvas-confetti";

export function fireCelebrationConfetti() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#6366f1", "#a855f7", "#ec4899", "#10b981", "#3b82f6"],
  });
}
