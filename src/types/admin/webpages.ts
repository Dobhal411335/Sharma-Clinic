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

export type WebpagePostedBy = {
  admin: boolean;
  user: boolean;
};

export type WebpageHighlight = { title: string; point: string };

export type WebpageParagraphSection = {
  title: string;
  description: string;
  firstImage: WebpageImageAsset;
  secondImage: WebpageImageAsset;
  bulletPoints: string[];
};

export type WebpageTableRow = { column1: string; column2: string };
export type WebpageAccordionTag = { left: string; right: string };
export type WebpageNotice = {
  title: string;
  description: string;
  type: "warning" | "info" | "danger" | "success" | string;
};
export type WebpageSearchLocation = {
  locationName: string;
  count: string;
  url: string;
};
export type WebpageAdvertisement = {
  image: WebpageImageAsset;
  url: string;
};
export type WebpageGridCard = {
  image: WebpageImageAsset;
  chipName: string;
  title: string;
  link: string;
  galleryDate?: string;
  postedBy?: string;
  galleryDescription?: string;
  gallerySlug?: string;
  bentoImages?: WebpageImageAsset[];
  youtubeShorts?: string[];
  youtubeVideos?: string[];
};
export type WebpageTeamCard = {
  image: WebpageImageAsset;
  name: string;
  designation: string;
  qualification: string;
  specialization: string;
  phone: string;
  facebook: string;
  instagram: string;
  youtube: string;
};
export type WebpageDesign9Card = {
  heading: string;
  description: string;
  images: WebpageImageAsset[];
};
export type WebpageDesign10DefineCard = { heading: string; description: string };
export type WebpageDesign10TimelineItem = { year: string; heading: string; description: string };
export type WebpageDesign10Leader = { image: WebpageImageAsset; name: string; designation: string };
export type WebpageDesign10GlobalCard = { miniHeading: string; heading: string; description: string };
export type WebpageDesign10ExploreCard = { heading: string; description: string; link: string };
export type WebpageDesign11CapabilityCard = { miniBadgeHeading: string; heading: string; description: string; buttonUrl: string };
export type WebpageDesign11ProcessCard = { subHeading: string; subDescription: string };
export type WebpageDesign11EngagementCard = { miniBadgeHeading: string; heading: string; description: string };
export type WebpageDesign11FaqItem = { question: string; answer: string };
export type WebpageDesign11ExploreCard = { heading: string; subHeading: string };
export type WebpageDesign12ChallengeCard = { miniHeading: string; heading: string; points: string[] };
export type WebpageDesign12TextCard = { heading: string; description: string };
export type WebpageDesign12ProcessCard = { heading: string; subDescription: string };
export type WebpageDesign12OutcomeCard = { miniHeading: string; description: string };
export type WebpageDesign12RelatedCard = { image: WebpageImageAsset; miniBadgeHeading: string; heading: string };
export type WebpageDesign12ExploreCard = { name: string; description: string; url: string };
export type WebpageDesign13TimelineItem = { heading: string; description: string };
export type WebpageDesign13FaqItem = { question: string; answer: string };
export type WebpageDesign13ExploreCard = { heading: string; description: string; url: string };
export type WebpageDesign14SectorCard = { image: WebpageImageAsset; heading: string; description: string };
export type WebpageDesign14TextCard = { miniHeading: string; miniDescription: string };
export type WebpageDesign14ExploreCard = { heading: string; description: string; url: string };
export type WebpageDesign15FaqItem = { question: string; answer: string };
export type WebpageDesign15ExploreCard = { heading: string; description: string; url: string };

export type WebpageListDto = {
  id: string;
  siteCode: "IN" | "COM";
  title: string;
  slug: string;
  active: boolean;
  templateType: WebpageTemplateType;
  createdAt: string;
  updatedAt: string;
};

