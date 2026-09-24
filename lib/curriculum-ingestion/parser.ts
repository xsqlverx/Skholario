import {
  ExtractedDocument,
  ExtractedPage,
  IngestionError,
  ParsedCurriculum,
  ParsedModule,
  ParsedTopic,
  ParsingConfidence,
} from "./types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function romanToInt(roman: string): number {
  const map: Record<string, number> = {
    i: 1,
    ii: 2,
    iii: 3,
    iv: 4,
    v: 5,
    vi: 6,
    vii: 7,
    viii: 8,
    ix: 9,
    x: 10,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
  };
  const lower = roman.toLowerCase().trim();
  if (map[lower]) return map[lower];
  const num = parseInt(lower, 10);
  return isNaN(num) ? 1 : num;
}

const MODULE_HEADER_REGEX =
  /^(?:MODULE|UNIT)\s*([0-9IVXLCDM]+|ONE|TWO|THREE|FOUR|FIVE|SIX)[\s:\-–—]*(.*)$/i;

const NUMBERED_HEADING_REGEX = /^([1-6])\.\s+([A-Z][A-Za-z\s&,/-]{3,60})$/;

const BOILERPLATE_PATTERNS = [
  /^(?:TEXT\s*BOOKS?|REFERENCES?|REFERENCE\s*BOOKS?|SUGGESTED\s*READINGS?)/i,
  /^(?:COURSE\s*OUTCOMES?|CO[-–—\s]*PO\s*MAPPING|PROGRAM\s*OUTCOMES?)/i,
  /^(?:ASSESSMENT\s*PATTERN|CONTINUOUS\s*INTERNAL\s*EVALUATION|MARK\s*DISTRIBUTION)/i,
  /^(?:QUESTION\s*PAPER\s*PATTERN|MODEL\s*QUESTION\s*PAPER|SAMPLE\s*QUESTIONS?)/i,
];

interface RawModule {
  order: number;
  title: string;
  sourcePages: Set<number>;
  contentLines: { text: string; pageNumber: number }[];
}

export function parseCurriculum(doc: ExtractedDocument): ParsedCurriculum {
  if (!doc || !doc.pages || doc.pages.length === 0) {
    throw new IngestionError(
      "EMPTY_DOCUMENT",
      "Document contains no readable pages.",
    );
  }

  const warnings: string[] = [];

  // 1. Extract Subject Code, Name, and Course Metadata
  const { code, name, semester, credits, teachingHours } = extractSubjectMetadata(
    doc.pages,
    doc.fileName,
  );

  if (!code) {
    warnings.push("Could not confidently detect university course code.");
  }

  // 2. Detect Modules and their raw text content across pages
  const rawModules = extractRawModules(doc.pages);

  if (rawModules.length === 0) {
    throw new IngestionError(
      "NO_MODULES_FOUND",
      "Could not detect any curriculum modules or units in this PDF. Verify the document contains 'Module' or 'Unit' headings.",
    );
  }

  // 3. Process each module to extract structured topics
  const subjectSlug = slugify(code || name || "syllabus");
  const modules: ParsedModule[] = [];

  for (let mIdx = 0; mIdx < rawModules.length; mIdx++) {
    const raw = rawModules[mIdx];
    const moduleOrder = mIdx + 1;
    const moduleId = `${subjectSlug}-unit-${moduleOrder}`;

    const parsedTopics = extractTopicsFromModule(
      raw.contentLines,
      subjectSlug,
      moduleOrder,
    );

    if (parsedTopics.length === 0) {
      warnings.push(`Module ${moduleOrder} ("${raw.title}") has no extractable topics.`);
    }

    modules.push({
      id: moduleId,
      title: raw.title || `Module ${moduleOrder}`,
      order: moduleOrder,
      sourcePages: Array.from(raw.sourcePages).sort((a, b) => a - b),
      topics: parsedTopics,
    });
  }

  // 4. Calculate Confidence Score
  let confidenceScore = 1.0;

  if (!code) confidenceScore -= 0.15;
  if (modules.length < 3) {
    confidenceScore -= 0.25;
    warnings.push(`Only found ${modules.length} modules (expected 4–6).`);
  }
  const emptyTopicModules = modules.filter((m) => m.topics.length === 0);
  if (emptyTopicModules.length > 0) {
    confidenceScore -= 0.2 * emptyTopicModules.length;
  }
  const totalTopics = modules.reduce((sum, m) => sum + m.topics.length, 0);
  if (totalTopics < 5) {
    confidenceScore -= 0.25;
    warnings.push("Very few syllabus topics detected.");
  }

  confidenceScore = Math.max(0.1, Math.min(1.0, confidenceScore));

  let confidence: ParsingConfidence = "high";
  if (confidenceScore < 0.5) confidence = "low";
  else if (confidenceScore < 0.75) confidence = "medium";

  // Short display name (e.g. "Python Programming" or "Electrical Engineering")
  const shortName = deriveShortName(name, code);

  return {
    subjectId: subjectSlug,
    subjectCode: code || "CUSTOM",
    subjectName: name || "Custom Syllabus Course",
    shortName,
    semester,
    credits,
    teachingHours,
    modules,
    confidence,
    confidenceScore: Math.round(confidenceScore * 100) / 100,
    warnings,
    extractedAt: new Date().toISOString(),
    fileName: doc.fileName,
  };
}

