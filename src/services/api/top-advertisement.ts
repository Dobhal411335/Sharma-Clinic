import { adminData, jsonBody } from "@/services/api/admin-fetch";
import type {
  TopAdvertisementConfigDto,
  TopAdvertisementConfigPayload,
} from "@/types/admin/top-advertisement";

export async function fetchTopAdvertisementConfig(
): Promise<TopAdvertisementConfigDto> {
  return adminData<TopAdvertisementConfigDto>("/api/admin/banners/top-advertisement");
}

export async function upsertTopAdvertisementConfig(
  body: TopAdvertisementConfigPayload,
): Promise<TopAdvertisementConfigDto> {
  return adminData<TopAdvertisementConfigDto>(
    "/api/admin/banners/top-advertisement",
    jsonBody("PUT", body),
  );
}
