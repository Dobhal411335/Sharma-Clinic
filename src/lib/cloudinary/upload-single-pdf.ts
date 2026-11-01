import {
  assertPdfFile,
  fileToBuffer,
  uploadBufferToCloudinary,
} from "./cloudinary-client";
import { PDF_FOLDER, type CloudinaryUploadResult } from "./types";

function buildPdfFileName(file: File): string {
  const baseName = file.name?.trim() || "document.pdf";
  return baseName.toLowerCase().endsWith(".pdf") ? baseName : `${baseName}.pdf`;
}

export async function uploadSinglePdf(
  file: File,
): Promise<CloudinaryUploadResult> {
  const buffer = await fileToBuffer(file);
  assertPdfFile(file, buffer);

  return uploadBufferToCloudinary({
    buffer,
    folder: PDF_FOLDER,
    resourceType: "raw",
    originalFileName: buildPdfFileName(file),
  });
}
