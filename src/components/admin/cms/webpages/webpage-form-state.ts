import type {
  WebpageDesign9Card,
  WebpageDesign10DefineCard, WebpageDesign10TimelineItem, WebpageDesign10Leader, WebpageDesign10GlobalCard, WebpageDesign10ExploreCard,
  WebpageDesign11CapabilityCard, WebpageDesign11ProcessCard, WebpageDesign11EngagementCard, WebpageDesign11FaqItem, WebpageDesign11ExploreCard,
  WebpageDesign12ChallengeCard, WebpageDesign12TextCard, WebpageDesign12ProcessCard, WebpageDesign12OutcomeCard, WebpageDesign12RelatedCard, WebpageDesign12ExploreCard,
  WebpageDesign13TimelineItem, WebpageDesign13FaqItem, WebpageDesign13ExploreCard,
  WebpageDesign14SectorCard, WebpageDesign14TextCard, WebpageDesign14ExploreCard,
  WebpageDesign15FaqItem, WebpageDesign15ExploreCard,
  WebpageDto,
  WebpageEditFormValues,
  WebpageGridCard,
  WebpageImageAsset,
  WebpageParagraphSection,
  WebpageTeamCard,
  WebpageTemplateType,
} from "@/types/admin/webpages";

export const emptyImage = (): WebpageImageAsset => ({ url: "", key: "" });

export const createEmptyParagraphSection = (): WebpageParagraphSection => ({
  title: "",
  description: "",
  firstImage: emptyImage(),
  secondImage: emptyImage(),
  bulletPoints: [""],
});

export const createEmptyGridCard = (): WebpageGridCard => ({
  image: emptyImage(),
  chipName: "",
  title: "",
  link: "",
  galleryDate: "",
  postedBy: "",
  galleryDescription: "",
  gallerySlug: "",
  bentoImages: [],
  youtubeShorts: [],
  youtubeVideos: [],
});

export const createEmptyTeamCard = (): WebpageTeamCard => ({
  image: emptyImage(),
  name: "",
  designation: "",
  qualification: "",
  specialization: "",
  phone: "",
  facebook: "",
  instagram: "",
  youtube: "",
});

export const createEmptyDesign9Card = (): WebpageDesign9Card => ({
  heading: "",
  description: "",
  images: [],
});
export const createEmptyDesign10DefineCard = (): WebpageDesign10DefineCard => ({ heading: "", description: "" });
export const createEmptyDesign10TimelineItem = (): WebpageDesign10TimelineItem => ({ year: "", heading: "", description: "" });
export const createEmptyDesign10Leader = (): WebpageDesign10Leader => ({ image: emptyImage(), name: "", designation: "" });
export const createEmptyDesign10GlobalCard = (): WebpageDesign10GlobalCard => ({ miniHeading: "", heading: "", description: "" });
export const createEmptyDesign10ExploreCard = (): WebpageDesign10ExploreCard => ({ heading: "", description: "", link: "" });
export const createEmptyDesign11CapabilityCard = (): WebpageDesign11CapabilityCard => ({ miniBadgeHeading: "", heading: "", description: "", buttonUrl: "" });
export const createEmptyDesign11ProcessCard = (): WebpageDesign11ProcessCard => ({ subHeading: "", subDescription: "" });
export const createEmptyDesign11EngagementCard = (): WebpageDesign11EngagementCard => ({ miniBadgeHeading: "", heading: "", description: "" });
export const createEmptyDesign11FaqItem = (): WebpageDesign11FaqItem => ({ question: "", answer: "" });
export const createEmptyDesign11ExploreCard = (): WebpageDesign11ExploreCard => ({ heading: "", subHeading: "" });
export const createEmptyDesign12ChallengeCard = (): WebpageDesign12ChallengeCard => ({ miniHeading: "", heading: "", points: [""] });
export const createEmptyDesign12TextCard = (): WebpageDesign12TextCard => ({ heading: "", description: "" });
export const createEmptyDesign12ProcessCard = (): WebpageDesign12ProcessCard => ({ heading: "", subDescription: "" });
export const createEmptyDesign12OutcomeCard = (): WebpageDesign12OutcomeCard => ({ miniHeading: "", description: "" });
export const createEmptyDesign12RelatedCard = (): WebpageDesign12RelatedCard => ({ image: emptyImage(), miniBadgeHeading: "", heading: "" });
export const createEmptyDesign12ExploreCard = (): WebpageDesign12ExploreCard => ({ name: "", description: "", url: "" });
export const createEmptyDesign13TimelineItem = (): WebpageDesign13TimelineItem => ({ heading: "", description: "" });
export const createEmptyDesign13FaqItem = (): WebpageDesign13FaqItem => ({ question: "", answer: "" });
export const createEmptyDesign13ExploreCard = (): WebpageDesign13ExploreCard => ({ heading: "", description: "", url: "" });
export const createEmptyDesign14SectorCard = (): WebpageDesign14SectorCard => ({ image: emptyImage(), heading: "", description: "" });
export const createEmptyDesign14TextCard = (): WebpageDesign14TextCard => ({ miniHeading: "", miniDescription: "" });
export const createEmptyDesign14ExploreCard = (): WebpageDesign14ExploreCard => ({ heading: "", description: "", url: "" });
export const createEmptyDesign15FaqItem = (): WebpageDesign15FaqItem => ({ question: "", answer: "" });
export const createEmptyDesign15ExploreCard = (): WebpageDesign15ExploreCard => ({ heading: "", description: "", url: "" });

function asImage(value: unknown): WebpageImageAsset {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const img = value as Record<string, unknown>;
    return {
      url: typeof img.url === "string" ? img.url : "",
      key:
        typeof img.key === "string"
          ? img.key
          : typeof img.publicId === "string"
            ? img.publicId
            : "",
    };
  }
  if (typeof value === "string" && value.trim()) {
    return { url: value, key: "" };
  }
  return emptyImage();
}

