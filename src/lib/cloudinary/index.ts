export { uploadSingleImage } from "./upload-single-image";
export { uploadMultipleImages } from "./upload-multiple-images";
export { uploadSinglePdf } from "./upload-single-pdf";
export { deleteSingleImage } from "./delete-image";
export { deleteSinglePdf } from "./delete-pdf";

export type {
  CloudinaryUploadResult,
  CloudinaryMultipleUploadResult,
  CloudinaryDeleteResult,
  UploadOperationType,
  DeleteResourceType,
} from "./types";

export {
  CloudinaryError,
  IMAGE_FOLDER,
  PDF_FOLDER,
  MAX_IMAGE_BYTES,
  MAX_PDF_BYTES,
  MAX_MULTIPLE_IMAGES,
} from "./types";
