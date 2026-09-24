export type Topic = {
  id: string;
  title: string;
  minutes: number;
  sourcePages?: number[];
};
export type Unit = {
  id: string;
  title: string;
  topics: Topic[];
  sourcePages?: number[];
};
export type Subject = {
  id: string;
  code: string;
  name: string;
  short: string;
  symbol: string;
  color: string;
  units: Unit[];
};

// Sample course content retained from Pass 1. IDs are explicit so reordering
// units/topics cannot silently transfer completion to another topic.
// Replace content only after confirming the student's official syllabus.
export const subjects: Subject[] = [
  {
    id: "mathematics",
    code: "MAT102",
    name: "Vector Calculus, Differential Equations & Transforms",
    short: "Mathematics",
    symbol: "∫",
    color: "red",
    units: [
      {
        id: "mathematics-unit-1",
        title: "Single-variable calculus",
        topics: [
          {
            id: "math-1-1",
            title: "Integration essentials",
            minutes: 35,
          },
          {
            id: "math-1-2",
            title: "Applications of integration",
            minutes: 25,
          },
        ],
      },
      {
        id: "mathematics-unit-2",
        title: "Differential equations",
        topics: [
          {
            id: "math-2-1",
            title: "First-order differential equations",
            minutes: 35,
          },
          {
            id: "math-2-2",
            title: "Second-order linear equations",
            minutes: 25,
          },
          {
            id: "math-2-3",
            title: "Applications of differential equations",
            minutes: 25,
          },
        ],
      },
      {
        id: "mathematics-unit-3",
        title: "Vector calculus",
        topics: [
          {
            id: "math-3-1",
            title: "Gradient, divergence & curl",
            minutes: 35,
          },
          {
            id: "math-3-2",
            title: "Line and surface integrals",
            minutes: 25,
          },
        ],
      },
      {
        id: "mathematics-unit-4",
        title: "Laplace transforms",
        topics: [
          {
            id: "math-4-1",
            title: "Laplace transform essentials",
            minutes: 35,
          },
          {
            id: "math-4-2",
            title: "Inverse Laplace transforms",
            minutes: 25,
          },
        ],
      },
      {
        id: "mathematics-unit-5",
        title: "Fourier series",
        topics: [
          {
            id: "math-5-1",
            title: "Periodic functions",
            minutes: 35,
          },
          {
            id: "math-5-2",
            title: "Fourier series expansions",
            minutes: 25,
          },
        ],
      },
    ],
  },
  {
    id: "physics",
    code: "PHT100",
    name: "Engineering Physics A",
    short: "Engineering Physics",
    symbol: "λ",
    color: "green",
    units: [
      {
        id: "physics-unit-1",
        title: "Oscillations & waves",
        topics: [
          {
            id: "phy-1-1",
            title: "Harmonic oscillations",
            minutes: 35,
          },
          {
            id: "phy-1-2",
            title: "Damped and forced oscillations",
            minutes: 25,
          },
        ],
      },
      {
        id: "physics-unit-2",
        title: "Wave optics",
        topics: [
          {
            id: "phy-2-1",
            title: "Interference",
            minutes: 35,
          },
          {
            id: "phy-2-2",
            title: "Diffraction",
            minutes: 25,
          },
        ],
      },
      {
        id: "physics-unit-3",
        title: "Quantum mechanics",
        topics: [
          {
            id: "phy-3-1",
            title: "Wave-particle duality",
            minutes: 35,
          },
          {
            id: "phy-3-2",
            title: "Schrödinger equation",
            minutes: 25,
          },
        ],
      },
      {
        id: "physics-unit-4",
        title: "Magnetism & materials",
        topics: [
          {
            id: "phy-4-1",
            title: "Magnetic materials",
            minutes: 35,
          },
          {
            id: "phy-4-2",
            title: "Superconductivity",
            minutes: 25,
          },
        ],
      },
      {
        id: "physics-unit-5",
        title: "Photonics",
        topics: [
          {
            id: "phy-5-1",
            title: "Lasers",
            minutes: 35,
          },
          {
            id: "phy-5-2",
            title: "Fibre optics",
            minutes: 25,
          },
        ],
      },
    ],
  },
  {
    id: "mechanics",
    code: "EST100",
    name: "Engineering Mechanics",
    short: "Engineering Mechanics",
    symbol: "↗",
    color: "yellow",
    units: [
      {
        id: "mechanics-unit-1",
        title: "Statics",
        topics: [
          {
            id: "mech-1-1",
            title: "Force systems",
            minutes: 35,
          },
          {
            id: "mech-1-2",
            title: "Equilibrium",
            minutes: 25,
          },
        ],
      },
      {
        id: "mechanics-unit-2",
        title: "Friction",
        topics: [
          {
            id: "mech-2-1",
            title: "Laws of friction",
            minutes: 35,
          },
          {
            id: "mech-2-2",
            title: "Ladder problems",
            minutes: 25,
          },
        ],
      },
      {
        id: "mechanics-unit-3",
        title: "Centroids",
        topics: [
          {
            id: "mech-3-1",
            title: "Centroids of areas",
            minutes: 35,
          },
          {
            id: "mech-3-2",
            title: "Moment of inertia",
            minutes: 25,
          },
        ],
      },
      {
        id: "mechanics-unit-4",
        title: "Dynamics",
        topics: [
          {
            id: "mech-4-1",
            title: "Particle kinematics",
            minutes: 35,
          },
          {
            id: "mech-4-2",
            title: "Newton’s laws",
            minutes: 25,
          },
        ],
      },
      {
        id: "mechanics-unit-5",
        title: "Work & energy",
        topics: [
          {
            id: "mech-5-1",
            title: "Work-energy principle",
            minutes: 35,
          },
          {
            id: "mech-5-2",
            title: "Impulse and momentum",
            minutes: 25,
          },
        ],
      },
    ],
  },
  {
    id: "programming",
    code: "EST102",
    name: "Programming in C",
    short: "Programming in C",
    symbol: "{ }",
    color: "ink",
    units: [
      {
        id: "programming-unit-1",
        title: "Getting started",
        topics: [
          {
            id: "code-1-1",
            title: "Algorithms and flowcharts",
            minutes: 35,
          },
          {
            id: "code-1-2",
            title: "C language fundamentals",
            minutes: 25,
          },
        ],
      },
      {
        id: "programming-unit-2",
        title: "Control flow",
        topics: [
          {
            id: "code-2-1",
            title: "Conditions",
            minutes: 35,
          },
          {
            id: "code-2-2",
            title: "Loops",
            minutes: 25,
          },
        ],
      },
      {
        id: "programming-unit-3",
        title: "Arrays & strings",
        topics: [
          {
            id: "code-3-1",
            title: "Arrays",
            minutes: 35,
          },
          {
            id: "code-3-2",
            title: "Strings",
            minutes: 25,
          },
        ],
      },
      {
        id: "programming-unit-4",
        title: "Functions",
        topics: [
          {
            id: "code-4-1",
            title: "Functions",
            minutes: 35,
          },
          {
            id: "code-4-2",
            title: "Recursion",
            minutes: 25,
          },
        ],
      },
      {
        id: "programming-unit-5",
        title: "Pointers & files",
        topics: [
          {
            id: "code-5-1",
            title: "Pointers",
            minutes: 35,
          },
          {
            id: "code-5-2",
            title: "File handling",
            minutes: 25,
          },
        ],
      },
    ],
  },
  {
    id: "graphics",
    code: "EST110",
    name: "Engineering Graphics",
    short: "Engineering Graphics",
    symbol: "△",
    color: "paper",
    units: [
      {
        id: "graphics-unit-1",
        title: "Drawing fundamentals",
        topics: [
          {
            id: "draw-1-1",
            title: "Drawing conventions",
            minutes: 35,
          },
          {
            id: "draw-1-2",
            title: "Scales",
            minutes: 25,
          },
        ],
      },
      {
        id: "graphics-unit-2",
        title: "Projections",
        topics: [
          {
            id: "draw-2-1",
            title: "Points and lines",
            minutes: 35,
          },
          {
            id: "draw-2-2",
            title: "Planes",
            minutes: 25,
          },
        ],
      },
      {
        id: "graphics-unit-3",
        title: "Solids",
        topics: [
          {
            id: "draw-3-1",
            title: "Projection of solids",
            minutes: 35,
          },
          {
            id: "draw-3-2",
            title: "Auxiliary views",
            minutes: 25,
          },
        ],
      },
      {
        id: "graphics-unit-4",
        title: "Sections",
        topics: [
          {
            id: "draw-4-1",
            title: "Section of solids",
            minutes: 35,
          },
          {
            id: "draw-4-2",
            title: "Development of surfaces",
            minutes: 25,
          },
        ],
      },
      {
        id: "graphics-unit-5",
        title: "Isometric views",
        topics: [
          {
            id: "draw-5-1",
            title: "Isometric projection",
            minutes: 35,
          },
          {
            id: "draw-5-2",
            title: "Orthographic views",
            minutes: 25,
          },
        ],
      },
    ],
  },
  {
    id: "electrical",
    code: "EST130",
    name: "Basics of Electrical & Electronics Engineering",
    short: "Electrical & Electronics",
    symbol: "Ω",
    color: "pink",
    units: [
      {
        id: "electrical-unit-1",
        title: "DC circuits",
        topics: [
          {
            id: "elec-1-1",
            title: "Circuit elements",
            minutes: 35,
          },
          {
            id: "elec-1-2",
            title: "Kirchhoff’s laws",
            minutes: 25,
          },
        ],
      },
      {
        id: "electrical-unit-2",
        title: "AC circuits",
        topics: [
          {
            id: "elec-2-1",
            title: "Alternating quantities",
            minutes: 35,
          },
          {
            id: "elec-2-2",
            title: "AC circuit analysis",
            minutes: 25,
          },
        ],
      },
      {
        id: "electrical-unit-3",
        title: "Electrical machines",
        topics: [
          {
            id: "elec-3-1",
            title: "Transformers",
            minutes: 35,
          },
          {
            id: "elec-3-2",
            title: "Motors",
            minutes: 25,
          },
        ],
      },
      {
        id: "electrical-unit-4",
        title: "Semiconductors",
        topics: [
          {
            id: "elec-4-1",
            title: "Diodes",
            minutes: 35,
          },
          {
            id: "elec-4-2",
            title: "Transistors",
            minutes: 25,
          },
        ],
      },
      {
        id: "electrical-unit-5",
        title: "Electronic systems",
        topics: [
          {
            id: "elec-5-1",
            title: "Rectifiers",
            minutes: 35,
          },
          {
            id: "elec-5-2",
            title: "Communication systems",
            minutes: 25,
          },
        ],
      },
    ],
  },
];

export const allTopics = subjects.flatMap((s) =>
  s.units.flatMap((u) => u.topics),
);
export const findSubject = (id: string) => subjects.find((s) => s.id === id);
