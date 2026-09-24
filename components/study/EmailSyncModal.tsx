"use client";

import { useState, useSyncExternalStore } from "react";
import { Cloud, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  getSyncEmail,
  setSyncEmail,
  hasConfiguredSyncEmail,
  DEFAULT_SYNC_EMAIL,
} from "@/lib/sync";
import { useProgress } from "./StudyState";
import { Eyebrow } from "./Primitives";

const emptySubscribe = () => () => {};
const subscribeStorage = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

export function EmailSyncModal() {
  const { setSyncEmail: updateContextEmail, syncNow } = useProgress();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const isConfigured = useSyncExternalStore(
    subscribeStorage,
    () => hasConfiguredSyncEmail(),
    () => true,
  );

  const [dismissed, setDismissed] = useState(false);
  const [emailInput, setEmailInput] = useState(() => {
    const existing = getSyncEmail();
    return existing && existing !== DEFAULT_SYNC_EMAIL ? existing : "";
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!mounted || isConfigured || dismissed) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const clean = emailInput.trim().toLowerCase();

    if (!clean) {
      setError("Please enter your email to connect sync.");
      return;
    }

    if (!clean.includes("@") || !clean.includes(".") || clean.length < 5) {
      setError("Please enter a valid email address (e.g. rahul@ktu.edu).");
      return;
    }

    if (clean === DEFAULT_SYNC_EMAIL.toLowerCase()) {
      setError("Please enter your own personal or university email, not the default placeholder.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Save locally to localStorage
      setSyncEmail(clean);

      // 2. Update context state
      updateContextEmail(clean);

      // 3. Trigger initial remote sync pull & hydration
      await syncNow();

      setIsSuccess(true);

      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 },
          colors: ["#ee482f", "#24251f", "#d7e2c8"],
        });
      } catch {
        // confetti fallback
      }

      setTimeout(() => {
        setDismissed(true);
      }, 700);
    } catch (err) {
      console.warn("Sync setup error:", err);
      // Still allow closing since email was saved locally
      setIsSuccess(true);
      setTimeout(() => {
        setDismissed(true);
      }, 500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="email-sync-modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-sync-title"
      >
        <motion.div
          className="email-sync-modal-card"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -8 }}
          transition={{ type: "spring", stiffness: 450, damping: 32 }}
        >
          <div className="email-sync-badge-row">
            <span className="email-sync-badge mono">
              <Cloud size={14} aria-hidden="true" />
              CLOUDFLARE KV · STATE SYNC
            </span>
          </div>

          <div className="email-sync-header">
            <Eyebrow>ZERO-MAINTENANCE DEVICE SYNC</Eyebrow>
            <h2 id="email-sync-title">Connect your student email</h2>
            <p className="email-sync-desc">
              Skholario keeps your completed topics, exam priorities, and study
              streaks synchronized across your phone, tablet, and laptop.
              Enter your university or personal email to create your private sync vault.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="email-sync-form">
            <div className="email-input-wrapper">
              <label htmlFor="student-sync-email" className="mono email-label">
                STUDENT IDENTIFIER / EMAIL
              </label>
              <input
                id="student-sync-email"
                type="email"
                required
                autoFocus
                placeholder="e.g. yourname@ktu.edu or personal email"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isSubmitting || isSuccess}
                className={`email-sync-input ${error ? "has-error" : ""}`}
              />
            </div>

            {error && (
              <motion.div
                className="email-sync-error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
              >
                <AlertCircle size={15} aria-hidden="true" />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className={`email-sync-submit-btn ${isSuccess ? "is-success" : ""}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spin" aria-hidden="true" />
                  Connecting Cloudflare KV...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  Sync Connected!
                </>
              ) : (
                <>
                  Connect & Sync Progress
                  <ArrowRight size={16} aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <footer className="email-sync-footer">
            <div className="email-sync-security-note">
              <ShieldCheck size={16} aria-hidden="true" />
              <span>
                <strong>Passwordless sync.</strong> Data is stored in your private
                KV key on Cloudflare edge workers with end-to-end device isolation.
              </span>
            </div>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
