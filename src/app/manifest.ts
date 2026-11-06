import type { MetadataRoute } from "next";

import { companyDisplayName } from "@/data/site";
import { getCompanyBasicInfo } from "@/features/company-basic-info/company-basic-info.service";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const company = await getCompanyBasicInfo();
  const name = companyDisplayName(company.companyName);

  return {
    name,
    short_name: name,
    icons: [
      {
        src: "/favicon/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/favicon/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    theme_color: "#ffffff",
    background_color: "#ffffff",
    display: "standalone",
  };
}
