import mammoth from 'mammoth';

export const parseDocx = async (filePath: string): Promise<string> => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value ? result.value.trim() : '';
  } catch (error) {
    console.error('[DOCX Parser Error]:', error);
    throw new Error('Failed to parse DOCX document. Please ensure it is a valid Word file.');
  }
};

