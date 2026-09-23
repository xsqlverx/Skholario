"use client";

import { ArrowRight, BookOpen, Lock } from "lucide-react";
import type { TopicLearningContent } from "@/lib/learning-content";
import { Eyebrow } from "../Primitives";

export function LearnStage({
  content,
  currentSectionIndex,
  onNextSection,
  onCompleteLearn,
}: {
  content: TopicLearningContent;
  currentSectionIndex: number;
  onNextSection: () => void;
  onCompleteLearn: () => void;
}) {
  const sections = content.sections;
  const isLast = currentSectionIndex >= sections.length - 1;

  // Render all sections up to currentSectionIndex to support progressive disclosure
  const visibleSections = sections.slice(0, currentSectionIndex + 1);

  return (
    <div className="learn-stage">
      <div className="stage-header">
        <Eyebrow>STAGE 02 / LEARN</Eyebrow>
        <h2>Understand the concept.</h2>
        <p className="stage-caption">{content.overview}</p>
      </div>

      <div className="learning-sections-stack">
        {visibleSections.map((sec, idx) => {
          const isLatest = idx === currentSectionIndex;

          return (
            <article
              key={sec.id}
              className={`learning-card ${isLatest ? "card-active" : "card-read"}`}
            >
              <div className="card-top">
                <h3>{sec.title}</h3>
                <span className="mono">SECTION 0{idx + 1} / 0{sections.length}</span>
              </div>

              <div className="card-body">
                <p className="card-text">{sec.content}</p>

                {sec.formula && (
                  <div className="formula-block" aria-label="Governing formula">
                    <code>{sec.formula}</code>
                  </div>
                )}

                {sec.example && (
                  <div className="example-block">
                    <strong>Worked Example:</strong>
                    <pre>{sec.example}</pre>
                  </div>
                )}

                {sec.keyPoints && sec.keyPoints.length > 0 && (
                  <div className="key-points">
                    <h4>Key takeaways:</h4>
                    <ul>
                      {sec.keyPoints.map((pt, pIdx) => (
                        <li key={pIdx}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="learn-navigation">
        {!isLast ? (
          <button
            type="button"
            className="action next-section-btn"
            onClick={onNextSection}
          >
            Continue to Section 0{currentSectionIndex + 2}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        ) : (
          <div className="learn-complete-box">
            <div className="notes-closing-warning">
              <Lock size={18} aria-hidden="true" />
              <span>
                Ready? In the next stage, the learning notes will be closed to test your memory.
              </span>
            </div>
            <button
              type="button"
              className="action close-notes-btn"
              onClick={onCompleteLearn}
            >
              <BookOpen size={18} aria-hidden="true" />
              CLOSE NOTES & START RECALL
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
