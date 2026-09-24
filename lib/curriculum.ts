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
  slot?: string;
  examDate?: string;
  units: Unit[];
};

/**
 * Real AISAT KTU S1 First Internal Exam Curriculum
 * Official Examination Schedule:
 * - Slot A (01.10.2026): Mathematics for Information Science-1 (A105MAT01)
 * - Slot B (03.10.2026): Chemistry for Information Science (A105CYT02)
 * - Slot C (05.10.2026): Engineering Graphics & CAD (A105EST03)
 * - Slot D (06.10.2026): Intro to Electrical & Electronics Engg (A105EST04)
 * - Slot E (07.10.2026): Algorithmic Thinking with Python (A105EST05)
 */
export const subjects: Subject[] = [
  {
    id: "mathematics",
    code: "A105MAT01",
    name: "Mathematics for Information Science-1",
    short: "Mathematics-1",
    symbol: "∫",
    color: "red",
    slot: "Slot A",
    examDate: "2026-10-01",
    units: [
      {
        id: "math-unit-1",
        title: "Linear Algebra & Matrices",
        topics: [
          { id: "math-1-1", title: "Rank of a Matrix & Echelon Form", minutes: 35 },
          { id: "math-1-2", title: "System of Linear Equations (Gauss Elimination)", minutes: 30 },
          { id: "math-1-3", title: "Eigenvalues & Eigenvectors", minutes: 35 },
          { id: "math-1-4", title: "Cayley-Hamilton Theorem & Diagonalization", minutes: 30 },
        ],
      },
      {
        id: "math-unit-2",
        title: "Differential Calculus & Series",
        topics: [
          { id: "math-2-1", title: "Rolle's & Lagrange's Mean Value Theorems", minutes: 30 },
          { id: "math-2-2", title: "Taylor & Maclaurin Series Expansions", minutes: 35 },
          { id: "math-2-3", title: "Indeterminate Forms & L'Hospital's Rule", minutes: 25 },
          { id: "math-2-4", title: "Curvature, Radius & Circle of Curvature", minutes: 30 },
        ],
      },
      {
        id: "math-unit-3",
        title: "Multivariable Differential Calculus",
        topics: [
          { id: "math-3-1", title: "Partial Derivatives & Euler's Theorem", minutes: 35 },
          { id: "math-3-2", title: "Total Derivatives & Chain Rule", minutes: 25 },
          { id: "math-3-3", title: "Jacobians and Functional Dependence", minutes: 30 },
          { id: "math-3-4", title: "Maxima & Minima (Lagrange Multipliers)", minutes: 35 },
        ],
      },
      {
        id: "math-unit-4",
        title: "Multiple Integrals",
        topics: [
          { id: "math-4-1", title: "Double Integrals in Cartesian Coordinates", minutes: 35 },
          { id: "math-4-2", title: "Change of Order of Integration", minutes: 35 },
          { id: "math-4-3", title: "Double Integrals in Polar Coordinates", minutes: 30 },
          { id: "math-4-4", title: "Triple Integrals & Volume Calculation", minutes: 35 },
        ],
      },
      {
        id: "math-unit-5",
        title: "Vector Calculus",
        topics: [
          { id: "math-5-1", title: "Gradient, Divergence & Curl", minutes: 30 },
          { id: "math-5-2", title: "Line Integrals & Conservative Fields", minutes: 35 },
          { id: "math-5-3", title: "Green's Theorem in the Plane", minutes: 30 },
          { id: "math-5-4", title: "Stokes' & Gauss Divergence Theorems", minutes: 35 },
        ],
      },
    ],
  },
  {
    id: "chemistry",
    code: "A105CYT02",
    name: "Chemistry for Information Science",
    short: "Chemistry",
    symbol: "⚗",
    color: "green",
    slot: "Slot B",
    examDate: "2026-10-03",
    units: [
      {
        id: "chem-unit-1",
        title: "Electrochemistry & Batteries",
        topics: [
          { id: "chem-1-1", title: "Nernst Equation & Cell Potential", minutes: 30 },
          { id: "chem-1-2", title: "Reference Electrodes (Calomel & Glass)", minutes: 25 },
          { id: "chem-1-3", title: "Lithium-Ion Batteries & Supercapacitors", minutes: 35 },
          { id: "chem-1-4", title: "Fuel Cells (H2-O2 Mechanism)", minutes: 30 },
        ],
      },
      {
        id: "chem-unit-2",
        title: "Corrosion Science & Protection",
        topics: [
          { id: "chem-2-1", title: "Electrochemical Theory of Corrosion", minutes: 30 },
          { id: "chem-2-2", title: "Galvanic & Differential Aeration Corrosion", minutes: 30 },
          { id: "chem-2-3", title: "Cathodic Protection (Sacrificial Anode & ICCP)", minutes: 25 },
          { id: "chem-2-4", title: "Electroplating & Electroless Plating", minutes: 30 },
        ],
      },
      {
        id: "chem-unit-3",
        title: "Polymers & Electronic Materials",
        topics: [
          { id: "chem-3-1", title: "Conducting Polymers (Polyaniline, Polyacetylene)", minutes: 35 },
          { id: "chem-3-2", title: "OLEDs and Organic Semiconductors", minutes: 30 },
          { id: "chem-3-3", title: "Carbon Nanotubes & Graphene", minutes: 35 },
          { id: "chem-3-4", title: "Polymer Matrix Composites in Electronics", minutes: 25 },
        ],
      },
      {
        id: "chem-unit-4",
        title: "Spectroscopy & Instrumental Analysis",
        topics: [
          { id: "chem-4-1", title: "UV-Visible Spectroscopy & Beer-Lambert Law", minutes: 35 },
          { id: "chem-4-2", title: "FTIR Spectroscopy Principles & Fingerprint Region", minutes: 35 },
          { id: "chem-4-3", title: "Photolithography Principles in IC Fabrication", minutes: 30 },
          { id: "chem-4-4", title: "Thermal Analysis (TGA & DSC)", minutes: 25 },
        ],
      },
      {
        id: "chem-unit-5",
        title: "Water Technology & Green Chemistry",
        topics: [
          { id: "chem-5-1", title: "Hardness of Water & EDTA Titration", minutes: 30 },
          { id: "chem-5-2", title: "Boiler Troubles: Scales, Sludges & Caustic Embrittlement", minutes: 30 },
          { id: "chem-5-3", title: "Reverse Osmosis Desalination", minutes: 25 },
          { id: "chem-5-4", title: "12 Principles of Green Chemistry & E-waste Recycling", minutes: 30 },
        ],
      },
    ],
  },
  {
    id: "graphics",
    code: "A105EST03",
    name: "Engineering Graphics & CAD",
    short: "Graphics & CAD",
    symbol: "📐",
    color: "ink",
    slot: "Slot C",
    examDate: "2026-10-05",
    units: [
      {
        id: "graph-unit-1",
        title: "CAD Fundamentals & Engineering Curves",
        topics: [
          { id: "graph-1-1", title: "CAD Workspace, Coordinate Systems & Snapping", minutes: 30 },
          { id: "graph-1-2", title: "Conic Sections: Ellipse Construction", minutes: 35 },
          { id: "graph-1-3", title: "Parabola & Hyperbola Construction", minutes: 30 },
          { id: "graph-1-4", title: "Involutes of Polygon & Circle", minutes: 30 },
        ],
      },
      {
        id: "graph-unit-2",
        title: "Orthographic Projection of Points & Lines",
        topics: [
          { id: "graph-2-1", title: "First-Angle vs Third-Angle Projections", minutes: 25 },
          { id: "graph-2-2", title: "Projection of Points in All Four Quadrants", minutes: 30 },
          { id: "graph-2-3", title: "True Length & Inclinations of Straight Lines", minutes: 40 },
          { id: "graph-2-4", title: "Traces of a Line (HT and VT)", minutes: 35 },
        ],
      },
      {
        id: "graph-unit-3",
        title: "Projection of Planes & Solids",
        topics: [
          { id: "graph-3-1", title: "Projection of Regular Polygonal Planes", minutes: 35 },
          { id: "graph-3-2", title: "Projection of Circular Lamina", minutes: 30 },
          { id: "graph-3-3", title: "Projection of Prisms & Pyramids (Axis Inclined)", minutes: 40 },
          { id: "graph-3-4", title: "Projection of Cylinders & Cones", minutes: 35 },
        ],
      },
      {
        id: "graph-unit-4",
        title: "Sections of Solids & Development",
        topics: [
          { id: "graph-4-1", title: "Section Planes & True Shape of Sections", minutes: 35 },
          { id: "graph-4-2", title: "Section of Prisms, Cylinders & Pyramids", minutes: 40 },
          { id: "graph-4-3", title: "Development of Lateral Surfaces (Parallel Line Method)", minutes: 35 },
          { id: "graph-4-4", title: "Development of Cones & Pyramids (Radial Line Method)", minutes: 35 },
        ],
      },
      {
        id: "graph-unit-5",
        title: "Isometric Projection & 3D Modeling",
        topics: [
          { id: "graph-5-1", title: "Isometric Scale & Isometric View vs Projection", minutes: 30 },
          { id: "graph-5-2", title: "Isometric Projection of Prisms & Pyramids", minutes: 35 },
          { id: "graph-5-3", title: "Isometric Projection of Composite Solids", minutes: 40 },
          { id: "graph-5-4", title: "Conversion of Pictorial Views to Orthographic Views", minutes: 35 },
        ],
      },
    ],
  },
  {
    id: "electrical",
    code: "A105EST04",
    name: "Intro to Electrical & Electronics Engg",
    short: "Electrical & Electronics",
    symbol: "Ω",
    color: "yellow",
    slot: "Slot D",
    examDate: "2026-10-06",
    units: [
      {
        id: "elec-unit-1",
        title: "DC Circuits & Network Theorems",
        topics: [
          { id: "elec-1-1", title: "Ohm's Law, KCL & KVL Essentials", minutes: 30 },
          { id: "elec-1-2", title: "Mesh & Nodal Analysis of Resistive Networks", minutes: 35 },
          { id: "elec-1-3", title: "Thevenin's & Norton's Equivalent Circuits", minutes: 35 },
          { id: "elec-1-4", title: "Star-Delta Transformations & Superposition", minutes: 30 },
        ],
      },
      {
        id: "elec-unit-2",
        title: "AC Fundamentals & Magnetic Circuits",
        topics: [
          { id: "elec-2-1", title: "RMS, Average Value, Form & Peak Factors", minutes: 30 },
          { id: "elec-2-2", title: "Series R-L, R-C and R-L-C Circuits", minutes: 35 },
          { id: "elec-2-3", title: "Resonance in Series R-L-C & Quality Factor", minutes: 30 },
          { id: "elec-2-4", title: "Magnetic Circuits: MMF, Reluctance & Faraday's Laws", minutes: 30 },
        ],
      },
      {
        id: "elec-unit-3",
        title: "Electrical Machines",
        topics: [
          { id: "elec-3-1", title: "Single-Phase Transformer: Principle & EMF Equation", minutes: 35 },
          { id: "elec-3-2", title: "Transformer Losses, Efficiency & Regulation", minutes: 30 },
          { id: "elec-3-3", title: "DC Motors: Principle of Operation & Back EMF", minutes: 30 },
          { id: "elec-3-4", title: "Three-Phase Induction Motors Construction & Working", minutes: 35 },
        ],
      },
      {
        id: "elec-unit-4",
        title: "Semiconductor Devices & Rectifiers",
        topics: [
          { id: "elec-4-1", title: "PN Junction Diode V-I Characteristics", minutes: 30 },
          { id: "elec-4-2", title: "Half-Wave & Full-Wave Centre-Tapped Rectifiers", minutes: 30 },
          { id: "elec-4-3", title: "Bridge Rectifier & Filter Capacitors", minutes: 35 },
          { id: "elec-4-4", title: "Zener Diode as a Voltage Regulator", minutes: 30 },
        ],
      },
      {
        id: "elec-unit-5",
        title: "Transistors & Electronic Systems",
        topics: [
          { id: "elec-5-1", title: "BJT Operation & Characteristics in CE Configuration", minutes: 35 },
          { id: "elec-5-2", title: "BJT as a Switch and Voltage Amplifier", minutes: 30 },
          { id: "elec-5-3", title: "Ideal Operational Amplifier & Virtual Ground", minutes: 30 },
          { id: "elec-5-4", title: "Inverting, Non-Inverting & Summing Amplifiers", minutes: 35 },
        ],
      },
    ],
  },
  {
    id: "programming",
    code: "A105EST05",
    name: "Algorithmic Thinking with Python",
    short: "Python & Algorithms",
    symbol: "{ }",
    color: "pink",
    slot: "Slot E",
    examDate: "2026-10-07",
    units: [
      {
        id: "prog-unit-1",
        title: "Problem Solving & Python Basics",
        topics: [
          { id: "prog-1-1", title: "Algorithms, Flowcharts & Pseudocode", minutes: 30 },
          { id: "prog-1-2", title: "Python Variables, Identifiers & Data Types", minutes: 25 },
          { id: "prog-1-3", title: "Arithmetic, Relational & Logical Operators", minutes: 25 },
          { id: "prog-1-4", title: "Standard Input, Output & Type Casting", minutes: 25 },
        ],
      },
      {
        id: "prog-unit-2",
        title: "Control Flow & Iteration",
        topics: [
          { id: "prog-2-1", title: "Conditional Statements (if, if-else, nested if)", minutes: 30 },
          { id: "prog-2-2", title: "While Loops and Infinite Loop Prevention", minutes: 30 },
          { id: "prog-2-3", title: "For Loops with range() and Enumeration", minutes: 30 },
          { id: "prog-2-4", title: "Loop Jump Statements: break, continue, pass", minutes: 25 },
        ],
      },
      {
        id: "prog-unit-3",
        title: "Functions & Recursion",
        topics: [
          { id: "prog-3-1", title: "Defining Functions, Arguments & Return Values", minutes: 30 },
          { id: "prog-3-2", title: "Default, Keyword & Positional Arguments", minutes: 25 },
          { id: "prog-3-3", title: "Variable Scope: Local, Global & global Keyword", minutes: 25 },
          { id: "prog-3-4", title: "Recursion Fundamentals, Base Cases & Call Stack", minutes: 35 },
        ],
      },
      {
        id: "prog-unit-4",
        title: "Data Structures: Strings, Lists, Dictionaries",
        topics: [
          { id: "prog-4-1", title: "String Slicing, Indexing & Built-in Methods", minutes: 30 },
          { id: "prog-4-2", title: "Lists: Operations, Slicing & List Comprehension", minutes: 35 },
          { id: "prog-4-3", title: "Tuples, Sets & Set Mathematical Operations", minutes: 30 },
          { id: "prog-4-4", title: "Dictionaries: Key-Value Pairs, Methods & Iteration", minutes: 35 },
        ],
      },
      {
        id: "prog-unit-5",
        title: "Files, Exceptions & Search Algorithms",
        topics: [
          { id: "prog-5-1", title: "File Operations: Reading & Writing with open()", minutes: 30 },
          { id: "prog-5-2", title: "Exception Handling with try, except, finally", minutes: 30 },
          { id: "prog-5-3", title: "Linear Search and Binary Search Implementations", minutes: 35 },
          { id: "prog-5-4", title: "Bubble Sort Algorithm & Time Complexity Basics", minutes: 35 },
        ],
      },
    ],
  },
];

export const allTopics = subjects.flatMap((s) =>
  s.units.flatMap((u) => u.topics),
);

export const findSubject = (id: string) => subjects.find((s) => s.id === id);
