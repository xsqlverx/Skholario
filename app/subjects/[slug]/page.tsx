import { notFound } from "next/navigation";
import { findSubject, subjects } from "@/lib/curriculum";
import { SubjectDetail } from "@/components/study/SubjectDetail";
export function generateStaticParams() {
  return subjects.map((s) => ({ slug: s.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: findSubject(slug)?.short ?? "Subject not found" };
}
export default async function SubjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const subject = findSubject(slug);
  if (!subject) notFound();
  return <SubjectDetail subject={subject} />;
}
