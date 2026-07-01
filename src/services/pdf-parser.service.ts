import { PDFParse } from 'pdf-parse';
import { ParsingError } from '../core/errors';

export class PdfParserService {
  /**
   * Parses a PDF buffer and extracts plain text using pdf-parse v2.
   * Throws ParsingError if parsing fails or text is empty.
   */
  public static async parsePdf(buffer: Buffer): Promise<string> {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      const text = result?.text?.trim();
      if (!text) {
        throw new ParsingError('Failed to extract text from PDF; parsed document is empty.');
      }
      return text;
    } catch (error) {
      if (error instanceof ParsingError) {
        throw error;
      }
      throw new ParsingError(`PDF Parsing failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      try {
        await parser.destroy();
      } catch (err) {
        console.warn('Failed to destroy PDFParse instance:', err);
      }
    }
  }
}