function asStringArray(value: unknown, fallback: string[] = [""]): string[] {
  if (!Array.isArray(value) || value.length === 0) return [...fallback];
  const next = value.map((item) => (typeof item === "string" ? item : ""));
  return next.length > 0 ? next : [...fallback];
}

function normalizeParagraphSections(value: unknown): WebpageParagraphSection[] {
  if (!Array.isArray(value) || value.length === 0) {
    return [createEmptyParagraphSection()];
  }
  return value.map((section) => {
    const row = (section ?? {}) as Record<string, unknown>;
    const bullets = Array.isArray(row.bulletPoints)
      ? row.bulletPoints.map((b) => (typeof b === "string" ? b : ""))
      : [""];
    return {
      title: typeof row.title === "string" ? row.title : "",
      description: typeof row.description === "string" ? row.description : "",
      firstImage: asImage(row.firstImage),
      secondImage: asImage(row.secondImage),
      bulletPoints: bullets.length > 0 ? bullets : [""],
    };
  });
}

function normalizeGridCards(value: unknown): WebpageGridCard[] {
  if (!Array.isArray(value) || value.length === 0) return [createEmptyGridCard()];
  return value.map((card) => {
    const row = (card ?? {}) as Record<string, unknown>;
    return {
      image: asImage(row.image),
      chipName: typeof row.chipName === "string" ? row.chipName : "",
      title: typeof row.title === "string" ? row.title : "",
      link: typeof row.link === "string" ? row.link : "",
      galleryDate: typeof row.galleryDate === "string" ? row.galleryDate : "",
      postedBy: typeof row.postedBy === "string" ? row.postedBy : "",
      galleryDescription:
        typeof row.galleryDescription === "string" ? row.galleryDescription : "",
      gallerySlug: typeof row.gallerySlug === "string" ? row.gallerySlug : "",
      bentoImages: Array.isArray(row.bentoImages)
        ? row.bentoImages.map(asImage)
        : [],
      youtubeShorts: Array.isArray(row.youtubeShorts)
        ? row.youtubeShorts.map((s) => {
            if (typeof s === "string") return s;
            if (s && typeof s === "object" && "url" in s) {
              return typeof (s as { url?: unknown }).url === "string"
                ? (s as { url: string }).url
                : "";
            }
            return "";
          })
        : [],
      youtubeVideos: Array.isArray(row.youtubeVideos)
        ? row.youtubeVideos.map((s) => {
            if (typeof s === "string") return s;
            if (s && typeof s === "object" && "url" in s) {
              return typeof (s as { url?: unknown }).url === "string"
                ? (s as { url: string }).url
                : "";
            }
            return "";
          })
        : [],
    };
  });
}

function normalizeTeamCards(value: unknown): WebpageTeamCard[] {
  if (!Array.isArray(value) || value.length === 0) return [createEmptyTeamCard()];
  return value.map((card) => {
    const row = (card ?? {}) as Record<string, unknown>;
    return {
      image: asImage(row.image),
      name: typeof row.name === "string" ? row.name : "",
      designation: typeof row.designation === "string" ? row.designation : "",
      qualification:
        typeof row.qualification === "string" ? row.qualification : "",
      specialization:
        typeof row.specialization === "string" ? row.specialization : "",
      phone: typeof row.phone === "string" ? row.phone : "",
      facebook: typeof row.facebook === "string" ? row.facebook : "",
      instagram: typeof row.instagram === "string" ? row.instagram : "",
      youtube: typeof row.youtube === "string" ? row.youtube : "",
    };
  });
}

