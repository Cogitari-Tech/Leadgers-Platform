import { describe, it, expect } from "vitest";
import { validateUploadedFile } from "../../middleware/file-upload";

describe("File Upload Validation Tests (OWASP A01/A05)", () => {
  // Real magic bytes for common file types
  const PDF_MAGIC = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e]);
  const PNG_MAGIC = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);
  const JPEG_MAGIC = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
  const ZIP_MAGIC = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
  const EXE_MAGIC = new Uint8Array([0x4d, 0x5a]); // MZ header

  describe("Layer 1: Extension Allowlist", () => {
    it("should reject .exe files", () => {
      const result = validateUploadedFile(
        "malware.exe",
        "application/pdf",
        PDF_MAGIC,
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain("extension");
    });

    it("should reject .bat files", () => {
      const result = validateUploadedFile(
        "script.bat",
        "text/plain",
        new Uint8Array([0x40]),
      );
      expect(result.valid).toBe(false);
    });

    it("should reject .sh files", () => {
      const result = validateUploadedFile(
        "hack.sh",
        "text/plain",
        new Uint8Array([0x23]),
      );
      expect(result.valid).toBe(false);
    });

    it("should reject files without extension", () => {
      const result = validateUploadedFile(
        "noextension",
        "application/pdf",
        PDF_MAGIC,
      );
      expect(result.valid).toBe(false);
    });

    it("should reject double extension tricks (.pdf.exe)", () => {
      const result = validateUploadedFile(
        "report.pdf.exe",
        "application/pdf",
        PDF_MAGIC,
      );
      expect(result.valid).toBe(false);
    });

    it("should accept .pdf files", () => {
      const result = validateUploadedFile(
        "report.pdf",
        "application/pdf",
        PDF_MAGIC,
      );
      expect(result.valid).toBe(true);
    });

    it("should accept .png files", () => {
      const result = validateUploadedFile("image.png", "image/png", PNG_MAGIC);
      expect(result.valid).toBe(true);
    });
  });

  describe("Layer 2: MIME Type Allowlist", () => {
    it("should reject application/x-executable MIME", () => {
      const result = validateUploadedFile(
        "file.pdf",
        "application/x-executable",
        PDF_MAGIC,
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain("MIME type");
    });

    it("should reject application/x-msdos-program MIME", () => {
      const result = validateUploadedFile(
        "file.pdf",
        "application/x-msdos-program",
        PDF_MAGIC,
      );
      expect(result.valid).toBe(false);
    });

    it("should reject text/javascript MIME", () => {
      const result = validateUploadedFile(
        "file.txt",
        "text/javascript",
        new Uint8Array([0x0a]),
      );
      expect(result.valid).toBe(false);
    });
  });

  describe("Layer 3: File Size", () => {
    it("should reject files exceeding 10MB", () => {
      const hugeBuffer = new Uint8Array(11_000_000);
      hugeBuffer[0] = 0x25;
      hugeBuffer[1] = 0x50;
      hugeBuffer[2] = 0x44;
      hugeBuffer[3] = 0x46;

      const result = validateUploadedFile(
        "huge.pdf",
        "application/pdf",
        hugeBuffer,
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain("size");
    });
  });

  describe("Layer 4: Magic Bytes Verification", () => {
    it("should detect EXE disguised as PDF (extension spoofing)", () => {
      const result = validateUploadedFile(
        "trojan.pdf",
        "application/pdf",
        EXE_MAGIC,
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain("content does not match");
    });

    it("should detect EXE disguised as PNG", () => {
      const result = validateUploadedFile(
        "stealth.png",
        "image/png",
        EXE_MAGIC,
      );
      expect(result.valid).toBe(false);
    });

    it("should detect ZIP disguised as JPEG", () => {
      const result = validateUploadedFile(
        "packed.jpg",
        "image/jpeg",
        ZIP_MAGIC,
      );
      expect(result.valid).toBe(false);
    });

    it("should accept valid PDF with correct magic bytes", () => {
      const result = validateUploadedFile(
        "legit.pdf",
        "application/pdf",
        PDF_MAGIC,
      );
      expect(result.valid).toBe(true);
    });

    it("should accept valid PNG with correct magic bytes", () => {
      const result = validateUploadedFile("legit.png", "image/png", PNG_MAGIC);
      expect(result.valid).toBe(true);
    });

    it("should accept valid JPEG with correct magic bytes", () => {
      const result = validateUploadedFile(
        "photo.jpg",
        "image/jpeg",
        JPEG_MAGIC,
      );
      expect(result.valid).toBe(true);
    });

    it("should accept valid XLSX (ZIP-based) with correct magic bytes", () => {
      const result = validateUploadedFile(
        "data.xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ZIP_MAGIC,
      );
      expect(result.valid).toBe(true);
    });
  });

  describe("Polyglot File Detection", () => {
    it("should reject a file that starts with JPEG magic but claims to be PDF", () => {
      const result = validateUploadedFile(
        "polyglot.pdf",
        "application/pdf",
        JPEG_MAGIC,
      );
      expect(result.valid).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty file buffer", () => {
      const result = validateUploadedFile(
        "empty.pdf",
        "application/pdf",
        new Uint8Array(0),
      );
      expect(result.valid).toBe(false);
    });

    it("should handle very small file (1 byte)", () => {
      const result = validateUploadedFile(
        "tiny.pdf",
        "application/pdf",
        new Uint8Array([0x00]),
      );
      expect(result.valid).toBe(false);
    });

    it("should be case-insensitive for extensions", () => {
      const result = validateUploadedFile("IMAGE.PNG", "image/png", PNG_MAGIC);
      expect(result.valid).toBe(true);
    });
  });
});
