"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Asterisk, BookOpen, Compass, House } from "lucide-react";
import { MotionConfig } from "framer-motion";
import { openTour } from "@/lib/onboarding-storage";
import { AppTourModal } from "./onboarding/AppTourModal";
import { StudyState, useProgress } from "./StudyState";

function PersistenceNotice() {
  const { storageError, dataWarning } = useProgress();
  if (!storageError && !dataWarning) return null;
  return (
    <p role="status" className="persistence-notice">
      {storageError
        ? "Browser storage is unavailable. You can keep studying, but changes may be lost after you close or reload this page."
        : "Some saved study data could not be read. Valid entries were kept; missing entries are shown as not started."}
    </p>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();

  return (
    <StudyState>
      <MotionConfig reducedMotion="user">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <div className="site-shell">
          <header className="site-header">
            <Link href="/" className="wordmark" aria-label="Study Hub home">
              <span className="wordmark-icon">
                <Asterisk aria-hidden="true" strokeWidth={3} />
              </span>
              study<span>hub</span>
              <span className="logo-dot">.</span>
            </Link>
            <nav aria-label="Main navigation">
              <Link href="/" aria-current={path === "/" ? "page" : undefined}>
                <House size={17} />
                Today
              </Link>
              <Link
                href="/subjects"
                aria-current={path.startsWith("/subjects") ? "page" : undefined}
              >
                <BookOpen size={17} />
                Subjects<span className="nav-count">06</span>
              </Link>
              <button
                type="button"
                className="site-tour-nav-link"
                onClick={openTour}
                aria-label="Open App Tour"
              >
                <Compass size={16} />
                Tour
              </button>
            </nav>
            <span className="header-note">
              A LITTLE EVERY DAY.
              <ArrowUpRight size={18} />
            </span>
          </header>
          <main id="main" tabIndex={-1}>
            <AppTourModal />
            <PersistenceNotice />
            <div key={path} className="page-enter">
              {children}
            </div>
          </main>
          <footer className="site-footer">
            <span>Less wondering. More learning.</span>
            <button
              type="button"
              className="footer-tour-btn"
              onClick={openTour}
            >
              ✦ App Tour
            </button>
            <span>
              STUDY HUB <Asterisk size={16} /> ONE TOPIC AT A TIME
            </span>
          </footer>
        </div>
      </MotionConfig>
    </StudyState>
  );
}
