/**
 * Client-side file text extraction.
 * Uses pdfjs-dist for PDFs and JSZip for DOCX files.
 * pdfjs-dist is loaded dynamically to avoid SSR crashes (DOMMatrix not available in Node).
 */

import JSZip from "jszip";

let pdfjsLib: typeof import("pdfjs-dist") | null = null;

async function getPdfJs() {
  if (pdfjsLib) return pdfjsLib;
  if (typeof window === "undefined") {
    throw new Error("PDF parsing is only available in the browser.");
  }
  pdfjsLib = await import("pdfjs-dist");
  // Use locally bundled worker instead of CDN to avoid network dependency
  pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
  return pdfjsLib;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_RESUME_WORDS = 50; // Below this, extraction is too weak for reliable tool output

export type ParseQuality = "good" | "partial" | "failed";

export type FileParseResult = {
  text: string;
  fileName: string;
  fileType: string;
  wordCount: number;
  quality: ParseQuality;
};

function sanitizeText(text: string): string {
  return text
    .replace(/\u0000/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function getWordBucket(wordCount: number): string {
  if (wordCount < MIN_RESUME_WORDS) return "<50";
  if (wordCount < 150) return "50-149";
  if (wordCount < 300) return "150-299";
  return "300+";
}

function logParseDiagnostics(fileName: string, fileType: string, wordCount: number, quality: ParseQuality): void {
  // Keep logs privacy-safe: no raw extracted text.
  console.info("[ResumeParser]", {
    file_name: fileName,
    file_type: fileType,
    word_bucket: getWordBucket(wordCount),
    quality,
  });
}

export function getParseQuality(wordCount: number): ParseQuality {
  if (wordCount >= 200) return "good";
  if (wordCount >= MIN_RESUME_WORDS) return "partial";
  return "failed";
}

export async function parseFile(file: File): Promise<FileParseResult> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is 5MB.`);
  }

  const fileName = file.name;
  const fileType = file.type;

  // Plain text files
  if (fileType === "text/plain" || fileName.endsWith(".txt")) {
    const text = sanitizeText(await file.text());
    const wc = countWords(text);
    const quality = getParseQuality(wc);
    logParseDiagnostics(fileName, fileType || "text/plain", wc, quality);
    return { text, fileName, fileType, wordCount: wc, quality };
  }

  // PDF files
  if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
    const text = await extractPdfText(file);
    const wc = countWords(text);
    const quality = getParseQuality(wc);
    logParseDiagnostics(fileName, "application/pdf", wc, quality);
    return { text, fileName, fileType: "application/pdf", wordCount: wc, quality };
  }

  // DOCX files
  if (
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.endsWith(".docx")
  ) {
    const text = await extractDocxText(file);
    const wc = countWords(text);
    const quality = getParseQuality(wc);
    logParseDiagnostics(
      fileName,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      wc,
      quality
    );
    return { text, fileName, fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", wordCount: wc, quality };
  }

  throw new Error(`Unsupported file type: ${fileType || fileName}`);
}

async function extractPdfText(file: File): Promise<string> {
  try {
    const pdfjs = await getPdfJs();
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: buffer }).promise;
    const textParts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      // Build text with line-break detection using Y-coordinate positions
      let lastY: number | null = null;
      const lineParts: string[] = [];

      for (const item of content.items) {
        if (!("str" in item) || !item.str) continue;

        const currentY = "transform" in item ? (item.transform as number[])[5] : null;

        if (lastY !== null && currentY !== null) {
          const yDiff = Math.abs(lastY - currentY);
          if (yDiff > 3) {
            // Different line — add a newline
            lineParts.push("\n");
          } else if (lineParts.length > 0) {
            // Same line, add space separator if needed
            const lastPart = lineParts[lineParts.length - 1];
            if (lastPart && !lastPart.endsWith(" ") && !item.str.startsWith(" ")) {
              lineParts.push(" ");
            }
          }
        }

        lineParts.push(item.str);
        lastY = currentY;
      }

      const pageText = lineParts.join("").trim();
      if (pageText) {
        textParts.push(pageText);
      }
    }

    if (textParts.length === 0) {
      throw new Error(
        "No text content found in PDF. The file may be image-based or scanned. Please paste your resume text directly."
      );
    }

    const fullText = sanitizeText(textParts.join("\n\n"));
    const wordCount = countWords(fullText);

    if (wordCount < MIN_RESUME_WORDS) {
      throw new Error(
        `Only ${wordCount} words extracted from the PDF. This is too little for reliable analysis. Please paste your full resume text directly.`
      );
    }

    return fullText;
  } catch (err) {
    if (err instanceof Error && (err.message.includes("No text content") || err.message.includes("words extracted"))) {
      throw err;
    }
    console.error("PDF extraction error:", err);
    throw new Error("Could not extract text from PDF. Please paste the text directly.");
  }
}

async function extractDocxText(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);
    const docXml = zip.file("word/document.xml");

    if (!docXml) {
      throw new Error("Invalid DOCX: missing document.xml");
    }

    const xmlContent = await docXml.async("string");

    // Parse XML to extract text from <w:t> tags
    const textParts: string[] = [];
    // Match paragraph boundaries for better formatting
    const paragraphs = xmlContent.split(/<\/w:p>/);

    for (const para of paragraphs) {
      const textMatches = para.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
      if (textMatches) {
        const paraText = textMatches
          .map((tag) => tag.replace(/<[^>]+>/g, ""))
          .join("");
        if (paraText.trim()) {
          textParts.push(paraText);
        }
      }
    }

    if (textParts.length === 0) {
      throw new Error("No text content found in DOCX.");
    }

    const fullText = sanitizeText(textParts.join("\n"));
    const wordCount = countWords(fullText);
    if (wordCount < MIN_RESUME_WORDS) {
      throw new Error(
        `Only ${wordCount} words extracted from the DOCX. This is too little for reliable analysis. Please paste your full resume text directly.`
      );
    }
    return fullText;
  } catch (err) {
    if (err instanceof Error && (err.message.includes("No text content") || err.message.includes("Invalid DOCX"))) {
      throw err;
    }
    throw new Error("Could not extract text from DOCX. Please paste the text directly.");
  }
}

export function isResumeFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".pdf") ||
    name.endsWith(".docx") ||
    name.endsWith(".doc") ||
    name.endsWith(".txt")
  );
}
