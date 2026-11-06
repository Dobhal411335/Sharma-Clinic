import { adminData, jsonBody } from "@/services/api/admin-fetch";
import type { NavbarSectionDto, NavbarSectionPayload } from "@/types/admin/manage-navbar";

const base = "/api/admin/navbar";

export async function fetchNavbarSections(): Promise<NavbarSectionDto[]> {
  return adminData<NavbarSectionDto[]>(base);
}

export async function createNavbarSection(
  body: NavbarSectionPayload,
): Promise<NavbarSectionDto> {
  return adminData<NavbarSectionDto>(base, jsonBody("POST", body));
}

export async function updateNavbarSection(
  sectionId: string,
  body: NavbarSectionPayload,
): Promise<NavbarSectionDto> {
  return adminData<NavbarSectionDto>(
    `${base}?id=${encodeURIComponent(sectionId)}`,
    jsonBody("PUT", body),
  );
}

export async function patchNavbarSectionActive(
  sectionId: string,
  active: boolean,
): Promise<NavbarSectionDto> {
  return adminData<NavbarSectionDto>(
    `${base}?id=${encodeURIComponent(sectionId)}`,
    jsonBody("PATCH", { active }),
  );
}

export async function deleteNavbarSection(sectionId: string): Promise<void> {
  await adminData(`${base}?id=${encodeURIComponent(sectionId)}`, { method: "DELETE" });
}
