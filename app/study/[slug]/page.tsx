import { notFound } from "next/navigation";
import { findSubject } from "@/lib/curriculum";
import { StudySession } from "@/components/study/StudySession";
export const metadata = { title: "Focus time" };
export default async function StudyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ topic?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const subject = findSubject(slug);
  if (!subject) notFound();

  return (
    <StudySession
      key={`${slug}-${query.topic ?? "next"}`}
      subject={subject}
      topicId={query.topic}
    />
  );
}
