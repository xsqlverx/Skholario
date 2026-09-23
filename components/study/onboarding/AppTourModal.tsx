"use client";

import { useEffect, useState } from "react";
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  X,
  Target,
  Zap,
  FileCheck2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "@/lib/onboarding-storage";
import { Eyebrow } from "../Primitives";

interface TourStep {
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  tip: string;
  icon: typeof Target;
  badgeColor: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    tag: "01 / TODAY'S TARGET",
    title: "One high-impact move at a time.",
    subtitle: "No overwhelming 50-item dashboards.",
    description:
      "Study Hub calculates your exact next priority based on curriculum order and your upcoming exam dates. Open the app, hit STUDY NOW, and lock in your daily momentum.",
    tip: "Tip: Set exam dates on any subject to dynamically reorganize your study schedule.",
    icon: Target,
    badgeColor: "bg-[#eed6d2] text-[#24251f]",
  },
  {
    tag: "02 / THE STUDY ENGINE",
    title: "Active recall over passive scrolling.",
    subtitle: "Built on cognitive science, not mindless reading.",
    description:
      "Every topic guides you through 6 progressive stages: a quick Warm-Up, Guided Concepts, Closed-Notes Active Recall, and Multi-Format Practice (MCQ, Short Answer, Fill-in-the-Blank).",
    tip: "Tip: Closed-notes recall forces brain retrieval, tripling long-term exam retention.",
    icon: Zap,
    badgeColor: "bg-[#eee49f] text-[#24251f]",
  },
  {
    tag: "03 / SYLLABUS PDF TRACKER",
    title: "Keep your official curriculum attached.",
    subtitle: "Watch your 6 subjects fill up in real time.",
    description:
      "Attach syllabus PDFs for Chemistry, Math, Physics, Mechanics, Electrical, and CS. The tracker displays your coverage (e.g. 1/6 subjects added) with the same slanted editorial progress bars.",
    tip: "Tip: You can drag and drop PDFs or click sample to test the workflow instantly.",
    icon: FileCheck2,
    badgeColor: "bg-[#d7e2c8] text-[#24251f]",
  },
  {
    tag: "04 / WEAKNESS DETECTION",
    title: "Isolate mistakes. Master them before exams.",
    subtitle: "Instant diagnosis on every practice attempt.",
    description:
      "Missed an answer during practice? The Study Engine isolates weak concepts in your session review and unlocks single-tap Retest drills so you never repeat the same error.",
    tip: "Tip: Topics with 80%+ accuracy earn verified mastery tags.",
    icon: Sparkles,
    badgeColor: "bg-[#24251f] text-[#f5f3eb]",
  },
];

export function AppTourModal() {
  const { tourDismissed, dismissTour } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);

  // If already dismissed, do not render
  const isOpen = !tourDismissed;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        dismissTour();
      } else if (e.key === "ArrowRight" && currentStep < TOUR_STEPS.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else if (e.key === "ArrowLeft" && currentStep > 0) {
        setCurrentStep((prev) => prev - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStep, dismissTour]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const StepIcon = step.icon;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleFinish = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#ee482f", "#24251f", "#eee49f", "#d7e2c8"],
      });
    } catch {
      // safe fallback
    }
    dismissTour();
  };

  return (
    <div
      className="tour-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-step-title"
    >
      <motion.div
        className="tour-modal-card"
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <div className="tour-modal-header">
          <div className="tour-header-meta">
            <span className="tour-badge">
              <Compass size={14} aria-hidden="true" />
              STUDY HUB TOUR
            </span>
            <span className="mono tour-step-counter">
              STEP 0{currentStep + 1} / 0{TOUR_STEPS.length}
            </span>
          </div>

          <button
            type="button"
            className="tour-skip-btn"
            onClick={dismissTour}
            aria-label="Skip tour and close"
          >
            Skip Tour
            <X size={15} aria-hidden="true" />
          </button>
        </div>

        <div className="tour-progress-bar-rail" aria-hidden="true">
          <div
            className="tour-progress-bar-fill"
            style={{
              width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%`,
            }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            className="tour-step-content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="tour-step-top">
              <div className={`tour-icon-box ${step.badgeColor}`}>
                <StepIcon size={24} aria-hidden="true" />
              </div>
              <div>
                <Eyebrow>{step.tag}</Eyebrow>
                <h2 id="tour-step-title" className="tour-step-heading">
                  {step.title}
                </h2>
                <p className="tour-step-subtitle">{step.subtitle}</p>
              </div>
            </div>

            <p className="tour-step-description">{step.description}</p>

            <div className="tour-step-tip">
              <span className="mono">NOTE:</span>
              <p>{step.tip}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="tour-modal-footer">
          <div className="tour-step-indicators" aria-hidden="true">
            {TOUR_STEPS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`tour-indicator-dot ${idx === currentStep ? "active" : ""} ${idx < currentStep ? "completed" : ""}`}
                onClick={() => setCurrentStep(idx)}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          <div className="tour-nav-actions">
            {currentStep > 0 && (
              <button
                type="button"
                className="tour-back-btn"
                onClick={() => setCurrentStep((prev) => prev - 1)}
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Back
              </button>
            )}

            {!isLast ? (
              <button
                type="button"
                className="tour-next-btn"
                onClick={() => setCurrentStep((prev) => prev + 1)}
              >
                Next Step
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                className="tour-finish-btn"
                onClick={handleFinish}
              >
                Start Studying
                <CheckCircle2 size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
