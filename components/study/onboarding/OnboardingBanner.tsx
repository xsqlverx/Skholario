"use client";

import { Sparkles, Compass, ArrowRight, X, FileUp } from "lucide-react";
import { useOnboarding } from "@/lib/onboarding-storage";
import { ProgressMarks } from "../Primitives";

export function OnboardingBanner() {
  const {
    attachedCount,
    totalSubjects,
    bannerDismissed,
    dismissBanner,
    openTour,
  } = useOnboarding();

  if (bannerDismissed) return null;

  const scrollToTracker = () => {
    const el = document.getElementById("syllabus-tracker-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <aside
      className="onboarding-banner-card"
      aria-label="Semester Onboarding and Setup Banner"
    >
      <div className="onboarding-banner-left">
        <div className="onboarding-badge-row">
          <span className="onboarding-tag">
            <Sparkles size={13} aria-hidden="true" />
            GETTING STARTED
          </span>
          <span className="mono">
            {attachedCount} OF {String(totalSubjects).padStart(2, "0")} SYLLABI ADDED
          </span>
        </div>

        <h2 className="onboarding-banner-title">
          {attachedCount === 0
            ? "Welcome to Study Hub! Connect your semester syllabi."
            : attachedCount === totalSubjects
              ? "All 6 subject syllabi attached & synced!"
              : `${attachedCount} of 6 subjects configured. Keep going!`}
        </h2>

        <p className="onboarding-banner-desc">
          Attach your university course syllabus PDFs below to map your units directly into the study engine.
        </p>

        <div className="onboarding-banner-progress">
          <ProgressMarks done={attachedCount} total={totalSubjects} />
        </div>
      </div>

      <div className="onboarding-banner-actions">
        <button
          type="button"
          className="onboarding-tour-trigger"
          onClick={openTour}
        >
          <Compass size={16} aria-hidden="true" />
          Take 1-Min Tour
        </button>

        <button
          type="button"
          className="onboarding-setup-trigger"
          onClick={scrollToTracker}
        >
          <FileUp size={16} aria-hidden="true" />
          Attach Syllabi
          <ArrowRight size={14} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="onboarding-dismiss-btn"
          onClick={dismissBanner}
          aria-label="Dismiss setup banner"
          title="Dismiss banner"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
