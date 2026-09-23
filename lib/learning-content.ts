import { subjects, type Subject, type Topic } from "./curriculum";

export type LearningSection = {
  id: string;
  title: string;
  content: string;
  keyPoints?: string[];
  example?: string;
  formula?: string;
};

export type TopicLearningContent = {
  topicId: string;
  subjectId: string;
  overview: string;
  sections: LearningSection[];
};

// Rich handcrafted learning content for core topics to prove engine architecture.
// Designed with clear pedagogical structure: Concept -> Intuition/Example -> Formal Rule.
const curatedLearningContent: Record<string, TopicLearningContent> = {
  "math-1-1": {
    topicId: "math-1-1",
    subjectId: "mathematics",
    overview:
      "Integration is the continuous accumulation of quantities. It reverses differentiation and calculates areas, volumes, and cumulative totals.",
    sections: [
      {
        id: "math-1-1-sec-1",
        title: "01 — The Fundamental Idea",
        content:
          "Definite integration is fundamentally about slicing a continuous shape into infinitely thin strips, multiplying each width dx by its height f(x), and summing them together. The Fundamental Theorem of Calculus bridges slope and area: the rate of change accumulated over an interval equals the net change of the anti-derivative.",
        keyPoints: [
          "Integration represents continuous addition (Riemann sum as dx approaches 0).",
          "The indefinite integral ∫ f(x) dx gives a family of antiderivatives F(x) + C.",
          "The definite integral ∫ from a to b of f(x) dx yields a scalar value: F(b) - F(a).",
        ],
        formula: "∫ f(x) dx = F(x) + C  where  F'(x) = f(x)",
      },
      {
        id: "math-1-1-sec-2",
        title: "02 — Intuitive Example: Area Under a Curve",
        content:
          "Consider velocity v(t) = 3t² meters per second. To find total distance traveled from t = 0 to t = 2, we integrate v(t). The antiderivative is t³, so the distance is (2³ - 0³) = 8 meters. Area under the curve physically represents accumulated change.",
        example:
          "Find ∫ from 0 to 2 of 3t² dt:\nAntiderivative: F(t) = t³\nEvaluate: F(2) - F(0) = 8 - 0 = 8.",
      },
      {
        id: "math-1-1-sec-3",
        title: "03 — Essential Rules & Substitution",
        content:
          "When an integrand contains both an inner function g(x) and its derivative g'(x), use u-substitution to simplify. For products of distinct functions (algebraic × trigonometric), use Integration by Parts derived from the product rule.",
        keyPoints: [
          "Power Rule: ∫ xⁿ dx = (xⁿ⁺¹)/(n+1) + C for all n ≠ -1.",
          "Logarithmic Rule: ∫ (1/x) dx = ln|x| + C.",
          "Integration by Parts: ∫ u dv = uv - ∫ v du. Choose u using LIATE (Logarithmic, Inverse trig, Algebraic, Trig, Exponential).",
        ],
        formula: "∫ u dv = uv - ∫ v du",
      },
    ],
  },
  "math-1-2": {
    topicId: "math-1-2",
    subjectId: "mathematics",
    overview:
      "Definite integrals directly solve physical problems: areas between curves, volumes of revolution, and arc lengths.",
    sections: [
      {
        id: "math-1-2-sec-1",
        title: "01 — Area Between Two Curves",
        content:
          "To find the enclosed area between two functions f(x) and g(x) where f(x) ≥ g(x), integrate their difference (top curve minus bottom curve) between their points of intersection.",
        formula: "Area = ∫ [f(x) - g(x)] dx  from x = a to x = b",
        keyPoints: [
          "Always identify intersection points first by setting f(x) = g(x).",
          "Ensure f(x) ≥ g(x) across the entire interval; split into sub-intervals if curves cross.",
        ],
      },
      {
        id: "math-1-2-sec-2",
        title: "02 — Solids of Revolution: Disk & Washer Methods",
        content:
          "Rotating a 2D region about an axis creates a 3D solid. If rotated around the x-axis, each cross-section is a circle with radius R(x). For hollow shapes, subtract the inner cylinder radius r(x).",
        formula: "Volume = π ∫ [R(x)² - r(x)²] dx",
        example:
          "Rotating y = √x from x = 0 to x = 4 around x-axis:\nVolume = π ∫ (√x)² dx = π ∫ x dx = π [x²/2] from 0 to 4 = 8π.",
      },
    ],
  },
  "phy-1-1": {
    topicId: "phy-1-1",
    subjectId: "physics",
    overview:
      "Oscillations occur when a system is displaced from stable equilibrium and experiences a restoring force directed towards equilibrium.",
    sections: [
      {
        id: "phy-1-1-sec-1",
        title: "01 — Simple Harmonic Motion (SHM)",
        content:
          "In Simple Harmonic Motion, the restoring force is directly proportional to displacement and opposite in direction: F = -kx. The acceleration is always directed towards the equilibrium position: a = -ω²x.",
        formula: "d²x/dt² + ω²x = 0  where  ω = √(k/m)",
        keyPoints: [
          "Displacement: x(t) = A cos(ωt + φ)",
          "Velocity leads displacement by π/2 radians.",
          "Total mechanical energy E = ½kA² is conserved in ideal SHM.",
        ],
      },
      {
        id: "phy-1-1-sec-2",
        title: "02 — Damped & Driven Oscillations",
        content:
          "Real systems dissipate energy through friction or drag (damping force F_d = -b v). When an external periodic force acts on the system, resonance occurs if the driving frequency matches the natural frequency.",
        keyPoints: [
          "Underdamping: oscillations decay exponentially with envelope e^(-γt).",
          "Critical damping: system returns to equilibrium fastest without oscillating.",
          "Resonance: amplitude peaks dramatically when driving frequency ω ≈ natural frequency ω₀.",
        ],
      },
    ],
  },
  "mech-1-1": {
    topicId: "mech-1-1",
    subjectId: "mechanics",
    overview:
      "Statics analyzes bodies at rest or in uniform motion under balanced force and moment systems.",
    sections: [
      {
        id: "mech-1-1-sec-1",
        title: "01 — Conditions for Static Equilibrium",
        content:
          "For a rigid body to remain in static equilibrium, the vector sum of all external forces must be zero, and the sum of moments about any point must be zero.",
        formula: "ΣFx = 0,  ΣFy = 0,  ΣM_any_point = 0",
        keyPoints: [
          "Translational equilibrium prevents linear acceleration.",
          "Rotational equilibrium prevents angular acceleration.",
          "Free Body Diagrams (FBDs) isolate the body and show all contact and body forces.",
        ],
      },
    ],
  },
};

