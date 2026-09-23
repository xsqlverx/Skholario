import type { Metadata } from "next";
import { SubjectCollection } from "@/components/study/SubjectCollection";
export const metadata: Metadata = { title: "Your subjects" };
export default function SubjectsPage() {
  return <SubjectCollection />;
}