function normalizeDesign9Cards(value: unknown): WebpageDesign9Card[] {
  if (!Array.isArray(value) || value.length === 0) {
    return [createEmptyDesign9Card()];
  }
  return value.map((card) => {
    const row = (card ?? {}) as Record<string, unknown>;
    return {
      heading: typeof row.heading === "string" ? row.heading : "",
      description: typeof row.description === "string" ? row.description : "",
      images: Array.isArray(row.images) ? row.images.map(asImage) : [],
    };
  });
}
function rows<T>(value: unknown, create: () => T, map: (row: Record<string, unknown>) => T): T[] {
  if (!Array.isArray(value) || value.length === 0) return [create()];
  return value.map((item) => map(item && typeof item === "object" ? item as Record<string, unknown> : {}));
}
const text = (row: Record<string, unknown>, key: string) => typeof row[key] === "string" ? row[key] as string : "";
function normalizeD10(value: unknown, type: "define" | "timeline" | "leader" | "global" | "explore") {
  if (type === "define") return rows(value, createEmptyDesign10DefineCard, r => ({ heading: text(r,"heading"), description: text(r,"description") }));
  if (type === "timeline") return rows(value, createEmptyDesign10TimelineItem, r => ({ year: text(r,"year"), heading: text(r,"heading"), description: text(r,"description") }));
  if (type === "leader") return rows(value, createEmptyDesign10Leader, r => ({ image: asImage(r.image), name: text(r,"name"), designation: text(r,"designation") }));
  if (type === "global") return rows(value, createEmptyDesign10GlobalCard, r => ({ miniHeading: text(r,"miniHeading"), heading: text(r,"heading"), description: text(r,"description") }));
  return rows(value, createEmptyDesign10ExploreCard, r => ({ heading: text(r,"heading"), description: text(r,"description"), link: text(r,"link") }));
}
function normalizeD11(value: unknown, type: "capability" | "process" | "engagement" | "faq" | "explore") {
  if (type === "capability") return rows(value, createEmptyDesign11CapabilityCard, r => ({ miniBadgeHeading: text(r,"miniBadgeHeading"), heading: text(r,"heading"), description: text(r,"description"), buttonUrl: text(r,"buttonUrl") }));
  if (type === "process") return rows(value, createEmptyDesign11ProcessCard, r => ({ subHeading: text(r,"subHeading"), subDescription: text(r,"subDescription") }));
  if (type === "engagement") return rows(value, createEmptyDesign11EngagementCard, r => ({ miniBadgeHeading: text(r,"miniBadgeHeading"), heading: text(r,"heading"), description: text(r,"description") }));
  if (type === "faq") return rows(value, createEmptyDesign11FaqItem, r => ({ question: text(r,"question"), answer: text(r,"answer") }));
  return rows(value, createEmptyDesign11ExploreCard, r => ({ heading: text(r,"heading"), subHeading: text(r,"subHeading") }));
}
function normalizeD12(value: unknown, type: "text" | "process" | "outcome" | "related" | "explore") {
  if (type === "text") return rows(value, createEmptyDesign12TextCard, r => ({ heading: text(r,"heading"), description: text(r,"description") }));
  if (type === "process") return rows(value, createEmptyDesign12ProcessCard, r => ({ heading: text(r,"heading"), subDescription: text(r,"subDescription") }));
  if (type === "outcome") return rows(value, createEmptyDesign12OutcomeCard, r => ({ miniHeading: text(r,"miniHeading"), description: text(r,"description") }));
  if (type === "related") return rows(value, createEmptyDesign12RelatedCard, r => ({ image: asImage(r.image), miniBadgeHeading: text(r,"miniBadgeHeading"), heading: text(r,"heading") }));
  return rows(value, createEmptyDesign12ExploreCard, r => ({ name: text(r,"name"), description: text(r,"description"), url: text(r,"url") }));
}
function normalizeD12Challenge(value: unknown): WebpageDesign12ChallengeCard {
  const row = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  return { miniHeading: text(row, "miniHeading"), heading: text(row, "heading"), points: asStringArray(row.points) };
}
function normalizeD13(value: unknown, type: "timeline" | "faq" | "explore") {
  if (type === "timeline") return rows(value, createEmptyDesign13TimelineItem, r => ({ heading: text(r,"heading"), description: text(r,"description") }));
  if (type === "faq") return rows(value, createEmptyDesign13FaqItem, r => ({ question: text(r,"question"), answer: text(r,"answer") }));
  return rows(value, createEmptyDesign13ExploreCard, r => ({ heading: text(r,"heading"), description: text(r,"description"), url: text(r,"url") }));
}
function normalizeD14(value: unknown, type: "sector" | "text" | "explore") {
  if (type === "sector") return rows(value, createEmptyDesign14SectorCard, r => ({ image: asImage(r.image), heading: text(r, "heading"), description: text(r, "description") }));
  if (type === "text") return rows(value, createEmptyDesign14TextCard, r => ({ miniHeading: text(r, "miniHeading"), miniDescription: text(r, "miniDescription") }));
  return rows(value, createEmptyDesign14ExploreCard, r => ({ heading: text(r, "heading"), description: text(r, "description"), url: text(r, "url") }));
}
function normalizeD15(value: unknown, type: "faq" | "explore") {
  if (type === "faq") return rows(value, createEmptyDesign15FaqItem, r => ({ question: text(r, "question"), answer: text(r, "answer") }));
  return rows(value, createEmptyDesign15ExploreCard, r => ({ heading: text(r, "heading"), description: text(r, "description"), url: text(r, "url") }));
}

