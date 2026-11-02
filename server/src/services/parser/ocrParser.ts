import { createWorker } from 'tesseract.js';

export const runOCR = async (filePath: string): Promise<string> => {
  let worker: any = null;
  try {
    worker = await createWorker('eng');
    const ret = await worker.recognize(filePath);
    return ret.data.text || '';
  } catch (error) {
    console.error('[OCR Parser Error]:', error);
    return '';
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
};

