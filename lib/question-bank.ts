import { subjects } from "./curriculum";

export type QuestionType =
  | "mcq"
  | "true_false"
  | "short_answer"
  | "fill_blank"
  | "numeric";

export type QuestionDifficulty = "easy" | "medium" | "hard";

export type Question = {
  id: string;
  topicId: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  answer: string | number;
  explanation: string;
  difficulty: QuestionDifficulty;
  stage: "warmup" | "recall" | "practice";
};

// Handcrafted question bank covering multiple question types across stages
const curatedQuestions: Record<string, Question[]> = {
  "math-1-1": [
    // WARM UP (1-3 quick recall questions to activate prior knowledge)
    {
      id: "math-1-1-wu-1",
      topicId: "math-1-1",
      type: "mcq",
      prompt: "What is the derivative of x³?",
      options: ["3x²", "x²/3", "3x³", "6x"],
      answer: "3x²",
      explanation: "By the power rule of differentiation: d/dx(xⁿ) = n·xⁿ⁻¹. For x³, this gives 3x².",
      difficulty: "easy",
      stage: "warmup",
    },
    {
      id: "math-1-1-wu-2",
      topicId: "math-1-1",
      type: "true_false",
      prompt: "Integration can be understood as the continuous sum of infinitesimal quantities.",
      options: ["True", "False"],
      answer: "True",
      explanation: "Integration is the limit of a Riemann sum as the width dx of each strip approaches zero.",
      difficulty: "easy",
      stage: "warmup",
    },
    // RECALL (active retrieval after learning material is closed)
    {
      id: "math-1-1-rc-1",
      topicId: "math-1-1",
      type: "fill_blank",
      prompt: "The power rule for integration states that ∫ xⁿ dx = (xⁿ⁺¹)/(n+1) + C for all n ≠ ____.",
      answer: "-1",
      explanation: "When n = -1, (n+1) = 0 in the denominator. The integral of x⁻¹ = 1/x is ln|x| + C.",
      difficulty: "medium",
      stage: "recall",
    },
    {
      id: "math-1-1-rc-2",
      topicId: "math-1-1",
      type: "mcq",
      prompt: "Which integration method is derived directly from the product rule of differentiation?",
      options: [
        "Integration by Parts",
        "Trigonometric Substitution",
        "Partial Fractions",
        "Euler-Cauchy Method",
      ],
      answer: "Integration by Parts",
      explanation: "Integrating d/dx(uv) = u'v + uv' yields ∫ u dv = uv - ∫ v du, which is Integration by Parts.",
      difficulty: "medium",
      stage: "recall",
    },
    // PRACTICE (3-5 application problems)
    {
      id: "math-1-1-pr-1",
      topicId: "math-1-1",
      type: "numeric",
      prompt: "Evaluate the definite integral ∫ from 0 to 2 of 3x² dx.",
      answer: 8,
      explanation: "The antiderivative is x³. Evaluating from 0 to 2 gives 2³ - 0³ = 8.",
      difficulty: "easy",
      stage: "practice",
    },
    {
      id: "math-1-1-pr-2",
      topicId: "math-1-1",
      type: "mcq",
      prompt: "To evaluate ∫ x·cos(x) dx using integration by parts, which choice of u is best?",
      options: ["u = x", "u = cos(x)", "u = sin(x)", "u = 1"],
      answer: "u = x",
      explanation: "Using LIATE rule: x is algebraic and cos(x) is trigonometric. Differentiating u = x simplifies it to du = dx.",
      difficulty: "medium",
      stage: "practice",
    },
    {
      id: "math-1-1-pr-3",
      topicId: "math-1-1",
      type: "short_answer",
      prompt: "What is the integral of 1/x with respect to x? (Write in terms of ln)",
      answer: "ln|x| + C",
      explanation: "d/dx(ln|x|) = 1/x, therefore the indefinite integral is ln|x| + C.",
      difficulty: "medium",
      stage: "practice",
    },
  ],
  "math-1-2": [
    {
      id: "math-1-2-wu-1",
      topicId: "math-1-2",
      type: "true_false",
      prompt: "The area between two curves f(x) and g(x) is found by integrating f(x) + g(x).",
      options: ["True", "False"],
      answer: "False",
      explanation: "The area is obtained by integrating the difference [top curve - bottom curve], not the sum.",
      difficulty: "easy",
      stage: "warmup",
    },
    {
      id: "math-1-2-rc-1",
      topicId: "math-1-2",
      type: "mcq",
      prompt: "When rotating a region around the x-axis, the disk method uses which cross-sectional area?",
      options: ["π·[R(x)]²", "2π·x·f(x)", "½·b·h", "4/3·π·r³"],
      answer: "π·[R(x)]²",
      explanation: "A disk cross-section is circular with radius R(x), giving area A = π·r² = π·[R(x)]².",
      difficulty: "medium",
      stage: "recall",
    },
    {
      id: "math-1-2-pr-1",
      topicId: "math-1-2",
      type: "numeric",
      prompt: "Find the area bounded by y = 2x and the x-axis from x = 0 to x = 3.",
      answer: 9,
      explanation: "Area = ∫ from 0 to 3 of 2x dx = [x²] from 0 to 3 = 3² - 0 = 9.",
      difficulty: "easy",
      stage: "practice",
    },
    {
      id: "math-1-2-pr-2",
      topicId: "math-1-2",
      type: "mcq",
      prompt: "Where do the curves y = x² and y = x intersect in the first quadrant?",
      options: ["x = 0 and x = 1", "x = 1 and x = 2", "x = 0 and x = 2", "x = -1 and x = 1"],
      answer: "x = 0 and x = 1",
      explanation: "Set x² = x ⟹ x² - x = 0 ⟹ x(x - 1) = 0, giving x = 0 and x = 1.",
      difficulty: "medium",
      stage: "practice",
    },
  ],
  "phy-1-1": [
    {
      id: "phy-1-1-wu-1",
      topicId: "phy-1-1",
      type: "mcq",
      prompt: "Hooke's law for a spring states the restoring force is:",
      options: ["F = -kx", "F = ½kx²", "F = ma", "F = k/x"],
      answer: "F = -kx",
      explanation: "The restoring force is proportional and opposite to displacement: F = -kx.",
      difficulty: "easy",
      stage: "warmup",
    },
    {
      id: "phy-1-1-rc-1",
      topicId: "phy-1-1",
      type: "fill_blank",
      prompt: "In simple harmonic motion, acceleration is proportional to negative ____.",
      answer: "displacement",
      explanation: "a = -ω²x, showing acceleration is directly proportional to negative displacement.",
      difficulty: "medium",
      stage: "recall",
    },
    {
      id: "phy-1-1-pr-1",
      topicId: "phy-1-1",
      type: "true_false",
      prompt: "At resonance, the amplitude of driven oscillations reaches a maximum.",
      options: ["True", "False"],
      answer: "True",
      explanation: "Resonance occurs when driving frequency matches the natural frequency, maximizing energy transfer.",
      difficulty: "easy",
      stage: "practice",
    },
    {
      id: "phy-1-1-pr-2",
      topicId: "phy-1-1",
      type: "mcq",
      prompt: "In critical damping, how does the system behave after displacement?",
      options: [
        "Returns to equilibrium fastest without oscillating",
        "Oscillates with exponentially decaying amplitude",
        "Maintains perpetual oscillation",
        "Remains permanently displaced",
      ],
      answer: "Returns to equilibrium fastest without oscillating",
      explanation: "Critical damping is the boundary where the system returns to rest in minimum time without overshooting.",
      difficulty: "medium",
      stage: "practice",
    },
  ],
  "mech-1-1": [
    {
      id: "mech-1-1-wu-1",
      topicId: "mech-1-1",
      type: "true_false",
      prompt: "A body in static equilibrium can have non-zero linear acceleration.",
      options: ["True", "False"],
      answer: "False",
      explanation: "By Newton's first and second laws, static equilibrium requires net force = 0, so acceleration must be 0.",
      difficulty: "easy",
      stage: "warmup",
    },
    {
      id: "mech-1-1-rc-1",
      topicId: "mech-1-1",
      type: "mcq",
      prompt: "What is the condition for rotational equilibrium in 2D statics?",
      options: ["ΣM = 0 about any point", "ΣFx = ΣFy", "F = m·a", "Torque = I·α"],
      answer: "ΣM = 0 about any point",
      explanation: "To prevent angular acceleration, the algebraic sum of all moments about any point must equal zero.",
      difficulty: "medium",
      stage: "recall",
    },
    {
      id: "mech-1-1-pr-1",
      topicId: "mech-1-1",
      type: "numeric",
      prompt: "A horizontal 100 N force acts 2 m perpendicular to a pivot. What is the magnitude of the moment (N·m)?",
      answer: 200,
      explanation: "Moment M = Force × perpendicular distance = 100 N × 2 m = 200 N·m.",
      difficulty: "easy",
      stage: "practice",
    },
  ],
};