// Fallback generator ensures any topic in the curriculum is playable immediately,
// providing the exact structure that future PDF ingestion tools will emit.
function generateFallbackContent(topic: Topic, subject: Subject): TopicLearningContent {
  const unit = subject.units.find((u) => u.topics.some((t) => t.id === topic.id));
  return {
    topicId: topic.id,
    subjectId: subject.id,
    overview: `Key conceptual foundations and applications of ${topic.title} in ${subject.name} (${unit?.title ?? "Core Syllabus"}).`,
    sections: [
      {
        id: `${topic.id}-sec-1`,
        title: "01 — Core Concept & Principles",
        content: `${topic.title} is an essential component of ${unit?.title ?? subject.short}. Understanding this topic requires analyzing the foundational equations, assumptions, and boundary conditions that govern its behavior in engineering scenarios.`,
        keyPoints: [
          `Focus on the primary definitions and analytical formulas defining ${topic.title}.`,
          `Identify the physical or mathematical meaning of each variable in the governing relation.`,
          `Check dimensional consistency and boundary conditions when formulating problems.`,
        ],
      },
      {
        id: `${topic.id}-sec-2`,
        title: "02 — Practical Application & Problem Approach",
        content: `When approaching exam questions and engineering problems on ${topic.title}, first sketch a diagram or identify given parameters. Next, select the appropriate formula and simplify step by step before substituting values.`,
        example: `Step 1: Write down known values and required output.\nStep 2: State governing principle.\nStep 3: Solve algebraically before numerical evaluation.`,
      },
    ],
  };
}

export function getLearningContent(topicId: string): TopicLearningContent {
  if (curatedLearningContent[topicId]) {
    return curatedLearningContent[topicId];
  }

  for (const subject of subjects) {
    for (const unit of subject.units) {
      const topic = unit.topics.find((t) => t.id === topicId);
      if (topic) {
        return generateFallbackContent(topic, subject);
      }
    }
  }

  // Graceful fallback for custom or test topic IDs
  return {
    topicId,
    subjectId: "general",
    overview: "Structured engineering study topic.",
    sections: [
      {
        id: `${topicId}-sec-1`,
        title: "01 — Foundation & Core Ideas",
        content: "Study the foundational definitions and working principles for this topic.",
        keyPoints: ["Understand fundamental definitions", "Review problem-solving techniques"],
      },
    ],
  };
}
