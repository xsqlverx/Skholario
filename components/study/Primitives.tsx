"use client";

import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export function ActionLink({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link className={secondary ? "text-link" : "action"} href={href}>
      {children}
      <ArrowUpRight size={22} aria-hidden="true" />
    </Link>
  );
}

export function SectionTitle({
  number,
  title,
  href,
  link,
}: {
  number: string;
  title: string;
  href?: string;
  link?: string;
}) {
  return (
    <div className="section-title">
      <h2>
        <span>{number}</span>
        {title}
      </h2>
      {href ? (
        <ActionLink secondary href={href}>
          {link}
        </ActionLink>
      ) : (
        <ArrowDown size={20} aria-hidden="true" />
      )}
    </div>
  );
}

export function ProgressMarks({
  done,
  total,
}: {
  done: number;
  total: number;
}) {
  return (
    <div
      className="progress-marks"
      role="img"
      aria-label={`${done} of ${total} topics complete`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < done ? "filled" : ""} />
      ))}
    </div>
  );
}