function extractSubjectMetadata(pages: ExtractedPage[], fileName: string) {
  let code = "";
  let name = "";
  let semester: string | undefined;
  let credits: number | undefined;
  let teachingHours: number | undefined;

  // Search first 2 pages for metadata
  const initialPages = pages.slice(0, 2);
  const allLines = initialPages.flatMap((p) => p.lines);

  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];

    // Course Code
    if (!code) {
      const codeMatch =
        line.match(/(?:Course\s*Code|Subject\s*Code|Code)[:\s]*([A-Z]{2,4}\s*\d{3}[A-Z]?)/i) ||
        line.match(/\b([A-Z]{2,4}\s*\d{3}[A-Z]?)\b/);
      if (codeMatch) {
        code = codeMatch[1].replace(/\s+/g, "").toUpperCase();
      }
    }

    // Course Name / Title
    if (!name) {
      const nameMatch = line.match(
        /(?:Course\s*Name|Subject\s*Name|Course\s*Title)[:\s]*([^\n\r]+)/i,
      );
      if (nameMatch) {
        name = cleanTitle(nameMatch[1]);
      } else if (
        i > 0 &&
        allLines[i - 1].match(/Course\s*Name/i) &&
        line.trim().length > 3
      ) {
        name = cleanTitle(line);
      }
    }

    // Semester
    if (!semester) {
      const semMatch =
        line.match(/(?:Semester|Sem)[:\s]*([I|V|X|\d]+)/i) ||
        line.match(/\b(FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|SEVENTH|EIGHTH)\s+SEMESTER\b/i);
      if (semMatch) {
        semester = semMatch[1].toUpperCase();
      }
    }

    // Credits
    if (!credits) {
      const credMatch = line.match(/(?:Credits|Credit)[:\s]*(\d+)/i);
      if (credMatch) {
        credits = parseInt(credMatch[1], 10);
      }
    }

    // Teaching Hours
    if (!teachingHours) {
      const hoursMatch = line.match(/(?:Hours|Teaching\s*Hours|L-T-P)[:\s]*(\d+)/i);
      if (hoursMatch) {
        teachingHours = parseInt(hoursMatch[1], 10);
      }
    }
  }

  // Fallback: If no name found, look for prominent uppercase lines on page 1
  if (!name && pages[0]) {
    for (const l of pages[0].lines) {
      if (
        l.length > 5 &&
        l.length < 60 &&
        l === l.toUpperCase() &&
        !l.includes("UNIVERSITY") &&
        !l.includes("EXAMINATION") &&
        !l.includes("DEGREE") &&
        !l.includes("SYLLABUS")
      ) {
        name = cleanTitle(l);
        break;
      }
    }
  }

  // Fallback name from file name
  if (!name) {
    name = fileName
      .replace(/\.pdf$/i, "")
      .replace(/[-_]+/g, " ")
      .replace(/\bsyllabus\b/gi, "")
      .trim();
    if (name.length > 0) {
      name = name
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    }
  }

  return { code, name, semester, credits, teachingHours };
}

