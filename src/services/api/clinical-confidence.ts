import { adminData, jsonBody, uploadMedia } from "@/services/api/admin-fetch";
import type {
  ClinicalConfidenceConfigDto,
  ClinicalConfidenceConfigPayload,
} from "@/types/admin/clinical-confidence";

export async function fetchClinicalConfidence(
): Promise<ClinicalConfidenceConfigDto> {
  return adminData<ClinicalConfidenceConfigDto>("/api/admin/banners/clinical-confidence");
}

export async function upsertClinicalConfidence(
  body: ClinicalConfidenceConfigPayload,
): Promise<ClinicalConfidenceConfigDto> {
  return adminData<ClinicalConfidenceConfigDto>(
    "/api/admin/banners/clinical-confidence",
    jsonBody("PUT", body),
  );
}

export async function uploadClinicalConfidenceImage(
  file: File,
  _entityId?: string | null,
): Promise<{ url: string; publicId: string }> {
  return uploadMedia(file, "single-image");
}
