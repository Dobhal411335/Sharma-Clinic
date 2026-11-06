export const WEBPAGE_TEMPLATE_TYPES = [
  "design1",
  "design2",
  "design3",
  "design4",
  "design5",
  "design6",
  "design7",
  "design9",
  "design10",
  "design11",
  "design12",
  "design13",
  "design14",
  "design15",

] as const;

export type WebpageTemplateType = (typeof WEBPAGE_TEMPLATE_TYPES)[number];

export type WebpageImageAsset = {
  url: string;
  key: string;
};

export type StorefrontWebpage = {
  id: string;
  siteCode: "IN" | "COM";
  title: string;
  slug: string;
  active: true;
  templateType: WebpageTemplateType | string;
  titleLine: string;
  keywords: string[];
  firstTitle: string;
  secondTitle: string;
  imageFirst: WebpageImageAsset | null;
  imageFirstMobile: WebpageImageAsset | null;
  bannerImage: WebpageImageAsset | null;
  bannerImageMobile: WebpageImageAsset | null;
  paragraphFirstImage: WebpageImageAsset | null;
  paragraphSecondImage: WebpageImageAsset | null;
  advertisementImage: WebpageImageAsset | null;
  sideThumbImage: WebpageImageAsset | null;
  mainProfileImage: WebpageImageAsset | null;
  createTags: string[];
  postedBy: { admin?: boolean; user?: boolean } | null;
  highlights: Array<{ title?: string; point?: string }>;
  paragraphSections: Array<{
    title?: string;
    description?: string;
    firstImage?: WebpageImageAsset | null;
    secondImage?: WebpageImageAsset | null;
    bulletPoints?: string[];
  }>;
  tableTitle: string;
  tableRows: Array<{ column1?: string; column2?: string }>;
  blockquoteMainTitle: string;
  blockquoteLeftTitle: string;
  blockquoteDescription: string;
  blockquoteTags: string[];
  accordionTags: Array<{ left?: string; right?: string }>;
  advertisements: Array<{ image?: WebpageImageAsset | null; url?: string }>;
  advertisementUrl: string;
  sideThumbName: string;
  sideThumbDesignation: string;
  sideThumbDescription: string;
  facebookUrl: string;
  youtubeUrl: string;
  instaUrl: string;
  googleUrl: string;
  imageGallery: WebpageImageAsset[];
  notices: Array<{ title?: string; description?: string; type?: string }>;
  searchLocations: Array<{
    locationName?: string;
    count?: string;
    url?: string;
  }>;
  design5Chip: string;
  design5MainHeading: string;
  gridCards: Array<{
    image?: WebpageImageAsset | null;
    chipName?: string;
    title?: string;
    link?: string;
    galleryDate?: string;
    postedBy?: string;
    galleryDescription?: string;
    gallerySlug?: string;
    bentoImages?: WebpageImageAsset[];
    youtubeShorts?: Array<string | { url?: string }>;
    youtubeVideos?: Array<string | { url?: string }>;
  }>;
  design6Chip: string;
  design6ExploreLink: string;
  design6MainHeading: string;
  design6SubHeading: string;
  design6Author: string;
  design6MidHeading: string;
  design6MidLink: string;
  teamCards: Array<{
    image?: WebpageImageAsset | null;
    name?: string;
    designation?: string;
    qualification?: string;
    specialization?: string;
    phone?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  }>;
  design7Chip: string;
  design7ExploreLink: string;
  design7MainHeading: string;
  design9MiniHeading: string;
  design9MainHeading: string;
  design9Description: string;
  design9Cards: Array<{
    heading?: string;
    description?: string;
    images?: WebpageImageAsset[];
  }>;
  design10HeroMiniHeading: string; design10HeroMainHeading: string; design10HeroDescription: string; design10HeroImage: WebpageImageAsset | null;
  design10StoryMiniHeading: string; design10StoryDescription: string; design10StoryParagraph: string; design10StorySmallParagraph: string;
  design10DefineMiniHeading: string; design10DefineCards: Array<{ heading?: string; description?: string }>;
  design10JourneyMiniHeading: string; design10JourneyMainHeading: string; design10JourneyImage: WebpageImageAsset | null; design10JourneyTimeline: Array<{ year?: string; heading?: string; description?: string }>;
  design10LeadershipMiniHeading: string; design10LeadershipMainHeading: string; design10LeadershipCards: Array<{ image?: WebpageImageAsset | null; name?: string; designation?: string }>;
  design10GlobalMiniHeading: string; design10GlobalMainHeading: string; design10GlobalDescription: string; design10GlobalCards: Array<{ miniHeading?: string; heading?: string; description?: string }>; design10GlobalImage: WebpageImageAsset | null;
  design10ExploreMiniHeading: string; design10ExploreMainHeading: string; design10ExploreCards: Array<{ heading?: string; description?: string; link?: string }>;
  design11HeroMiniHeading: string; design11HeroMainHeading: string; design11HeroDescription: string; design11HeroImage: WebpageImageAsset | null;
  design11CapabilitiesMiniHeading: string; design11CapabilitiesMainHeading: string; design11CapabilitiesDescription: string; design11CapabilitiesCards: Array<{ miniBadgeHeading?: string; heading?: string; description?: string; buttonUrl?: string }>;
  design11ProcessMiniHeading: string; design11ProcessMainHeading: string; design11ProcessDescription: string; design11ProcessCards: Array<{ subHeading?: string; subDescription?: string }>;
  design11EngagementMiniHeading: string; design11EngagementMainHeading: string; design11EngagementCards: Array<{ miniBadgeHeading?: string; heading?: string; description?: string }>;
  design11FaqMiniHeading: string; design11FaqMainHeading: string; design11FaqDescription: string; design11FaqItems: Array<{ question?: string; answer?: string }>;
  design11ExploreMiniHeading: string; design11ExploreMainHeading: string; design11ExploreCards: Array<{ heading?: string; subHeading?: string }>;
  design12HeroMiniHeading: string; design12HeroMainHeading: string; design12HeroDescription: string; design12HeroImage: WebpageImageAsset | null;
  design12ChallengeMiniHeading: string; design12ChallengeMainHeading: string; design12ChallengeDescription: string; design12ChallengeCard: { miniHeading?: string; heading?: string; points?: string[] };
  design12HelpMiniHeading: string; design12HelpMainHeading: string; design12HelpCards: Array<{ heading?: string; description?: string }>;
  design12MethodologyMiniHeading: string; design12MethodologyMainHeading: string; design12MethodologyDescription: string; design12MethodologyCards: Array<{ heading?: string; subDescription?: string }>;
  design12OutcomesMiniHeading: string; design12OutcomesMainHeading: string; design12OutcomeCards: Array<{ miniHeading?: string; description?: string }>;
  design12RelatedMiniHeading: string; design12RelatedMainHeading: string; design12RelatedCards: Array<{ image?: WebpageImageAsset | null; miniBadgeHeading?: string; heading?: string }>;
  design12ExploreMiniHeading: string; design12ExploreMainHeading: string; design12ExploreCards: Array<{ name?: string; description?: string; url?: string }>;
  design13HeroMiniHeading: string; design13HeroMainHeading: string; design13HeroDescription: string; design13HeroImage: WebpageImageAsset | null;
  design13ProcessMiniHeading: string; design13ProcessMainHeading: string; design13ProcessTimeline: Array<{ heading?: string; description?: string }>;
  design13FaqMiniHeading: string; design13FaqMainHeading: string; design13FaqItems: Array<{ question?: string; answer?: string }>;
  design13ExploreMiniHeading: string; design13ExploreMainHeading: string; design13ExploreCards: Array<{ heading?: string; description?: string; url?: string }>;
  design14HeroMiniHeading: string; design14HeroMainHeading: string; design14HeroDescription: string; design14HeroImage: WebpageImageAsset | null;
  design14SectorsMiniHeading: string; design14SectorsMainHeading: string; design14SectorsDescription: string; design14SectorCards: Array<{ image?: WebpageImageAsset | null; heading?: string; description?: string }>;
  design14PerspectiveMiniHeading: string; design14PerspectiveMainHeading: string; design14PerspectiveDescription: string; design14PerspectiveCards: Array<{ miniHeading?: string; miniDescription?: string }>;
  design14QuestionsMiniHeading: string; design14QuestionsMainHeading: string; design14QuestionsDescription: string; design14QuestionCards: Array<{ miniHeading?: string; miniDescription?: string }>;
  design14Quote: string; design14QuoteDesignation: string;
  design14ExploreMiniHeading: string; design14ExploreMainHeading: string; design14ExploreCards: Array<{ heading?: string; description?: string; url?: string }>;
  design15HeroMiniHeading: string; design15HeroMainHeading: string; design15HeroDescription: string;
  design15NoticeMiniHeading: string; design15NoticeMainHeading: string; design15NoticeDescription: string; design15FaqItems: Array<{ question?: string; answer?: string }>;
  design15ExploreCards: Array<{ heading?: string; description?: string; url?: string }>;
  createdAt?: string;
  updatedAt?: string;
};
