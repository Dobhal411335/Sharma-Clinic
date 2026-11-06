import { exampleCompany } from "@/data/site";
import type { CompanyBasicInfo } from "@/types/company-basic-info";

const emptyImage = { url: "", publicId: "" };

/** Fallback when company info has not been saved. Replace via admin company settings. */
export const FALLBACK_COMPANY_BASIC_INFO: CompanyBasicInfo = {
  id: null,
  siteCode: "IN",
  companyName: exampleCompany.name,
  companyDomainName: exampleCompany.domain,
  contactNumbers: [exampleCompany.phone],
  whatsappNumber: "",
  mainLogo: emptyImage,
  footerLogo: emptyImage,
  mobileUiLogo: emptyImage,
  emails: [exampleCompany.email],
  officeAddresses: [exampleCompany.address],
  googleAddress: "",
  googleUrl: "",
  googleLink: "",
  facebookLink: "",
  instagramLink: "",
  youtubeLink: "",
  googleMapLink: "",
  googleTrackingTag: "",
  titleTagForMainLandingPage: exampleCompany.titleTag,
  keywords: [],
  updatedAt: null,
};
