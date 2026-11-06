import type {
  PopupBannerConfig,
  StorefrontPopupBanner,
} from "@/types/popup-banner";

type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

const STOREFRONT_SITE_CODE = "IN" as const;

export function popupBannerDismissStorageKey(siteCode: string): string {
  return `clinic.popupBanner.dismissed.${siteCode.toUpperCase()}`;
}

export function isPopupBannerDismissed(siteCode: string): boolean {
  try {
    return (
      window.sessionStorage.getItem(popupBannerDismissStorageKey(siteCode)) ===
      "1"
    );
  } catch {
    return false;
  }
}

export function markPopupBannerDismissed(siteCode: string): void {
  try {
    window.sessionStorage.setItem(popupBannerDismissStorageKey(siteCode), "1");
  } catch {
    // Ignore storage failures.
  }
}

export function mapPopupBannerConfigToStorefront(
  config: PopupBannerConfig,
): StorefrontPopupBanner | null {
  if (!config.id || !config.active) return null;

  const imageUrl = config.imageUrl.trim();
  const heading = config.heading.trim();
  const buttonLabel = config.buttonLabel.trim();
  const buttonUrl = config.buttonUrl.trim();

  if (!imageUrl || !heading || !buttonLabel || !buttonUrl) {
    return null;
  }

  return {
    imageUrl,
    imageAlt: heading,
    miniHeading: config.miniHeading.trim(),
    heading,
    subDescription: config.subDescription.trim(),
    buttonLabel,
    buttonUrl,
  };
}

/** Client-side fetch of the active popup for the .in storefront. */
export async function fetchActivePopupBanner(
  _siteCode: string = STOREFRONT_SITE_CODE,
): Promise<StorefrontPopupBanner | null> {
  try {
    const response = await fetch("/api/admin/banners/popup");
    if (!response.ok) return null;
    const data = (await response.json()) as ApiSuccess<PopupBannerConfig>;

    if (!data?.success || !data.data) {
      return null;
    }

    return mapPopupBannerConfigToStorefront(data.data);
  } catch {
    return null;
  }
}