function extractRawModules(pages: ExtractedPage[]): RawModule[] {
  const rawModules: RawModule[] = [];
  let currentModule: RawModule | null = null;
  let insideBoilerplate = false;

  for (const page of pages) {
    for (let lineIdx = 0; lineIdx < page.lines.length; lineIdx++) {
      const line = page.lines[lineIdx].trim();
      if (!line) continue;

      // Check if we hit boilerplate section (Text Books, References, etc.)
      const isBoilerplate = BOILERPLATE_PATTERNS.some((pat) => pat.test(line));
      if (isBoilerplate) {
        if (currentModule) {
          rawModules.push(currentModule);
          currentModule = null;
        }
        insideBoilerplate = true;
        continue;
      }

      // Check for Module Header
      const moduleMatch = line.match(MODULE_HEADER_REGEX);
      const numberedMatch = !moduleMatch ? line.match(NUMBERED_HEADING_REGEX) : null;

      if (moduleMatch || numberedMatch) {
        // We found a new module header!
        insideBoilerplate = false;
        if (currentModule) {
          rawModules.push(currentModule);
        }

        let order = rawModules.length + 1;
        let title = "";
        let pendingContentText = "";

        if (moduleMatch) {
          order = romanToInt(moduleMatch[1]);
          title = cleanTitle(moduleMatch[2]);
        } else if (numberedMatch) {
          order = parseInt(numberedMatch[1], 10);
          title = cleanTitle(numberedMatch[2]);
        }

        if (title.includes(":")) {
          const colonIdx = title.indexOf(":");
          pendingContentText = title.slice(colonIdx + 1).trim();
          title = cleanTitle(title.slice(0, colonIdx));
        }

        // If title was on next line (e.g. "MODULE 1" then next line "DC Circuits: ...")
        if (!title && lineIdx + 1 < page.lines.length) {
          const nextLine = page.lines[lineIdx + 1].trim();
          if (
            nextLine &&
            !nextLine.match(MODULE_HEADER_REGEX) &&
            !BOILERPLATE_PATTERNS.some((p) => p.test(nextLine))
          ) {
            if (nextLine.includes(":")) {
              const colonIdx = nextLine.indexOf(":");
              title = cleanTitle(nextLine.slice(0, colonIdx));
              pendingContentText = nextLine.slice(colonIdx + 1).trim();
              lineIdx++;
            } else if (nextLine.length < 50) {
              title = cleanTitle(nextLine);
              lineIdx++;
            }
          }
        }

        currentModule = {
          order: order || rawModules.length + 1,
          title: title || `Module ${order || rawModules.length + 1}`,
          sourcePages: new Set([page.pageNumber]),
          contentLines: [],
        };

        if (pendingContentText) {
          currentModule.contentLines.push({
            text: pendingContentText,
            pageNumber: page.pageNumber,
          });
        }
        continue;
      }

      // If we are inside an active module and not in boilerplate, collect line
      if (currentModule && !insideBoilerplate) {
        currentModule.sourcePages.add(page.pageNumber);
        currentModule.contentLines.push({
          text: line,
          pageNumber: page.pageNumber,
        });
      }
    }
  }

  if (currentModule) {
    rawModules.push(currentModule);
  }

  // Sort raw modules by order
  rawModules.sort((a, b) => a.order - b.order);
  return rawModules;
}

function extractTopicsFromModule(
  contentLines: { text: string; pageNumber: number }[],
  subjectSlug: string,
  moduleOrder: number,
): ParsedTopic[] {
  const topics: ParsedTopic[] = [];
  const seenTitles = new Set<string>();

  // Consolidate lines into candidate topic chunks
  for (const item of contentLines) {
    const rawLine = item.text.trim();
    if (!rawLine) continue;

    // Split compound lines by clauses: e.g. "Ohm's Law, Kirchhoff's Laws; Mesh analysis"
    // or numbered sub-points: "1.1 Selection statements: if, if-else. 1.2 Iterations."
    const candidates = splitLineIntoTopicCandidates(rawLine);

    for (const candidate of candidates) {
      const cleaned = cleanTopicTitle(candidate);
      if (isValidTopic(cleaned) && !seenTitles.has(cleaned.toLowerCase())) {
        seenTitles.add(cleaned.toLowerCase());
        const topicOrder = topics.length + 1;
        topics.push({
          id: `${subjectSlug}-u${moduleOrder}-t${topicOrder}`,
          title: cleaned,
          order: topicOrder,
          sourcePages: [item.pageNumber],
        });
      }
    }
  }

  return topics;
}

