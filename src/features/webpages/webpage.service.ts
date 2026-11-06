import { cache } from "react";

import type { StorefrontWebpage } from "@/features/webpages/webpage.types";

type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

const STOREFRONT_SITE_CODE = "IN" as const;

function apiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!value) return "";
  return value.replace(/\/$/, "");
}

function preferHttps(url: string): string {
  if (url.startsWith("http://res.cloudinary.com/")) {
    return `https://${url.slice("http://".length)}`;
  }
  return url;
}

function mapImage(
  value: unknown,
): { url: string; key: string } | null {
  if (!value || typeof value !== "object") {
    if (typeof value === "string" && value.trim()) {
      return { url: preferHttps(value), key: "" };
    }
    return null;
  }
  const img = value as Record<string, unknown>;
  const url =
    typeof img.url === "string"
      ? img.url
      : typeof img.secureUrl === "string"
        ? img.secureUrl
        : "";
  if (!url) return null;
  return {
    url: preferHttps(url),
    key:
      typeof img.key === "string"
        ? img.key
        : typeof img.publicId === "string"
          ? img.publicId
          : "",
  };
}

function mapWebpage(row: Record<string, unknown>): StorefrontWebpage {
  return {
    id: String(row.id || ""),
    siteCode: "IN",
    title: String(row.title || ""),
    slug: String(row.slug || ""),
    active: true,
    templateType: String(row.templateType || "design1"),
    titleLine: String(row.titleLine || ""),
    keywords: Array.isArray(row.keywords)
      ? row.keywords.map((k) => String(k || ""))
      : [],
    firstTitle: String(row.firstTitle || ""),
    secondTitle: String(row.secondTitle || ""),
    imageFirst: mapImage(row.imageFirst),
    imageFirstMobile: mapImage(row.imageFirstMobile),
    bannerImage: mapImage(row.bannerImage),
    bannerImageMobile: mapImage(row.bannerImageMobile),
    paragraphFirstImage: mapImage(row.paragraphFirstImage),
    paragraphSecondImage: mapImage(row.paragraphSecondImage),
    advertisementImage: mapImage(row.advertisementImage),
    sideThumbImage: mapImage(row.sideThumbImage),
    mainProfileImage: mapImage(row.mainProfileImage),
    createTags: Array.isArray(row.createTags)
      ? row.createTags.map((t) => String(t || ""))
      : [],
    postedBy: (row.postedBy as StorefrontWebpage["postedBy"]) || null,
    highlights: Array.isArray(row.highlights)
      ? (row.highlights as StorefrontWebpage["highlights"])
      : [],
    paragraphSections: Array.isArray(row.paragraphSections)
      ? (row.paragraphSections as StorefrontWebpage["paragraphSections"])
      : [],
    tableTitle: String(row.tableTitle || ""),
    tableRows: Array.isArray(row.tableRows)
      ? (row.tableRows as StorefrontWebpage["tableRows"])
      : [],
    blockquoteMainTitle: String(row.blockquoteMainTitle || ""),
    blockquoteLeftTitle: String(row.blockquoteLeftTitle || ""),
    blockquoteDescription: String(row.blockquoteDescription || ""),
    blockquoteTags: Array.isArray(row.blockquoteTags)
      ? row.blockquoteTags.map((t) => String(t || ""))
      : [],
    accordionTags: Array.isArray(row.accordionTags)
      ? (row.accordionTags as StorefrontWebpage["accordionTags"])
      : [],
    advertisements: Array.isArray(row.advertisements)
      ? (row.advertisements as StorefrontWebpage["advertisements"])
      : [],
    advertisementUrl: String(row.advertisementUrl || ""),
    sideThumbName: String(row.sideThumbName || ""),
    sideThumbDesignation: String(row.sideThumbDesignation || ""),
    sideThumbDescription: String(row.sideThumbDescription || ""),
    facebookUrl: String(row.facebookUrl || ""),
    youtubeUrl: String(row.youtubeUrl || ""),
    instaUrl: String(row.instaUrl || ""),
    googleUrl: String(row.googleUrl || ""),
    imageGallery: Array.isArray(row.imageGallery)
      ? row.imageGallery
          .map(mapImage)
          .filter((x): x is { url: string; key: string } => !!x)
      : [],
    notices: Array.isArray(row.notices)
      ? (row.notices as StorefrontWebpage["notices"])
      : [],
    searchLocations: Array.isArray(row.searchLocations)
      ? (row.searchLocations as StorefrontWebpage["searchLocations"])
      : [],
    design5Chip: String(row.design5Chip || ""),
    design5MainHeading: String(row.design5MainHeading || ""),
    gridCards: Array.isArray(row.gridCards)
      ? (row.gridCards as StorefrontWebpage["gridCards"])
      : [],
    design6Chip: String(row.design6Chip || ""),
    design6ExploreLink: String(row.design6ExploreLink || ""),
    design6MainHeading: String(row.design6MainHeading || ""),
    design6SubHeading: String(row.design6SubHeading || ""),
    design6Author: String(row.design6Author || ""),
    design6MidHeading: String(row.design6MidHeading || ""),
    design6MidLink: String(row.design6MidLink || ""),
    teamCards: Array.isArray(row.teamCards)
      ? (row.teamCards as StorefrontWebpage["teamCards"])
      : [],
    design7Chip: String(row.design7Chip || ""),
    design7ExploreLink: String(row.design7ExploreLink || ""),
    design7MainHeading: String(row.design7MainHeading || ""),
    design9MiniHeading: String(row.design9MiniHeading || ""),
    design9MainHeading: String(row.design9MainHeading || ""),
    design9Description: String(row.design9Description || ""),
    design9Cards: Array.isArray(row.design9Cards)
      ? (row.design9Cards as StorefrontWebpage["design9Cards"])
      : [],
    design10HeroMiniHeading: String(row.design10HeroMiniHeading || ""), design10HeroMainHeading: String(row.design10HeroMainHeading || ""), design10HeroDescription: String(row.design10HeroDescription || ""), design10HeroImage: mapImage(row.design10HeroImage),
    design10StoryMiniHeading: String(row.design10StoryMiniHeading || ""), design10StoryDescription: String(row.design10StoryDescription || ""), design10StoryParagraph: String(row.design10StoryParagraph || ""), design10StorySmallParagraph: String(row.design10StorySmallParagraph || ""),
    design10DefineMiniHeading: String(row.design10DefineMiniHeading || ""), design10DefineCards: Array.isArray(row.design10DefineCards) ? row.design10DefineCards as StorefrontWebpage["design10DefineCards"] : [],
    design10JourneyMiniHeading: String(row.design10JourneyMiniHeading || ""), design10JourneyMainHeading: String(row.design10JourneyMainHeading || ""), design10JourneyImage: mapImage(row.design10JourneyImage), design10JourneyTimeline: Array.isArray(row.design10JourneyTimeline) ? row.design10JourneyTimeline as StorefrontWebpage["design10JourneyTimeline"] : [],
    design10LeadershipMiniHeading: String(row.design10LeadershipMiniHeading || ""), design10LeadershipMainHeading: String(row.design10LeadershipMainHeading || ""), design10LeadershipCards: Array.isArray(row.design10LeadershipCards) ? row.design10LeadershipCards as StorefrontWebpage["design10LeadershipCards"] : [],
    design10GlobalMiniHeading: String(row.design10GlobalMiniHeading || ""), design10GlobalMainHeading: String(row.design10GlobalMainHeading || ""), design10GlobalDescription: String(row.design10GlobalDescription || ""), design10GlobalCards: Array.isArray(row.design10GlobalCards) ? row.design10GlobalCards as StorefrontWebpage["design10GlobalCards"] : [], design10GlobalImage: mapImage(row.design10GlobalImage),
    design10ExploreMiniHeading: String(row.design10ExploreMiniHeading || ""), design10ExploreMainHeading: String(row.design10ExploreMainHeading || ""), design10ExploreCards: Array.isArray(row.design10ExploreCards) ? row.design10ExploreCards as StorefrontWebpage["design10ExploreCards"] : [],
    design11HeroMiniHeading: String(row.design11HeroMiniHeading || ""), design11HeroMainHeading: String(row.design11HeroMainHeading || ""), design11HeroDescription: String(row.design11HeroDescription || ""), design11HeroImage: mapImage(row.design11HeroImage),
    design11CapabilitiesMiniHeading: String(row.design11CapabilitiesMiniHeading || ""), design11CapabilitiesMainHeading: String(row.design11CapabilitiesMainHeading || ""), design11CapabilitiesDescription: String(row.design11CapabilitiesDescription || ""), design11CapabilitiesCards: Array.isArray(row.design11CapabilitiesCards) ? row.design11CapabilitiesCards as StorefrontWebpage["design11CapabilitiesCards"] : [],
    design11ProcessMiniHeading: String(row.design11ProcessMiniHeading || ""), design11ProcessMainHeading: String(row.design11ProcessMainHeading || ""), design11ProcessDescription: String(row.design11ProcessDescription || ""), design11ProcessCards: Array.isArray(row.design11ProcessCards) ? row.design11ProcessCards as StorefrontWebpage["design11ProcessCards"] : [],
    design11EngagementMiniHeading: String(row.design11EngagementMiniHeading || ""), design11EngagementMainHeading: String(row.design11EngagementMainHeading || ""), design11EngagementCards: Array.isArray(row.design11EngagementCards) ? row.design11EngagementCards as StorefrontWebpage["design11EngagementCards"] : [],
    design11FaqMiniHeading: String(row.design11FaqMiniHeading || ""), design11FaqMainHeading: String(row.design11FaqMainHeading || ""), design11FaqDescription: String(row.design11FaqDescription || ""), design11FaqItems: Array.isArray(row.design11FaqItems) ? row.design11FaqItems as StorefrontWebpage["design11FaqItems"] : [],
    design11ExploreMiniHeading: String(row.design11ExploreMiniHeading || ""), design11ExploreMainHeading: String(row.design11ExploreMainHeading || ""), design11ExploreCards: Array.isArray(row.design11ExploreCards) ? row.design11ExploreCards as StorefrontWebpage["design11ExploreCards"] : [],
    design12HeroMiniHeading: String(row.design12HeroMiniHeading || ""), design12HeroMainHeading: String(row.design12HeroMainHeading || ""), design12HeroDescription: String(row.design12HeroDescription || ""), design12HeroImage: mapImage(row.design12HeroImage),
    design12ChallengeMiniHeading: String(row.design12ChallengeMiniHeading || ""), design12ChallengeMainHeading: String(row.design12ChallengeMainHeading || ""), design12ChallengeDescription: String(row.design12ChallengeDescription || ""), design12ChallengeCard: row.design12ChallengeCard && typeof row.design12ChallengeCard === "object" ? row.design12ChallengeCard as StorefrontWebpage["design12ChallengeCard"] : {},
    design12HelpMiniHeading: String(row.design12HelpMiniHeading || ""), design12HelpMainHeading: String(row.design12HelpMainHeading || ""), design12HelpCards: Array.isArray(row.design12HelpCards) ? row.design12HelpCards as StorefrontWebpage["design12HelpCards"] : [],
    design12MethodologyMiniHeading: String(row.design12MethodologyMiniHeading || ""), design12MethodologyMainHeading: String(row.design12MethodologyMainHeading || ""), design12MethodologyDescription: String(row.design12MethodologyDescription || ""), design12MethodologyCards: Array.isArray(row.design12MethodologyCards) ? row.design12MethodologyCards as StorefrontWebpage["design12MethodologyCards"] : [],
    design12OutcomesMiniHeading: String(row.design12OutcomesMiniHeading || ""), design12OutcomesMainHeading: String(row.design12OutcomesMainHeading || ""), design12OutcomeCards: Array.isArray(row.design12OutcomeCards) ? row.design12OutcomeCards as StorefrontWebpage["design12OutcomeCards"] : [],
    design12RelatedMiniHeading: String(row.design12RelatedMiniHeading || ""), design12RelatedMainHeading: String(row.design12RelatedMainHeading || ""), design12RelatedCards: Array.isArray(row.design12RelatedCards) ? row.design12RelatedCards as StorefrontWebpage["design12RelatedCards"] : [],
    design12ExploreMiniHeading: String(row.design12ExploreMiniHeading || ""), design12ExploreMainHeading: String(row.design12ExploreMainHeading || ""), design12ExploreCards: Array.isArray(row.design12ExploreCards) ? row.design12ExploreCards as StorefrontWebpage["design12ExploreCards"] : [],
    design13HeroMiniHeading: String(row.design13HeroMiniHeading || ""), design13HeroMainHeading: String(row.design13HeroMainHeading || ""), design13HeroDescription: String(row.design13HeroDescription || ""), design13HeroImage: mapImage(row.design13HeroImage),
    design13ProcessMiniHeading: String(row.design13ProcessMiniHeading || ""), design13ProcessMainHeading: String(row.design13ProcessMainHeading || ""), design13ProcessTimeline: Array.isArray(row.design13ProcessTimeline) ? row.design13ProcessTimeline as StorefrontWebpage["design13ProcessTimeline"] : [],
    design13FaqMiniHeading: String(row.design13FaqMiniHeading || ""), design13FaqMainHeading: String(row.design13FaqMainHeading || ""), design13FaqItems: Array.isArray(row.design13FaqItems) ? row.design13FaqItems as StorefrontWebpage["design13FaqItems"] : [],
    design13ExploreMiniHeading: String(row.design13ExploreMiniHeading || ""), design13ExploreMainHeading: String(row.design13ExploreMainHeading || ""), design13ExploreCards: Array.isArray(row.design13ExploreCards) ? row.design13ExploreCards as StorefrontWebpage["design13ExploreCards"] : [],
    design14HeroMiniHeading: String(row.design14HeroMiniHeading || ""), design14HeroMainHeading: String(row.design14HeroMainHeading || ""), design14HeroDescription: String(row.design14HeroDescription || ""), design14HeroImage: mapImage(row.design14HeroImage),
    design14SectorsMiniHeading: String(row.design14SectorsMiniHeading || ""), design14SectorsMainHeading: String(row.design14SectorsMainHeading || ""), design14SectorsDescription: String(row.design14SectorsDescription || ""), design14SectorCards: Array.isArray(row.design14SectorCards) ? row.design14SectorCards as StorefrontWebpage["design14SectorCards"] : [],
    design14PerspectiveMiniHeading: String(row.design14PerspectiveMiniHeading || ""), design14PerspectiveMainHeading: String(row.design14PerspectiveMainHeading || ""), design14PerspectiveDescription: String(row.design14PerspectiveDescription || ""), design14PerspectiveCards: Array.isArray(row.design14PerspectiveCards) ? row.design14PerspectiveCards as StorefrontWebpage["design14PerspectiveCards"] : [],
    design14QuestionsMiniHeading: String(row.design14QuestionsMiniHeading || ""), design14QuestionsMainHeading: String(row.design14QuestionsMainHeading || ""), design14QuestionsDescription: String(row.design14QuestionsDescription || ""), design14QuestionCards: Array.isArray(row.design14QuestionCards) ? row.design14QuestionCards as StorefrontWebpage["design14QuestionCards"] : [],
    design14Quote: String(row.design14Quote || ""), design14QuoteDesignation: String(row.design14QuoteDesignation || ""), design14ExploreMiniHeading: String(row.design14ExploreMiniHeading || ""), design14ExploreMainHeading: String(row.design14ExploreMainHeading || ""), design14ExploreCards: Array.isArray(row.design14ExploreCards) ? row.design14ExploreCards as StorefrontWebpage["design14ExploreCards"] : [],
    design15HeroMiniHeading: String(row.design15HeroMiniHeading || ""), design15HeroMainHeading: String(row.design15HeroMainHeading || ""), design15HeroDescription: String(row.design15HeroDescription || ""), design15NoticeMiniHeading: String(row.design15NoticeMiniHeading || ""), design15NoticeMainHeading: String(row.design15NoticeMainHeading || ""), design15NoticeDescription: String(row.design15NoticeDescription || ""), design15FaqItems: Array.isArray(row.design15FaqItems) ? row.design15FaqItems as StorefrontWebpage["design15FaqItems"] : [], design15ExploreCards: Array.isArray(row.design15ExploreCards) ? row.design15ExploreCards as StorefrontWebpage["design15ExploreCards"] : [],
    createdAt: typeof row.createdAt === "string" ? row.createdAt : undefined,
    updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : undefined,
  };
}

/**
 * Public webpage by slug for the .in storefront.
 * Returns null on 404; does not invent fallback marketing content.
 */
export const getWebpageBySlug = cache(
  async (slug: string): Promise<StorefrontWebpage | null> => {
    try {
      const { listItems } = await import("@/features/cms/store");
      const items = await listItems("webpage");
      const match = items.find(
        (item) => item.slug === slug && item.active !== false,
      );
      if (!match?.slug) return null;
      return mapWebpage(match);
    } catch {
      return null;
    }
  },
);
