"use client";

import { useState, useEffect } from "react";
import { Clock, Calendar, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

// Slot A: 01.10.2026
const SLOT_A_TIMESTAMP = new Date("2026-10-01T00:00:00+05:30").getTime();

function calculateTimeRemaining(): TimeRemaining {
  const now = Date.now();
  const diff = SLOT_A_TIMESTAMP - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isPast: false };
}

export function SlotACountdown() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<TimeRemaining>(calculateTimeRemaining);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTime(calculateTimeRemaining());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <motion.div
      className="slot-a-hero-banner"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      role="region"
      aria-label="Slot A Exam Countdown"
    >
      <div className="slot-a-info-col">
        <div className="slot-a-eyebrow-row">
          <span className="slot-a-pulse-dot" aria-hidden="true" />
          <span className="mono slot-a-tag">AISAT KTU S1 · FIRST INTERNAL EXAM</span>
          <span className="slot-a-slot-pill mono">SLOT A</span>
        </div>
        <h3 className="slot-a-subject-title">
          Mathematics for Information Science-1
          <span className="slot-a-code mono">A105MAT01</span>
        </h3>
        <p className="slot-a-schedule-sub">
          <Calendar size={13} aria-hidden="true" />
          Thursday, 01.10.2026
          <span className="slot-a-divider">·</span>
          <span>Schedule Locked</span>
        </p>
      </div>

      <div className="slot-a-countdown-col">
        <div className="countdown-clock-header mono">
          <Clock size={13} aria-hidden="true" />
          {time.isPast ? "EXAM CONCLUDED" : "COUNTDOWN TO EXAM"}
        </div>

        {time.isPast ? (
          <div className="countdown-concluded mono">
            <AlertCircle size={15} />
            <span>EXAM IN PROGRESS / COMPLETED</span>
          </div>
        ) : (
          <div className="countdown-digits-grid">
            <div className="countdown-segment">
              <span className="countdown-digit mono">
                {mounted ? pad(time.days) : "06"}
              </span>
              <span className="countdown-label mono">DAYS</span>
            </div>
            <span className="countdown-colon mono">:</span>
            <div className="countdown-segment">
              <span className="countdown-digit mono">
                {mounted ? pad(time.hours) : "13"}
              </span>
              <span className="countdown-label mono">HOURS</span>
            </div>
            <span className="countdown-colon mono">:</span>
            <div className="countdown-segment">
              <span className="countdown-digit mono">
                {mounted ? pad(time.minutes) : "10"}
              </span>
              <span className="countdown-label mono">MINS</span>
            </div>
            <span className="countdown-colon mono">:</span>
            <div className="countdown-segment">
              <span className="countdown-digit mono">
                {mounted ? pad(time.seconds) : "00"}
              </span>
              <span className="countdown-label mono">SECS</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