function splitLineIntoTopicCandidates(line: string): string[] {
  // If line contains numbered subtopics like "1.1 Basics 1.2 Functions"
  if (/\b\d+\.\d+\s+/.test(line)) {
    return line.split(/(?=\b\d+\.\d+\s+)/).map((s) => s.replace(/^\d+\.\d+\s+/, ""));
  }

  // If line contains bullet points
  if (/[•·–—]\s*/.test(line)) {
    return line.split(/[•·–—]\s*/).filter(Boolean);
  }

  // If line contains semicolon separated items
  if (line.includes(";")) {
    return line.split(";").map((s) => s.trim()).filter(Boolean);
  }

  // Split on sentences (. followed by space or end)
  const sentences = line.split(/\.\s+/).map((s) => s.trim()).filter(Boolean);
  const candidates: string[] = [];

  for (const sentence of sentences) {
    if (sentence.includes(":") && !sentence.startsWith("http")) {
      const parts = sentence.split(":");
      candidates.push(parts[0].trim());
      const rest = parts.slice(1).join(":").trim();
      const sub = rest.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
      candidates.push(...sub);
    } else if (sentence.includes(",") && sentence.length > 30) {
      const sub = sentence.split(",").map((s) => s.trim()).filter(Boolean);
      candidates.push(...sub);
    } else if (/\band\b/i.test(sentence) && sentence.length > 25 && !sentence.includes(",")) {
      const sub = sentence.split(/\s+and\s+/i).map((s) => s.trim()).filter(Boolean);
      candidates.push(...sub);
    } else {
      candidates.push(sentence);
    }
  }

  return candidates;
}

function cleanTitle(title: string): string {
  return title
    .replace(/^[\s:\-–—]+|[\s:\-–—]+$/g, "")
    .replace(/\s+/g, " ")
    .replace(/\b(Hours|Hrs|\d+\s*Hours)\b/gi, "")
    .trim();
}

function cleanTopicTitle(text: string): string {
  let t = text.trim();
  // Remove leading numbers, bullets, dashes
  t = t.replace(/^[\d.)\s•·–—\-]+/, "");
  // Remove trailing dots, commas, dashes, colons
  t = t.replace(/[.,:;\-–—]+$/, "");
  // Remove trailing hour tags e.g. "(7 hours)"
  t = t.replace(/\(\s*\d+\s*(?:hrs?|hours?)\s*\)/gi, "");
  t = t.replace(/\s+/g, " ").trim();
  // Capitalize first character
  if (t.length > 0) {
    t = t.charAt(0).toUpperCase() + t.slice(1);
  }
  return t;
}

function isValidTopic(title: string): boolean {
  if (title.length < 3 || title.length > 120) return false;
  // Ignore page numbers or numbers only
  if (/^\d+$/.test(title)) return false;
  // Ignore header watermarks
  if (/^(?:page\s*\d+|ktu|b\.?tech|syllabus|semester)/i.test(title)) return false;
  // Ignore book/author lines
  if (/^(?:vol|isbn|edition|author|publisher)/i.test(title)) return false;
  return true;
}

function deriveShortName(fullName: string, code: string): string {
  if (!fullName) return code || "Course";

  // Common KTU simplifications
  if (/algorithmic\s*thinking/i.test(fullName)) return "Algorithmic Thinking";
  if (/electrical\s*and\s*electronics/i.test(fullName)) return "Electrical & Electronics";
  if (/calculus|differential\s*equations/i.test(fullName)) return "Mathematics";
  if (/engineering\s*physics/i.test(fullName)) return "Engineering Physics";
  if (/engineering\s*chemistry/i.test(fullName)) return "Engineering Chemistry";
  if (/engineering\s*mechanics/i.test(fullName)) return "Engineering Mechanics";
  if (/engineering\s*graphics/i.test(fullName)) return "Engineering Graphics";
  if (/programming\s*in\s*c/i.test(fullName)) return "Programming in C";

  // Clean long title to a readable short form
  const words = fullName.split(" ");
  if (words.length > 4) {
    return words.slice(0, 3).join(" ");
  }
  return fullName;
}
