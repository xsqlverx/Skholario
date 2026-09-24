import {
  ExtractedDocument,
  ExtractedPage,
  ExtractionProgressCallback,
  IngestionError,
} from "./types";

interface TextItemWithCoords {
  str: string;
  x: number;
  y: number;
  height: number;
}

export async function extractPdfDocument(
  source: File | ArrayBuffer | Uint8Array,
  fileName = "syllabus.pdf",
  onProgress?: ExtractionProgressCallback,
): Promise<ExtractedDocument> {
  let arrayBuffer: ArrayBuffer;
  let fileSize = 0;

  if (typeof File !== "undefined" && source instanceof File) {
    fileSize = source.size;
    fileName = source.name || fileName;
    arrayBuffer = await source.arrayBuffer();
  } else if (source instanceof ArrayBuffer) {
    fileSize = source.byteLength;
    arrayBuffer = source;
  } else if (ArrayBuffer.isView(source)) {
    fileSize = source.byteLength;
    arrayBuffer = source.buffer.slice(
      source.byteOffset,
      source.byteOffset + source.byteLength,
    ) as ArrayBuffer;
  } else {
    throw new IngestionError(
      "MALFORMED_PDF",
      "Unsupported input format for PDF extraction.",
    );
  }

  if (fileSize === 0) {
    throw new IngestionError(
      "EMPTY_DOCUMENT",
      "The selected file is empty (0 bytes).",
    );
  }

  try {
    const pdfjs = await import("pdfjs-dist");

    if (typeof window !== "undefined" && !pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    }

    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
      isEvalSupported: false,
    });

    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages;

    if (totalPages === 0) {
      throw new IngestionError(
        "EMPTY_DOCUMENT",
        "PDF contains no pages.",
      );
    }

    const pages: ExtractedPage[] = [];
    let totalExtractedLength = 0;

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      onProgress?.(pageNum, totalPages);

      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      const rawItems: TextItemWithCoords[] = [];

      for (const item of textContent.items) {
        if ("str" in item && typeof item.str === "string") {
          const str = item.str.trim();
          if (str.length > 0) {
            const transform = item.transform;
            rawItems.push({
              str: item.str,
              x: transform[4],
              y: transform[5],
              height: item.height || 12,
            });
          }
        }
      }

      // Group items into lines based on Y coordinate proximity (within 3.5 points)
      // Sort items: Y descending (top to bottom), X ascending (left to right)
      rawItems.sort((a, b) => {
        const yDiff = b.y - a.y;
        if (Math.abs(yDiff) > 3.5) {
          return yDiff;
        }
        return a.x - b.x;
      });

      const lineGroups: string[][] = [];
      let currentLineY: number | null = null;
      let currentLine: string[] = [];

      for (const item of rawItems) {
        if (currentLineY === null || Math.abs(item.y - currentLineY) <= 3.5) {
          currentLine.push(item.str);
          if (currentLineY === null) currentLineY = item.y;
        } else {
          if (currentLine.length > 0) {
            lineGroups.push(currentLine);
          }
          currentLine = [item.str];
          currentLineY = item.y;
        }
      }
      if (currentLine.length > 0) {
        lineGroups.push(currentLine);
      }

      const formattedLines = lineGroups
        .map((words) => words.join(" ").replace(/\s+/g, " ").trim())
        .filter((l) => l.length > 0);

      const pageText = formattedLines.join("\n");
      totalExtractedLength += pageText.trim().length;

      pages.push({
        pageNumber: pageNum,
        text: pageText,
        lines: formattedLines,
      });
    }

    // Handle scanned/image-only PDFs where no text could be extracted
    if (totalExtractedLength < 25) {
      throw new IngestionError(
        "NO_EXTRACTABLE_TEXT",
        "This PDF appears to be a scanned image or contains no readable text. Skholario requires text-based syllabus PDFs to parse your curriculum.",
      );
    }

    return {
      fileName,
      fileSize,
      totalPages,
      pages,
    };
  } catch (err: unknown) {
    if (err instanceof IngestionError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : String(err);
    throw new IngestionError(
      "MALFORMED_PDF",
      `Unable to parse PDF locally: ${message}`,
      message,
    );
  }
}