export type WebpageDto = WebpageListDto & {
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
  postedBy: WebpagePostedBy;
  highlights: WebpageHighlight[];
  paragraphSections: WebpageParagraphSection[];
  tableTitle: string;
  tableRows: WebpageTableRow[];
  blockquoteMainTitle: string;
  blockquoteLeftTitle: string;
  blockquoteDescription: string;
  blockquoteTags: string[];
  accordionTags: WebpageAccordionTag[];
  advertisements: WebpageAdvertisement[];
  advertisementUrl: string;
  sideThumbName: string;
  sideThumbDesignation: string;
  sideThumbDescription: string;
  facebookUrl: string;
  youtubeUrl: string;
  instaUrl: string;
  googleUrl: string;
  imageGallery: WebpageImageAsset[];
  notices: WebpageNotice[];
  searchLocations: WebpageSearchLocation[];
  design5Chip: string;
  design5MainHeading: string;
  gridCards: WebpageGridCard[];
  design6Chip: string;
  design6ExploreLink: string;
  design6MainHeading: string;
  design6SubHeading: string;
  design6Author: string;
  design6MidHeading: string;
  design6MidLink: string;
  teamCards: WebpageTeamCard[];
  design7Chip: string;
  design7ExploreLink: string;
  design7MainHeading: string;
  design9MiniHeading: string;
  design9MainHeading: string;
  design9Description: string;
  design9Cards: WebpageDesign9Card[];
  design10HeroMiniHeading: string; design10HeroMainHeading: string; design10HeroDescription: string; design10HeroImage: WebpageImageAsset | null;
  design10StoryMiniHeading: string; design10StoryDescription: string; design10StoryParagraph: string; design10StorySmallParagraph: string;
  design10DefineMiniHeading: string; design10DefineCards: WebpageDesign10DefineCard[];
  design10JourneyMiniHeading: string; design10JourneyMainHeading: string; design10JourneyImage: WebpageImageAsset | null; design10JourneyTimeline: WebpageDesign10TimelineItem[];
  design10LeadershipMiniHeading: string; design10LeadershipMainHeading: string; design10LeadershipCards: WebpageDesign10Leader[];
  design10GlobalMiniHeading: string; design10GlobalMainHeading: string; design10GlobalDescription: string; design10GlobalCards: WebpageDesign10GlobalCard[]; design10GlobalImage: WebpageImageAsset | null;
  design10ExploreMiniHeading: string; design10ExploreMainHeading: string; design10ExploreCards: WebpageDesign10ExploreCard[];
  design11HeroMiniHeading: string; design11HeroMainHeading: string; design11HeroDescription: string; design11HeroImage: WebpageImageAsset | null;
  design11CapabilitiesMiniHeading: string; design11CapabilitiesMainHeading: string; design11CapabilitiesDescription: string; design11CapabilitiesCards: WebpageDesign11CapabilityCard[];
  design11ProcessMiniHeading: string; design11ProcessMainHeading: string; design11ProcessDescription: string; design11ProcessCards: WebpageDesign11ProcessCard[];
  design11EngagementMiniHeading: string; design11EngagementMainHeading: string; design11EngagementCards: WebpageDesign11EngagementCard[];
  design11FaqMiniHeading: string; design11FaqMainHeading: string; design11FaqDescription: string; design11FaqItems: WebpageDesign11FaqItem[];
  design11ExploreMiniHeading: string; design11ExploreMainHeading: string; design11ExploreCards: WebpageDesign11ExploreCard[];
  design12HeroMiniHeading: string; design12HeroMainHeading: string; design12HeroDescription: string; design12HeroImage: WebpageImageAsset | null;
  design12ChallengeMiniHeading: string; design12ChallengeMainHeading: string; design12ChallengeDescription: string; design12ChallengeCard: WebpageDesign12ChallengeCard;
  design12HelpMiniHeading: string; design12HelpMainHeading: string; design12HelpCards: WebpageDesign12TextCard[];
  design12MethodologyMiniHeading: string; design12MethodologyMainHeading: string; design12MethodologyDescription: string; design12MethodologyCards: WebpageDesign12ProcessCard[];
  design12OutcomesMiniHeading: string; design12OutcomesMainHeading: string; design12OutcomeCards: WebpageDesign12OutcomeCard[];
  design12RelatedMiniHeading: string; design12RelatedMainHeading: string; design12RelatedCards: WebpageDesign12RelatedCard[];
  design12ExploreMiniHeading: string; design12ExploreMainHeading: string; design12ExploreCards: WebpageDesign12ExploreCard[];
  design13HeroMiniHeading: string; design13HeroMainHeading: string; design13HeroDescription: string; design13HeroImage: WebpageImageAsset | null;
  design13ProcessMiniHeading: string; design13ProcessMainHeading: string; design13ProcessTimeline: WebpageDesign13TimelineItem[];
  design13FaqMiniHeading: string; design13FaqMainHeading: string; design13FaqItems: WebpageDesign13FaqItem[];
  design13ExploreMiniHeading: string; design13ExploreMainHeading: string; design13ExploreCards: WebpageDesign13ExploreCard[];
  design14HeroMiniHeading: string; design14HeroMainHeading: string; design14HeroDescription: string; design14HeroImage: WebpageImageAsset | null;
  design14SectorsMiniHeading: string; design14SectorsMainHeading: string; design14SectorsDescription: string; design14SectorCards: WebpageDesign14SectorCard[];
  design14PerspectiveMiniHeading: string; design14PerspectiveMainHeading: string; design14PerspectiveDescription: string; design14PerspectiveCards: WebpageDesign14TextCard[];
  design14QuestionsMiniHeading: string; design14QuestionsMainHeading: string; design14QuestionsDescription: string; design14QuestionCards: WebpageDesign14TextCard[];
  design14Quote: string; design14QuoteDesignation: string;
  design14ExploreMiniHeading: string; design14ExploreMainHeading: string; design14ExploreCards: WebpageDesign14ExploreCard[];
  design15HeroMiniHeading: string; design15HeroMainHeading: string; design15HeroDescription: string;
  design15NoticeMiniHeading: string; design15NoticeMainHeading: string; design15NoticeDescription: string; design15FaqItems: WebpageDesign15FaqItem[];
  design15ExploreCards: WebpageDesign15ExploreCard[];
};