export function createEmptyEditValues(
  templateType: WebpageTemplateType = "design1",
): WebpageEditFormValues {
  return {
    title: "",
    slug: "",
    active: true,
    templateType,
    titleLine: "",
    keywords: [""],
    firstTitle: "",
    secondTitle: "",
    imageFirst: emptyImage(),
    imageFirstMobile: emptyImage(),
    bannerImage: emptyImage(),
    bannerImageMobile: emptyImage(),
    paragraphFirstImage: emptyImage(),
    paragraphSecondImage: emptyImage(),
    advertisementImage: emptyImage(),
    sideThumbImage: emptyImage(),
    mainProfileImage: emptyImage(),
    createTags: [""],
    postedBy: { admin: false, user: false },
    highlights: [{ title: "", point: "" }],
    paragraphSections: [createEmptyParagraphSection()],
    tableTitle: "",
    tableRows: [{ column1: "", column2: "" }],
    blockquoteMainTitle: "",
    blockquoteLeftTitle: "",
    blockquoteDescription: "",
    blockquoteTags: [""],
    accordionTags: [{ left: "", right: "" }],
    advertisements: [{ image: emptyImage(), url: "" }],
    advertisementUrl: "",
    sideThumbName: "",
    sideThumbDesignation: "",
    sideThumbDescription: "",
    facebookUrl: "",
    youtubeUrl: "",
    instaUrl: "",
    googleUrl: "",
    imageGallery: [],
    notices: [{ title: "", description: "", type: "warning" }],
    searchLocations: [{ locationName: "", count: "", url: "" }],
    design5Chip: "",
    design5MainHeading: "",
    gridCards: [createEmptyGridCard()],
    design6Chip: "",
    design6ExploreLink: "",
    design6MainHeading: "",
    design6SubHeading: "",
    design6Author: "",
    design6MidHeading: "",
    design6MidLink: "",
    teamCards: [createEmptyTeamCard()],
    design7Chip: "",
    design7ExploreLink: "",
    design7MainHeading: "",
    design9MiniHeading: "",
    design9MainHeading: "",
    design9Description: "",
    design9Cards: [createEmptyDesign9Card()],
    design10HeroMiniHeading: "", design10HeroMainHeading: "", design10HeroDescription: "", design10HeroImage: emptyImage(),
    design10StoryMiniHeading: "", design10StoryDescription: "", design10StoryParagraph: "", design10StorySmallParagraph: "",
    design10DefineMiniHeading: "", design10DefineCards: [createEmptyDesign10DefineCard()],
    design10JourneyMiniHeading: "", design10JourneyMainHeading: "", design10JourneyImage: emptyImage(), design10JourneyTimeline: [createEmptyDesign10TimelineItem()],
    design10LeadershipMiniHeading: "", design10LeadershipMainHeading: "", design10LeadershipCards: [createEmptyDesign10Leader()],
    design10GlobalMiniHeading: "", design10GlobalMainHeading: "", design10GlobalDescription: "", design10GlobalCards: [createEmptyDesign10GlobalCard()], design10GlobalImage: emptyImage(),
    design10ExploreMiniHeading: "", design10ExploreMainHeading: "", design10ExploreCards: [createEmptyDesign10ExploreCard()],
    design11HeroMiniHeading: "", design11HeroMainHeading: "", design11HeroDescription: "", design11HeroImage: emptyImage(),
    design11CapabilitiesMiniHeading: "", design11CapabilitiesMainHeading: "", design11CapabilitiesDescription: "", design11CapabilitiesCards: [createEmptyDesign11CapabilityCard()],
    design11ProcessMiniHeading: "", design11ProcessMainHeading: "", design11ProcessDescription: "", design11ProcessCards: [createEmptyDesign11ProcessCard()],
    design11EngagementMiniHeading: "", design11EngagementMainHeading: "", design11EngagementCards: [createEmptyDesign11EngagementCard()],
    design11FaqMiniHeading: "", design11FaqMainHeading: "", design11FaqDescription: "", design11FaqItems: [createEmptyDesign11FaqItem()],
    design11ExploreMiniHeading: "", design11ExploreMainHeading: "", design11ExploreCards: [createEmptyDesign11ExploreCard()],
    design12HeroMiniHeading: "", design12HeroMainHeading: "", design12HeroDescription: "", design12HeroImage: emptyImage(),
    design12ChallengeMiniHeading: "", design12ChallengeMainHeading: "", design12ChallengeDescription: "", design12ChallengeCard: createEmptyDesign12ChallengeCard(),
    design12HelpMiniHeading: "", design12HelpMainHeading: "", design12HelpCards: [createEmptyDesign12TextCard()],
    design12MethodologyMiniHeading: "", design12MethodologyMainHeading: "", design12MethodologyDescription: "", design12MethodologyCards: [createEmptyDesign12ProcessCard()],
    design12OutcomesMiniHeading: "", design12OutcomesMainHeading: "", design12OutcomeCards: [createEmptyDesign12OutcomeCard(), createEmptyDesign12OutcomeCard(), createEmptyDesign12OutcomeCard(), createEmptyDesign12OutcomeCard()],
    design12RelatedMiniHeading: "", design12RelatedMainHeading: "", design12RelatedCards: [createEmptyDesign12RelatedCard()],
    design12ExploreMiniHeading: "", design12ExploreMainHeading: "", design12ExploreCards: [createEmptyDesign12ExploreCard()],
    design13HeroMiniHeading: "", design13HeroMainHeading: "", design13HeroDescription: "", design13HeroImage: emptyImage(),
    design13ProcessMiniHeading: "", design13ProcessMainHeading: "", design13ProcessTimeline: [createEmptyDesign13TimelineItem()],
    design13FaqMiniHeading: "", design13FaqMainHeading: "", design13FaqItems: [createEmptyDesign13FaqItem()],
    design13ExploreMiniHeading: "", design13ExploreMainHeading: "", design13ExploreCards: [createEmptyDesign13ExploreCard()],
    design14HeroMiniHeading: "", design14HeroMainHeading: "", design14HeroDescription: "", design14HeroImage: emptyImage(),
    design14SectorsMiniHeading: "", design14SectorsMainHeading: "", design14SectorsDescription: "", design14SectorCards: [createEmptyDesign14SectorCard()],
    design14PerspectiveMiniHeading: "", design14PerspectiveMainHeading: "", design14PerspectiveDescription: "", design14PerspectiveCards: [createEmptyDesign14TextCard()],
    design14QuestionsMiniHeading: "", design14QuestionsMainHeading: "", design14QuestionsDescription: "", design14QuestionCards: [createEmptyDesign14TextCard()],
    design14Quote: "", design14QuoteDesignation: "",
    design14ExploreMiniHeading: "", design14ExploreMainHeading: "", design14ExploreCards: [createEmptyDesign14ExploreCard()],
    design15HeroMiniHeading: "", design15HeroMainHeading: "", design15HeroDescription: "",
    design15NoticeMiniHeading: "", design15NoticeMainHeading: "", design15NoticeDescription: "", design15FaqItems: [createEmptyDesign15FaqItem()],
    design15ExploreCards: [createEmptyDesign15ExploreCard()],
  };
}