// Fallback question synthesizer so any topic in the curriculum is playable immediately.
// This data boundary is ready for future syllabus PDF parsers to inject generated questions.
function generateFallbackQuestions(topicId: string): Question[] {
  let topicTitle = "Topic Concept";
  for (const s of subjects) {
    for (const u of s.units) {
      const t = u.topics.find((item) => item.id === topicId);
      if (t) {
        topicTitle = t.title;
        break;
      }
    }
  }

  return [
    // WARM UP
    {
      id: `${topicId}-wu-1`,
      topicId,
      type: "true_false",
      prompt: `Understanding fundamental definitions is critical before solving advanced problems in ${topicTitle}.`,
      options: ["True", "False"],
      answer: "True",
      explanation: "Mastering core definitions guarantees sound engineering formulations.",
      difficulty: "easy",
      stage: "warmup",
    },
    // RECALL
    {
      id: `${topicId}-rc-1`,
      topicId,
      type: "mcq",
      prompt: `What is the primary analytical focus when studying ${topicTitle}?`,
      options: [
        "Analyzing governing equations and boundary conditions",
        "Memorizing numerical constants without context",
        "Ignoring physical units and dimensions",
        "Avoiding schematic diagrams",
      ],
      answer: "Analyzing governing equations and boundary conditions",
      explanation: "Engineering problem solving is based on identifying governing equations and initial/boundary conditions.",
      difficulty: "medium",
      stage: "recall",
    },
    {
      id: `${topicId}-rc-2`,
      topicId,
      type: "fill_blank",
      prompt: `Checking dimensional consistency helps verify the correctness of formulas in ${topicTitle} (Enter "units" or "dimensions").`,
      answer: "units",
      explanation: "Dimensional analysis ensures both sides of an engineering equation have matching physical units.",
      difficulty: "easy",
      stage: "recall",
    },
    // PRACTICE
    {
      id: `${topicId}-pr-1`,
      topicId,
      type: "mcq",
      prompt: `Which strategy yields the most reliable results when tackling an exam question on ${topicTitle}?`,
      options: [
        "Identify given parameters, state governing equations, and solve algebraically before substituting values",
        "Guess values without checking assumptions",
        "Skip the free body or system diagram to save time",
        "Only calculate the final answer without showing intermediate steps",
      ],
      answer: "Identify given parameters, state governing equations, and solve algebraically before substituting values",
      explanation: "Systematic algebraic formulation minimizes calculation errors and demonstrates engineering understanding.",
      difficulty: "medium",
      stage: "practice",
    },
    {
      id: `${topicId}-pr-2`,
      topicId,
      type: "true_false",
      prompt: `In ${topicTitle}, verifying assumptions and checking extreme cases improves confidence in numerical answers.`,
      options: ["True", "False"],
      answer: "True",
      explanation: "Sanity checking boundary cases (e.g. zero, infinity, symmetrical limits) is standard engineering practice.",
      difficulty: "easy",
      stage: "practice",
    },
  ];
}

export function getQuestionsForTopic(topicId: string): Question[] {
  return curatedQuestions[topicId] ?? generateFallbackQuestions(topicId);
}

export function getWarmupQuestions(topicId: string): Question[] {
  return getQuestionsForTopic(topicId).filter((q) => q.stage === "warmup");
}

export function getRecallQuestions(topicId: string): Question[] {
  return getQuestionsForTopic(topicId).filter((q) => q.stage === "recall");
}

export function getPracticeQuestions(topicId: string): Question[] {
  return getQuestionsForTopic(topicId).filter((q) => q.stage === "practice");
}
