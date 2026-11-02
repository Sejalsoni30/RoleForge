import path from 'path';
import { parsePdf } from './pdfParser';
import { parseDocx } from './docxParser';
import { removeTempFile } from '../../middleware/upload';

export interface ParseResult {
  text: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
}

export const parseResumeDocument = async (file: Express.Multer.File): Promise<ParseResult> => {
  const filePath = file.path;
  const ext = path.extname(file.originalname).toLowerCase();
  let extractedText = '';

  try {
    if (ext === '.pdf' || file.mimetype === 'application/pdf') {
      extractedText = await parsePdf(filePath);
    } else if (
      ext === '.docx' ||
      ext === '.doc' ||
      file.mimetype.includes('wordprocessingml') ||
      file.mimetype.includes('msword')
    ) {
      extractedText = await parseDocx(filePath);
    } else {
      throw new Error(`Unsupported file type extension: ${ext}`);
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('Could not extract readable text from document.');
    }

    return {
      text: extractedText,
      originalFileName: file.originalname,
      fileType: ext.replace('.', ''),
      fileSize: file.size,
    };
  } finally {
    // Prime directive & engineering rules: "delete temp files after processing"
    removeTempFile(filePath);
  }
};

