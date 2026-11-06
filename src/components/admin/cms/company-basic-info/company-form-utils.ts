import type {
  CompanyBasicInfoDto,
  CompanyBasicInfoFormValues,
  CompanyImageRef,
} from "@/types/admin/company-basic-info";

export function emptyImage(): CompanyImageRef {
  return { url: "", publicId: "" };
}

export function createEmptyFormValues(): CompanyBasicInfoFormValues {
  return {
    companyName: "",
    companyDomainName: "",
    contactNumbers: [""],
    whatsappNumber: "",
    mainLogo: emptyImage(),
    footerLogo: emptyImage(),
    mobileUiLogo: emptyImage(),
    emails: [""],
    officeAddresses: [""],
    googleAddress: "",
    googleUrl: "",
    googleLink: "",
    facebookLink: "",
    instagramLink: "",
    youtubeLink: "",
    googleMapLink: "",
    googleTrackingTag: "",
    titleTagForMainLandingPage: "",
    keywords: [""],
  };
}

function normalizeList(values: string[] | undefined): string[] {
  const cleaned = (values ?? []).map((item) => String(item ?? "").trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned : [""];
}

export function dtoToFormValues(dto: CompanyBasicInfoDto): CompanyBasicInfoFormValues {
  return {
    companyName: dto.companyName || "",
    companyDomainName: dto.companyDomainName || "",
    contactNumbers: normalizeList(dto.contactNumbers),
    whatsappNumber: dto.whatsappNumber || "",
    mainLogo: dto.mainLogo ?? emptyImage(),
    footerLogo: dto.footerLogo ?? emptyImage(),
    mobileUiLogo: dto.mobileUiLogo ?? emptyImage(),
    emails: normalizeList(dto.emails),
    officeAddresses: normalizeList(dto.officeAddresses),
    googleAddress: dto.googleAddress || "",
    googleUrl: dto.googleUrl || "",
    googleLink: dto.googleLink || "",
    facebookLink: dto.facebookLink || "",
    instagramLink: dto.instagramLink || "",
    youtubeLink: dto.youtubeLink || "",
    googleMapLink: dto.googleMapLink || "",
    googleTrackingTag: dto.googleTrackingTag || "",
    titleTagForMainLandingPage: dto.titleTagForMainLandingPage || "",
    keywords: normalizeList(dto.keywords),
  };
}
