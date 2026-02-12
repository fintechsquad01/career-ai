/**
 * Client-side file text extraction.
 * For PDF and DOCX, we extract text on the client using basic methods.
 * For full parsing, files are sent to the server/Edge Function.
 */

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

  // PDF files - extract text client-side using basic method
  if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
    const text = await extractPdfText(file);
    return { text, fileName, fileType: "application/pdf" };
  }

  // DOCX files - extract text client-side
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
  // Basic PDF text extraction using the browser
  // Read the raw bytes and extract text between stream markers
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);

  // Try to extract readable text content from PDF
  const textParts: string[] = [];
  const streamRegex = /stream\s*\n([\s\S]*?)\nendstream/g;
  let match;
  while ((match = streamRegex.exec(text)) !== null) {
    const content = match[1];
    // Filter to only printable ASCII
    const readable = content.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ").trim();
    if (readable.length > 20) {
      textParts.push(readable);
    }
  }

  if (textParts.length > 0) {
    return textParts.join("\n");
  }

  // Fallback: extract any readable text
  const readable = text.replace(/[^\x20-\x7E\n\r\t]/g, "").replace(/\s+/g, " ").trim();
  if (readable.length > 50) {
    return readable.slice(0, 10000);
  }

  throw new Error("Could not extract text from PDF. Please paste the text directly.");
}

async function extractDocxText(file: File): Promise<string> {
  // DOCX is a zip file with XML inside
  // We use a basic approach: read the document.xml from the zip
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Find the document.xml content in the zip
  const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);

  // Extract text from XML tags
  const xmlContent = text.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
  if (xmlContent) {
    return xmlContent
      .map((tag) => tag.replace(/<[^>]+>/g, ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }

  throw new Error("Could not extract text from DOCX. Please paste the text directly.");
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
