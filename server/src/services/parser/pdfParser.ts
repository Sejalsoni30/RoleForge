import fs from 'fs';
import pdfParse from 'pdf-parse';
import { runOCR } from './ocrParser';

export const parsePdf = async (filePath: string): Promise<string> => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    const text = data.text ? data.text.trim() : '';

    // If PDF contains less than 50 characters, it might be a scanned document image
    if (text.length < 50) {
      console.log('[PDF Parser] Extracted text length < 50, triggering OCR fallback...');
      const ocrText = await runOCR(filePath);
      return ocrText.trim() || text;
    }

    return text;
  } catch (error) {
    console.error('[PDF Parser Error]:', error);
    // Attempt OCR fallback if pdf-parse fails
    try {
      return await runOCR(filePath);
    } catch {
      throw new Error('Failed to parse PDF document. The file may be corrupt or encrypted.');
    }
  }
};

