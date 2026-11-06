export type CompanyImageRef = {
  url: string;
  publicId: string;
};

export type CompanyBasicInfoDto = {
  id: string | null;
  siteCode: "IN" | "COM";
  companyName: string;
  companyDomainName: string;
  contactNumbers: string[];
  whatsappNumber: string;
  mainLogo: CompanyImageRef;
  footerLogo: CompanyImageRef;
  mobileUiLogo: CompanyImageRef;
  emails: string[];
  officeAddresses: string[];
  googleAddress: string;
  googleUrl: string;
  googleLink: string;
  facebookLink: string;
  instagramLink: string;
  youtubeLink: string;
  googleMapLink: string;
  googleTrackingTag: string;
  titleTagForMainLandingPage: string;
  keywords: string[];
  updatedAt: string | null;
};

export type CompanyBasicInfoFormValues = {
  companyName: string;
  companyDomainName: string;
  contactNumbers: string[];
  whatsappNumber: string;
  mainLogo: CompanyImageRef;
  footerLogo: CompanyImageRef;
  mobileUiLogo: CompanyImageRef;
  emails: string[];
  officeAddresses: string[];
  googleAddress: string;
  googleUrl: string;
  googleLink: string;
  facebookLink: string;
  instagramLink: string;
  youtubeLink: string;
  googleMapLink: string;
  googleTrackingTag: string;
  titleTagForMainLandingPage: string;
  keywords: string[];
};
