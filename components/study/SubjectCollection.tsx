"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { subjects } from "@/lib/curriculum";
import { useProgress } from "./StudyState";
import { Eyebrow, ProgressMarks } from "./Primitives";

export function SubjectCollection() {
  const { completed, ready } = useProgress();

  return (
    <>
      <div className="page-kicker">
        <Eyebrow>THE SEMESTER, UNTANGLED</Eyebrow>
        <span className="sample-label">06 SUBJECTS / SAMPLE SELECTION</span>
      </div>

      <div className="collection-heading">
        <h1>
          Many subjects.
          <br />
          <em>One place.</em>
        </h1>
        <p>
          Pick a subject. Find your place.
          <br />
          Take it one topic at a time.
        </p>
      </div>

      <div className="subject-collection">
        {subjects.map((s, i) => {
          const topics = s.units.flatMap((u) => u.topics);
          const done = topics.filter((t) => completed.includes(t.id)).length;
          return (
            <Link
              key={s.id}
              href={`/subjects/${s.id}`}
              className={`subject-poster poster-${s.color}`}
            >
              <div className="poster-top">
                <span className="mono">
                  0{i + 1} / {s.code}
                </span>
                <ArrowUpRight size={27} />
              </div>

              <span className="poster-symbol" aria-hidden="true">
                {s.symbol}
              </span>

              <h2>{s.short}</h2>

              <div className="poster-progress">
                <span>
                  {ready ? done : "—"} / {topics.length} topics
                </span>
                <span>{s.units.length} UNITS</span>
              </div>

              <ProgressMarks done={done} total={topics.length} />
            </Link>
          );
        })}
      </div>

      <p className="curriculum-disclaimer">
        A sample selection from KTU’s 2019 first-year courses, with illustrative
        topic maps. Your branch, semester and scheme will determine the final
        syllabus. Completion reflects your saved study progress.
      </p>
    </>
  );
}
