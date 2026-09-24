export interface ExtractedPage {
  pageNumber: number;
  text: string;
  lines: string[];
}

export interface ExtractedDocument {
  fileName: string;
  fileSize: number;
  totalPages: number;
  pages: ExtractedPage[];
}

export type ExtractionProgressCallback = (current: number, total: number) => void;

export interface ParsedTopic {
  id: string;
  title: string;
  order: number;
  sourcePages: number[];
  description?: string;
}

export interface ParsedModule {
  id: string;
  title: string;
  order: number;
  sourcePages: number[];
  topics: ParsedTopic[];
}

export type ParsingConfidence = "high" | "medium" | "low";

export interface ParsedCurriculum {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  shortName: string;
  semester?: string;
  credits?: number;
  teachingHours?: number;
  modules: ParsedModule[];
  confidence: ParsingConfidence;
  confidenceScore: number; // 0.0 - 1.0
  warnings: string[];
  extractedAt: string;
  fileName: string;
}

export type IngestionErrorCode =
  | "NO_EXTRACTABLE_TEXT"
  | "MALFORMED_PDF"
  | "EMPTY_DOCUMENT"
  | "NO_MODULES_FOUND"
  | "LOW_CONFIDENCE";

export class IngestionError extends Error {
  code: IngestionErrorCode;
  details?: string;

  constructor(code: IngestionErrorCode, message: string, details?: string) {
    super(message);
    this.name = "IngestionError";
    this.code = code;
    this.details = details;
  }
}