export function dtoToEditValues(data: WebpageDto): WebpageEditFormValues {
  const keywords = Array.isArray(data.keywords)
    ? data.keywords.filter(Boolean)
    : [];
  const advertisements =
    Array.isArray(data.advertisements) && data.advertisements.length > 0
      ? data.advertisements.map((ad) => ({
          image: asImage(ad?.image),
          url: typeof ad?.url === "string" ? ad.url : "",
        }))
      : data.advertisementImage?.url || data.advertisementUrl
        ? [
            {
              image: asImage(data.advertisementImage),
              url: data.advertisementUrl || "",
            },
          ]
        : [{ image: emptyImage(), url: "" }];

  return {
    ...createEmptyEditValues(
      (data.templateType as WebpageTemplateType) || "design1",
    ),
    title: data.title || "",
    slug: data.slug || "",
    active: !!data.active,
    templateType: (data.templateType as WebpageTemplateType) || "design1",
    titleLine: data.titleLine || "",
    keywords: keywords.length > 0 ? keywords : [""],
    firstTitle: data.firstTitle || "",
    secondTitle: data.secondTitle || "",
    imageFirst: asImage(data.imageFirst),
    imageFirstMobile: asImage(data.imageFirstMobile),
    bannerImage: asImage(data.bannerImage),
    bannerImageMobile: asImage(data.bannerImageMobile),
    paragraphFirstImage: asImage(data.paragraphFirstImage),
    paragraphSecondImage: asImage(data.paragraphSecondImage),
    advertisementImage: asImage(data.advertisementImage),
    sideThumbImage: asImage(data.sideThumbImage),
    mainProfileImage: asImage(data.mainProfileImage),
    createTags: asStringArray(data.createTags),
    postedBy: {
      admin: !!(data.postedBy as { admin?: boolean } | null)?.admin,
      user: !!(data.postedBy as { user?: boolean } | null)?.user,
    },
    highlights:
      Array.isArray(data.highlights) && data.highlights.length > 0
        ? data.highlights.map((h) => ({
            title: h?.title || "",
            point: h?.point || "",
          }))
        : [{ title: "", point: "" }],
    paragraphSections: normalizeParagraphSections(data.paragraphSections),
    tableTitle: data.tableTitle || "",
    tableRows:
      Array.isArray(data.tableRows) && data.tableRows.length > 0
        ? data.tableRows.map((r) => ({
            column1: r?.column1 || "",
            column2: r?.column2 || "",
          }))
        : [{ column1: "", column2: "" }],
    blockquoteMainTitle: data.blockquoteMainTitle || "",
    blockquoteLeftTitle: data.blockquoteLeftTitle || "",
    blockquoteDescription: data.blockquoteDescription || "",
    blockquoteTags: asStringArray(data.blockquoteTags),
    accordionTags:
      Array.isArray(data.accordionTags) && data.accordionTags.length > 0
        ? data.accordionTags.map((a) => ({
            left: a?.left || "",
            right: a?.right || "",
          }))
        : [{ left: "", right: "" }],
    advertisements,
    advertisementUrl: data.advertisementUrl || "",
    sideThumbName: data.sideThumbName || "",
    sideThumbDesignation: data.sideThumbDesignation || "",
    sideThumbDescription: data.sideThumbDescription || "",
    facebookUrl: data.facebookUrl || "",
    youtubeUrl: data.youtubeUrl || "",
    instaUrl: data.instaUrl || "",
    googleUrl: data.googleUrl || "",
    imageGallery: Array.isArray(data.imageGallery)
      ? data.imageGallery.map(asImage)
      : [],
    notices:
      Array.isArray(data.notices) && data.notices.length > 0
        ? data.notices.map((n) => ({
            title: n?.title || "",
            description: n?.description || "",
            type: n?.type || "warning",
          }))
        : [{ title: "", description: "", type: "warning" }],
    searchLocations:
      Array.isArray(data.searchLocations) && data.searchLocations.length > 0
        ? data.searchLocations.map((s) => ({
            locationName: s?.locationName || "",
            count: s?.count || "",
            url: s?.url || "",
          }))
        : [{ locationName: "", count: "", url: "" }],
    design5Chip: data.design5Chip || "",
    design5MainHeading: data.design5MainHeading || "",
    gridCards: normalizeGridCards(data.gridCards),
    design6Chip: data.design6Chip || "",
    design6ExploreLink: data.design6ExploreLink || "",
    design6MainHeading: data.design6MainHeading || "",
    design6SubHeading: data.design6SubHeading || "",
    design6Author: data.design6Author || "",
    design6MidHeading: data.design6MidHeading || "",
    design6MidLink: data.design6MidLink || "",
    teamCards: normalizeTeamCards(data.teamCards),
    design7Chip: data.design7Chip || "",
    design7ExploreLink: data.design7ExploreLink || "",
    design7MainHeading: data.design7MainHeading || "",
    design9MiniHeading: data.design9MiniHeading || "",
    design9MainHeading: data.design9MainHeading || "",
    design9Description: data.design9Description || "",
    design9Cards: normalizeDesign9Cards(data.design9Cards),
    design10HeroMiniHeading: data.design10HeroMiniHeading || "", design10HeroMainHeading: data.design10HeroMainHeading || "", design10HeroDescription: data.design10HeroDescription || "", design10HeroImage: asImage(data.design10HeroImage),
    design10StoryMiniHeading: data.design10StoryMiniHeading || "", design10StoryDescription: data.design10StoryDescription || "", design10StoryParagraph: data.design10StoryParagraph || "", design10StorySmallParagraph: data.design10StorySmallParagraph || "",
    design10DefineMiniHeading: data.design10DefineMiniHeading || "", design10DefineCards: normalizeD10(data.design10DefineCards, "define") as WebpageEditFormValues["design10DefineCards"],
    design10JourneyMiniHeading: data.design10JourneyMiniHeading || "", design10JourneyMainHeading: data.design10JourneyMainHeading || "", design10JourneyImage: asImage(data.design10JourneyImage), design10JourneyTimeline: normalizeD10(data.design10JourneyTimeline, "timeline") as WebpageEditFormValues["design10JourneyTimeline"],
    design10LeadershipMiniHeading: data.design10LeadershipMiniHeading || "", design10LeadershipMainHeading: data.design10LeadershipMainHeading || "", design10LeadershipCards: normalizeD10(data.design10LeadershipCards, "leader") as WebpageEditFormValues["design10LeadershipCards"],
    design10GlobalMiniHeading: data.design10GlobalMiniHeading || "", design10GlobalMainHeading: data.design10GlobalMainHeading || "", design10GlobalDescription: data.design10GlobalDescription || "", design10GlobalCards: normalizeD10(data.design10GlobalCards, "global") as WebpageEditFormValues["design10GlobalCards"], design10GlobalImage: asImage(data.design10GlobalImage),
    design10ExploreMiniHeading: data.design10ExploreMiniHeading || "", design10ExploreMainHeading: data.design10ExploreMainHeading || "", design10ExploreCards: normalizeD10(data.design10ExploreCards, "explore") as WebpageEditFormValues["design10ExploreCards"],
    design11HeroMiniHeading: data.design11HeroMiniHeading || "", design11HeroMainHeading: data.design11HeroMainHeading || "", design11HeroDescription: data.design11HeroDescription || "", design11HeroImage: asImage(data.design11HeroImage),
    design11CapabilitiesMiniHeading: data.design11CapabilitiesMiniHeading || "", design11CapabilitiesMainHeading: data.design11CapabilitiesMainHeading || "", design11CapabilitiesDescription: data.design11CapabilitiesDescription || "", design11CapabilitiesCards: normalizeD11(data.design11CapabilitiesCards, "capability") as WebpageEditFormValues["design11CapabilitiesCards"],
    design11ProcessMiniHeading: data.design11ProcessMiniHeading || "", design11ProcessMainHeading: data.design11ProcessMainHeading || "", design11ProcessDescription: data.design11ProcessDescription || "", design11ProcessCards: normalizeD11(data.design11ProcessCards, "process") as WebpageEditFormValues["design11ProcessCards"],
    design11EngagementMiniHeading: data.design11EngagementMiniHeading || "", design11EngagementMainHeading: data.design11EngagementMainHeading || "", design11EngagementCards: normalizeD11(data.design11EngagementCards, "engagement") as WebpageEditFormValues["design11EngagementCards"],
    design11FaqMiniHeading: data.design11FaqMiniHeading || "", design11FaqMainHeading: data.design11FaqMainHeading || "", design11FaqDescription: data.design11FaqDescription || "", design11FaqItems: normalizeD11(data.design11FaqItems, "faq") as WebpageEditFormValues["design11FaqItems"],
    design11ExploreMiniHeading: data.design11ExploreMiniHeading || "", design11ExploreMainHeading: data.design11ExploreMainHeading || "", design11ExploreCards: normalizeD11(data.design11ExploreCards, "explore") as WebpageEditFormValues["design11ExploreCards"],
    design12HeroMiniHeading: data.design12HeroMiniHeading || "", design12HeroMainHeading: data.design12HeroMainHeading || "", design12HeroDescription: data.design12HeroDescription || "", design12HeroImage: asImage(data.design12HeroImage),
    design12ChallengeMiniHeading: data.design12ChallengeMiniHeading || "", design12ChallengeMainHeading: data.design12ChallengeMainHeading || "", design12ChallengeDescription: data.design12ChallengeDescription || "", design12ChallengeCard: normalizeD12Challenge(data.design12ChallengeCard),
    design12HelpMiniHeading: data.design12HelpMiniHeading || "", design12HelpMainHeading: data.design12HelpMainHeading || "", design12HelpCards: normalizeD12(data.design12HelpCards, "text") as WebpageEditFormValues["design12HelpCards"],
    design12MethodologyMiniHeading: data.design12MethodologyMiniHeading || "", design12MethodologyMainHeading: data.design12MethodologyMainHeading || "", design12MethodologyDescription: data.design12MethodologyDescription || "", design12MethodologyCards: normalizeD12(data.design12MethodologyCards, "process") as WebpageEditFormValues["design12MethodologyCards"],
    design12OutcomesMiniHeading: data.design12OutcomesMiniHeading || "", design12OutcomesMainHeading: data.design12OutcomesMainHeading || "", design12OutcomeCards: normalizeD12(data.design12OutcomeCards, "outcome") as WebpageEditFormValues["design12OutcomeCards"],
    design12RelatedMiniHeading: data.design12RelatedMiniHeading || "", design12RelatedMainHeading: data.design12RelatedMainHeading || "", design12RelatedCards: normalizeD12(data.design12RelatedCards, "related") as WebpageEditFormValues["design12RelatedCards"],
    design12ExploreMiniHeading: data.design12ExploreMiniHeading || "", design12ExploreMainHeading: data.design12ExploreMainHeading || "", design12ExploreCards: normalizeD12(data.design12ExploreCards, "explore") as WebpageEditFormValues["design12ExploreCards"],
    design13HeroMiniHeading: data.design13HeroMiniHeading || "", design13HeroMainHeading: data.design13HeroMainHeading || "", design13HeroDescription: data.design13HeroDescription || "", design13HeroImage: asImage(data.design13HeroImage),
    design13ProcessMiniHeading: data.design13ProcessMiniHeading || "", design13ProcessMainHeading: data.design13ProcessMainHeading || "", design13ProcessTimeline: normalizeD13(data.design13ProcessTimeline, "timeline") as WebpageEditFormValues["design13ProcessTimeline"],
    design13FaqMiniHeading: data.design13FaqMiniHeading || "", design13FaqMainHeading: data.design13FaqMainHeading || "", design13FaqItems: normalizeD13(data.design13FaqItems, "faq") as WebpageEditFormValues["design13FaqItems"],
    design13ExploreMiniHeading: data.design13ExploreMiniHeading || "", design13ExploreMainHeading: data.design13ExploreMainHeading || "", design13ExploreCards: normalizeD13(data.design13ExploreCards, "explore") as WebpageEditFormValues["design13ExploreCards"],
    design14HeroMiniHeading: data.design14HeroMiniHeading || "", design14HeroMainHeading: data.design14HeroMainHeading || "", design14HeroDescription: data.design14HeroDescription || "", design14HeroImage: asImage(data.design14HeroImage),
    design14SectorsMiniHeading: data.design14SectorsMiniHeading || "", design14SectorsMainHeading: data.design14SectorsMainHeading || "", design14SectorsDescription: data.design14SectorsDescription || "", design14SectorCards: normalizeD14(data.design14SectorCards, "sector") as WebpageEditFormValues["design14SectorCards"],
    design14PerspectiveMiniHeading: data.design14PerspectiveMiniHeading || "", design14PerspectiveMainHeading: data.design14PerspectiveMainHeading || "", design14PerspectiveDescription: data.design14PerspectiveDescription || "", design14PerspectiveCards: normalizeD14(data.design14PerspectiveCards, "text") as WebpageEditFormValues["design14PerspectiveCards"],
    design14QuestionsMiniHeading: data.design14QuestionsMiniHeading || "", design14QuestionsMainHeading: data.design14QuestionsMainHeading || "", design14QuestionsDescription: data.design14QuestionsDescription || "", design14QuestionCards: normalizeD14(data.design14QuestionCards, "text") as WebpageEditFormValues["design14QuestionCards"],
    design14Quote: data.design14Quote || "", design14QuoteDesignation: data.design14QuoteDesignation || "",
    design14ExploreMiniHeading: data.design14ExploreMiniHeading || "", design14ExploreMainHeading: data.design14ExploreMainHeading || "", design14ExploreCards: normalizeD14(data.design14ExploreCards, "explore") as WebpageEditFormValues["design14ExploreCards"],
    design15HeroMiniHeading: data.design15HeroMiniHeading || "", design15HeroMainHeading: data.design15HeroMainHeading || "", design15HeroDescription: data.design15HeroDescription || "",
    design15NoticeMiniHeading: data.design15NoticeMiniHeading || "", design15NoticeMainHeading: data.design15NoticeMainHeading || "", design15NoticeDescription: data.design15NoticeDescription || "", design15FaqItems: normalizeD15(data.design15FaqItems, "faq") as WebpageEditFormValues["design15FaqItems"],
    design15ExploreCards: normalizeD15(data.design15ExploreCards, "explore") as WebpageEditFormValues["design15ExploreCards"],
  };
}

