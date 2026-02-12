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
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  return pdfjsLib;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export type FileParseResult = {
  text: string;
  fileName: string;
  fileType: string;
};

export async function parseFile(file: File): Promise<FileParseResult> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is 5MB.`);
  }

  const fileName = file.name;
  const fileType = file.type;

  // Plain text files
  if (fileType === "text/plain" || fileName.endsWith(".txt")) {
    const text = await file.text();
    return { text, fileName, fileType };
  }

  // PDF files
  if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
    const text = await extractPdfText(file);
    return { text, fileName, fileType: "application/pdf" };
  }

  // DOCX files
  if (
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.endsWith(".docx")
  ) {
    const text = await extractDocxText(file);
    return { text, fileName, fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
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
      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      if (pageText.trim()) {
        textParts.push(pageText);
      }
    }

    if (textParts.length === 0) {
      throw new Error("No text content found in PDF.");
    }

    return textParts.join("\n\n");
  } catch (err) {
    if (err instanceof Error && err.message.includes("No text content")) {
      throw err;
    }
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

    return textParts.join("\n");
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