export type WebpageContentUpdatePayload = Partial<
  Omit<WebpageDto, "id" | "siteCode" | "createdAt" | "updatedAt">
>;

export type WebpageCreatePayload = {
  title: string;
  slug?: string;
  active?: boolean;
  templateType?: WebpageTemplateType;
};

export type WebpageMetaPatchPayload = {
  title?: string;
  slug?: string;
  active?: boolean;
  templateType?: WebpageTemplateType;
};

export type WebpageEditFormValues = {
  title: string;
  slug: string;
  active: boolean;
  templateType: WebpageTemplateType;
  titleLine: string;
  keywords: string[];
  firstTitle: string;
  secondTitle: string;
  imageFirst: WebpageImageAsset;
  imageFirstMobile: WebpageImageAsset;
  bannerImage: WebpageImageAsset;
  bannerImageMobile: WebpageImageAsset;
  paragraphFirstImage: WebpageImageAsset;
  paragraphSecondImage: WebpageImageAsset;
  advertisementImage: WebpageImageAsset;
  sideThumbImage: WebpageImageAsset;
  mainProfileImage: WebpageImageAsset;
  createTags: string[];
  postedBy: WebpagePostedBy;
  highlights: WebpageHighlight[];
  paragraphSections: WebpageParagraphSection[];
  tableTitle: string;
  tableRows: WebpageTableRow[];
  blockquoteMainTitle: string;
  blockquoteLeftTitle: string;
  blockquoteDescription: string;
  blockquoteTags: string[];
  accordionTags: WebpageAccordionTag[];
  advertisements: WebpageAdvertisement[];
  advertisementUrl: string;
  sideThumbName: string;
  sideThumbDesignation: string;
  sideThumbDescription: string;
  facebookUrl: string;
  youtubeUrl: string;
  instaUrl: string;
  googleUrl: string;
  imageGallery: WebpageImageAsset[];
  notices: WebpageNotice[];
  searchLocations: WebpageSearchLocation[];
  design5Chip: string;
  design5MainHeading: string;
  gridCards: WebpageGridCard[];
  design6Chip: string;
  design6ExploreLink: string;
  design6MainHeading: string;
  design6SubHeading: string;
  design6Author: string;
  design6MidHeading: string;
  design6MidLink: string;
  teamCards: WebpageTeamCard[];
  design7Chip: string;
  design7ExploreLink: string;
  design7MainHeading: string;
  design9MiniHeading: string;
  design9MainHeading: string;
  design9Description: string;
  design9Cards: WebpageDesign9Card[];
  design10HeroMiniHeading: string; design10HeroMainHeading: string; design10HeroDescription: string; design10HeroImage: WebpageImageAsset;
  design10StoryMiniHeading: string; design10StoryDescription: string; design10StoryParagraph: string; design10StorySmallParagraph: string;
  design10DefineMiniHeading: string; design10DefineCards: WebpageDesign10DefineCard[];
  design10JourneyMiniHeading: string; design10JourneyMainHeading: string; design10JourneyImage: WebpageImageAsset; design10JourneyTimeline: WebpageDesign10TimelineItem[];
  design10LeadershipMiniHeading: string; design10LeadershipMainHeading: string; design10LeadershipCards: WebpageDesign10Leader[];
  design10GlobalMiniHeading: string; design10GlobalMainHeading: string; design10GlobalDescription: string; design10GlobalCards: WebpageDesign10GlobalCard[]; design10GlobalImage: WebpageImageAsset;
  design10ExploreMiniHeading: string; design10ExploreMainHeading: string; design10ExploreCards: WebpageDesign10ExploreCard[];
  design11HeroMiniHeading: string; design11HeroMainHeading: string; design11HeroDescription: string; design11HeroImage: WebpageImageAsset;
  design11CapabilitiesMiniHeading: string; design11CapabilitiesMainHeading: string; design11CapabilitiesDescription: string; design11CapabilitiesCards: WebpageDesign11CapabilityCard[];
  design11ProcessMiniHeading: string; design11ProcessMainHeading: string; design11ProcessDescription: string; design11ProcessCards: WebpageDesign11ProcessCard[];
  design11EngagementMiniHeading: string; design11EngagementMainHeading: string; design11EngagementCards: WebpageDesign11EngagementCard[];
  design11FaqMiniHeading: string; design11FaqMainHeading: string; design11FaqDescription: string; design11FaqItems: WebpageDesign11FaqItem[];
  design11ExploreMiniHeading: string; design11ExploreMainHeading: string; design11ExploreCards: WebpageDesign11ExploreCard[];
  design12HeroMiniHeading: string; design12HeroMainHeading: string; design12HeroDescription: string; design12HeroImage: WebpageImageAsset;
  design12ChallengeMiniHeading: string; design12ChallengeMainHeading: string; design12ChallengeDescription: string; design12ChallengeCard: WebpageDesign12ChallengeCard;
  design12HelpMiniHeading: string; design12HelpMainHeading: string; design12HelpCards: WebpageDesign12TextCard[];
  design12MethodologyMiniHeading: string; design12MethodologyMainHeading: string; design12MethodologyDescription: string; design12MethodologyCards: WebpageDesign12ProcessCard[];
  design12OutcomesMiniHeading: string; design12OutcomesMainHeading: string; design12OutcomeCards: WebpageDesign12OutcomeCard[];
  design12RelatedMiniHeading: string; design12RelatedMainHeading: string; design12RelatedCards: WebpageDesign12RelatedCard[];
  design12ExploreMiniHeading: string; design12ExploreMainHeading: string; design12ExploreCards: WebpageDesign12ExploreCard[];
  design13HeroMiniHeading: string; design13HeroMainHeading: string; design13HeroDescription: string; design13HeroImage: WebpageImageAsset;
  design13ProcessMiniHeading: string; design13ProcessMainHeading: string; design13ProcessTimeline: WebpageDesign13TimelineItem[];
  design13FaqMiniHeading: string; design13FaqMainHeading: string; design13FaqItems: WebpageDesign13FaqItem[];
  design13ExploreMiniHeading: string; design13ExploreMainHeading: string; design13ExploreCards: WebpageDesign13ExploreCard[];
  design14HeroMiniHeading: string; design14HeroMainHeading: string; design14HeroDescription: string; design14HeroImage: WebpageImageAsset;
  design14SectorsMiniHeading: string; design14SectorsMainHeading: string; design14SectorsDescription: string; design14SectorCards: WebpageDesign14SectorCard[];
  design14PerspectiveMiniHeading: string; design14PerspectiveMainHeading: string; design14PerspectiveDescription: string; design14PerspectiveCards: WebpageDesign14TextCard[];
  design14QuestionsMiniHeading: string; design14QuestionsMainHeading: string; design14QuestionsDescription: string; design14QuestionCards: WebpageDesign14TextCard[];
  design14Quote: string; design14QuoteDesignation: string;
  design14ExploreMiniHeading: string; design14ExploreMainHeading: string; design14ExploreCards: WebpageDesign14ExploreCard[];
  design15HeroMiniHeading: string; design15HeroMainHeading: string; design15HeroDescription: string;
  design15NoticeMiniHeading: string; design15NoticeMainHeading: string; design15NoticeDescription: string; design15FaqItems: WebpageDesign15FaqItem[];
  design15ExploreCards: WebpageDesign15ExploreCard[];
};