export function hasTopTextSectionContent(
  values: WebpageEditFormValues,
): boolean {
  return Boolean(
    values.firstTitle?.trim() ||
      values.secondTitle?.trim() ||
      values.imageFirst?.url ||
      values.imageFirstMobile?.url ||
      values.createTags.some((t) => t.trim()),
  );
}

export function hasTopBannerContent(values: WebpageEditFormValues): boolean {
  return Boolean(values.bannerImage?.url || values.bannerImageMobile?.url);
}

function normalizeImageForPayload(image: WebpageImageAsset | null | undefined) {
  return {
    url: typeof image?.url === "string" ? image.url.trim() : "",
    key: typeof image?.key === "string" ? image.key.trim() : "",
  };
}

export function buildContentPayload(
  values: WebpageEditFormValues,
): Record<string, unknown> {
  const firstParagraph = values.paragraphSections[0];
  const slug = values.slug.trim().toLowerCase();
  return {
    title: values.title.trim(),
    ...(slug ? { slug } : {}),
    active: values.active,
    templateType: values.templateType,
    titleLine: values.titleLine.trim(),
    keywords: values.keywords.map((k) => k.trim()).filter(Boolean),
    firstTitle: values.firstTitle ?? "",
    secondTitle: values.secondTitle ?? "",
    imageFirst: normalizeImageForPayload(values.imageFirst),
    imageFirstMobile: normalizeImageForPayload(values.imageFirstMobile),
    bannerImage: normalizeImageForPayload(values.bannerImage),
    bannerImageMobile: normalizeImageForPayload(values.bannerImageMobile),
    paragraphFirstImage: normalizeImageForPayload(
      firstParagraph?.firstImage || emptyImage(),
    ),
    paragraphSecondImage: normalizeImageForPayload(
      firstParagraph?.secondImage || emptyImage(),
    ),
    advertisementImage: normalizeImageForPayload(values.advertisementImage),
    sideThumbImage: normalizeImageForPayload(values.sideThumbImage),
    mainProfileImage: normalizeImageForPayload(values.mainProfileImage),
    createTags: values.createTags,
    postedBy: values.postedBy,
    highlights: values.highlights,
    paragraphSections: values.paragraphSections,
    tableTitle: values.tableTitle ?? "",
    tableRows: values.tableRows,
    blockquoteMainTitle: values.blockquoteMainTitle ?? "",
    blockquoteLeftTitle: values.blockquoteLeftTitle ?? "",
    blockquoteDescription: values.blockquoteDescription ?? "",
    blockquoteTags: values.blockquoteTags,
    accordionTags: values.accordionTags,
    advertisements: values.advertisements,
    advertisementUrl: values.advertisementUrl ?? "",
    sideThumbName: values.sideThumbName ?? "",
    sideThumbDesignation: values.sideThumbDesignation ?? "",
    sideThumbDescription: values.sideThumbDescription ?? "",
    facebookUrl: values.facebookUrl ?? "",
    youtubeUrl: values.youtubeUrl ?? "",
    instaUrl: values.instaUrl ?? "",
    googleUrl: values.googleUrl ?? "",
    imageGallery: values.imageGallery,
    notices: values.notices,
    searchLocations: values.searchLocations,
    design5Chip: values.design5Chip ?? "",
    design5MainHeading: values.design5MainHeading ?? "",
    gridCards: values.gridCards,
    design6Chip: values.design6Chip ?? "",
    design6ExploreLink: values.design6ExploreLink ?? "",
    design6MainHeading: values.design6MainHeading ?? "",
    design6SubHeading: values.design6SubHeading ?? "",
    design6Author: values.design6Author ?? "",
    design6MidHeading: values.design6MidHeading ?? "",
    design6MidLink: values.design6MidLink ?? "",
    teamCards: values.teamCards,
    design7Chip: values.design7Chip ?? "",
    design7ExploreLink: values.design7ExploreLink ?? "",
    design7MainHeading: values.design7MainHeading ?? "",
    design9MiniHeading: values.design9MiniHeading ?? "",
    design9MainHeading: values.design9MainHeading ?? "",
    design9Description: values.design9Description ?? "",
    design9Cards: values.design9Cards,
    design10HeroMiniHeading: values.design10HeroMiniHeading, design10HeroMainHeading: values.design10HeroMainHeading, design10HeroDescription: values.design10HeroDescription, design10HeroImage: normalizeImageForPayload(values.design10HeroImage),
    design10StoryMiniHeading: values.design10StoryMiniHeading, design10StoryDescription: values.design10StoryDescription, design10StoryParagraph: values.design10StoryParagraph, design10StorySmallParagraph: values.design10StorySmallParagraph,
    design10DefineMiniHeading: values.design10DefineMiniHeading, design10DefineCards: values.design10DefineCards,
    design10JourneyMiniHeading: values.design10JourneyMiniHeading, design10JourneyMainHeading: values.design10JourneyMainHeading, design10JourneyImage: normalizeImageForPayload(values.design10JourneyImage), design10JourneyTimeline: values.design10JourneyTimeline,
    design10LeadershipMiniHeading: values.design10LeadershipMiniHeading, design10LeadershipMainHeading: values.design10LeadershipMainHeading, design10LeadershipCards: values.design10LeadershipCards,
    design10GlobalMiniHeading: values.design10GlobalMiniHeading, design10GlobalMainHeading: values.design10GlobalMainHeading, design10GlobalDescription: values.design10GlobalDescription, design10GlobalCards: values.design10GlobalCards, design10GlobalImage: normalizeImageForPayload(values.design10GlobalImage),
    design10ExploreMiniHeading: values.design10ExploreMiniHeading, design10ExploreMainHeading: values.design10ExploreMainHeading, design10ExploreCards: values.design10ExploreCards,
    design11HeroMiniHeading: values.design11HeroMiniHeading, design11HeroMainHeading: values.design11HeroMainHeading, design11HeroDescription: values.design11HeroDescription, design11HeroImage: normalizeImageForPayload(values.design11HeroImage),
    design11CapabilitiesMiniHeading: values.design11CapabilitiesMiniHeading, design11CapabilitiesMainHeading: values.design11CapabilitiesMainHeading, design11CapabilitiesDescription: values.design11CapabilitiesDescription, design11CapabilitiesCards: values.design11CapabilitiesCards,
    design11ProcessMiniHeading: values.design11ProcessMiniHeading, design11ProcessMainHeading: values.design11ProcessMainHeading, design11ProcessDescription: values.design11ProcessDescription, design11ProcessCards: values.design11ProcessCards,
    design11EngagementMiniHeading: values.design11EngagementMiniHeading, design11EngagementMainHeading: values.design11EngagementMainHeading, design11EngagementCards: values.design11EngagementCards,
    design11FaqMiniHeading: values.design11FaqMiniHeading, design11FaqMainHeading: values.design11FaqMainHeading, design11FaqDescription: values.design11FaqDescription, design11FaqItems: values.design11FaqItems,
    design11ExploreMiniHeading: values.design11ExploreMiniHeading, design11ExploreMainHeading: values.design11ExploreMainHeading, design11ExploreCards: values.design11ExploreCards,
    design12HeroMiniHeading: values.design12HeroMiniHeading, design12HeroMainHeading: values.design12HeroMainHeading, design12HeroDescription: values.design12HeroDescription, design12HeroImage: normalizeImageForPayload(values.design12HeroImage),
    design12ChallengeMiniHeading: values.design12ChallengeMiniHeading, design12ChallengeMainHeading: values.design12ChallengeMainHeading, design12ChallengeDescription: values.design12ChallengeDescription, design12ChallengeCard: values.design12ChallengeCard,
    design12HelpMiniHeading: values.design12HelpMiniHeading, design12HelpMainHeading: values.design12HelpMainHeading, design12HelpCards: values.design12HelpCards,
    design12MethodologyMiniHeading: values.design12MethodologyMiniHeading, design12MethodologyMainHeading: values.design12MethodologyMainHeading, design12MethodologyDescription: values.design12MethodologyDescription, design12MethodologyCards: values.design12MethodologyCards,
    design12OutcomesMiniHeading: values.design12OutcomesMiniHeading, design12OutcomesMainHeading: values.design12OutcomesMainHeading, design12OutcomeCards: values.design12OutcomeCards,
    design12RelatedMiniHeading: values.design12RelatedMiniHeading, design12RelatedMainHeading: values.design12RelatedMainHeading, design12RelatedCards: values.design12RelatedCards,
    design12ExploreMiniHeading: values.design12ExploreMiniHeading, design12ExploreMainHeading: values.design12ExploreMainHeading, design12ExploreCards: values.design12ExploreCards,
    design13HeroMiniHeading: values.design13HeroMiniHeading, design13HeroMainHeading: values.design13HeroMainHeading, design13HeroDescription: values.design13HeroDescription, design13HeroImage: normalizeImageForPayload(values.design13HeroImage),
    design13ProcessMiniHeading: values.design13ProcessMiniHeading, design13ProcessMainHeading: values.design13ProcessMainHeading, design13ProcessTimeline: values.design13ProcessTimeline,
    design13FaqMiniHeading: values.design13FaqMiniHeading, design13FaqMainHeading: values.design13FaqMainHeading, design13FaqItems: values.design13FaqItems,
    design13ExploreMiniHeading: values.design13ExploreMiniHeading, design13ExploreMainHeading: values.design13ExploreMainHeading, design13ExploreCards: values.design13ExploreCards,
    design14HeroMiniHeading: values.design14HeroMiniHeading, design14HeroMainHeading: values.design14HeroMainHeading, design14HeroDescription: values.design14HeroDescription, design14HeroImage: normalizeImageForPayload(values.design14HeroImage),
    design14SectorsMiniHeading: values.design14SectorsMiniHeading, design14SectorsMainHeading: values.design14SectorsMainHeading, design14SectorsDescription: values.design14SectorsDescription, design14SectorCards: values.design14SectorCards,
    design14PerspectiveMiniHeading: values.design14PerspectiveMiniHeading, design14PerspectiveMainHeading: values.design14PerspectiveMainHeading, design14PerspectiveDescription: values.design14PerspectiveDescription, design14PerspectiveCards: values.design14PerspectiveCards,
    design14QuestionsMiniHeading: values.design14QuestionsMiniHeading, design14QuestionsMainHeading: values.design14QuestionsMainHeading, design14QuestionsDescription: values.design14QuestionsDescription, design14QuestionCards: values.design14QuestionCards,
    design14Quote: values.design14Quote, design14QuoteDesignation: values.design14QuoteDesignation,
    design14ExploreMiniHeading: values.design14ExploreMiniHeading, design14ExploreMainHeading: values.design14ExploreMainHeading, design14ExploreCards: values.design14ExploreCards,
    design15HeroMiniHeading: values.design15HeroMiniHeading, design15HeroMainHeading: values.design15HeroMainHeading, design15HeroDescription: values.design15HeroDescription,
    design15NoticeMiniHeading: values.design15NoticeMiniHeading, design15NoticeMainHeading: values.design15NoticeMainHeading, design15NoticeDescription: values.design15NoticeDescription, design15FaqItems: values.design15FaqItems,
    design15ExploreCards: values.design15ExploreCards,
  };
}
