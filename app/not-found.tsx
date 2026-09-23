import { ActionLink, Eyebrow } from "@/components/study/Primitives";
export default function NotFound() {
  return (
    <section className="session-stage">
      <Eyebrow>404 / A SMALL DETOUR</Eyebrow>
      <h1>Lost your place?</h1>
      <p>This topic or subject isn’t in the sample curriculum.</p>
      <ActionLink href="/subjects">BACK TO SUBJECTS</ActionLink>
    </section>
  );
}
