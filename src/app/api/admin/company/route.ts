import { deleteStoredCloudinaryAssetBestEffort } from "@/lib/cloudinary";
import { singletonHandlers } from "@/features/cms/handlers";
import { companyBodySchema, parseRecord } from "@/features/cms/parse";
import type { JsonRecord } from "@/features/cms/store";

const emptyImage = { url: "", publicId: "" };

function imageId(record: JsonRecord | null, key: string): string {
  const value = record?.[key];
  if (!value || typeof value !== "object") return "";
  const publicId = (value as { publicId?: unknown }).publicId;
  return typeof publicId === "string" ? publicId.trim() : "";
}

const handlers = singletonHandlers({
  key: "company",
  message: "Company basic info",
  parse: parseRecord(companyBodySchema),
  empty: {
    companyName: "",
    companyDomainName: "",
    contactNumbers: [],
    whatsappNumber: "",
    mainLogo: emptyImage,
    footerLogo: emptyImage,
    mobileUiLogo: emptyImage,
    emails: [],
    officeAddresses: [],
    googleAddress: "",
    googleUrl: "",
    googleLink: "",
    facebookLink: "",
    instagramLink: "",
    youtubeLink: "",
    googleMapLink: "",
    googleTrackingTag: "",
    titleTagForMainLandingPage: "",
    keywords: [],
  },
  afterSave: async (previous, next) => {
    for (const key of ["mainLogo", "footerLogo", "mobileUiLogo"]) {
      const previousId = imageId(previous, key);
      const nextId = imageId(next, key);
      if (previousId && previousId !== nextId) {
        await deleteStoredCloudinaryAssetBestEffort(previousId);
      }
    }
  },
});

export const GET = handlers.GET;
export const PUT = handlers.PUT;
