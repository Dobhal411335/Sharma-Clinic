"use client";

import { useState } from "react";
import {
  AlignLeft,
  FileText,
  Image as ImageIcon,
  Plus,
  Quote,
  Settings,
  Share2,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  Button,
  ImageAssetField,
  Input,
  Label,
  PostedByField,
  RichHtmlField, 
  SectionCard,
  SeoKeywordsField,
  StringListField,
  Textarea,
} from "@/components/admin/cms/webpages/webpage-form-fields";
import { createEmptyParagraphSection } from "@/components/admin/cms/webpages/webpage-form-state";
import { uploadWebpageImage } from "@/services/api/webpages";
import type { WebpageEditFormValues } from "@/types/admin/webpages";

export type ClassicArticleVariant = "design1" | "design2" | "design3";

type Props = {
  
  webpageId: string;
  values: WebpageEditFormValues;
  setValues: React.Dispatch<React.SetStateAction<WebpageEditFormValues>>;
  variant: ClassicArticleVariant;
  /** When false, skip SEO / top hero fields (used by design4 which owns its header). */
  includePageSettings?: boolean;
};

/**
 * Shared field sets for Hotel design1 / design2 / design3.
 * design3: no sidebar ad, accordion, or side-thumb blocks.
 */
export function ClassicArticleSections({
  webpageId,
  values,
  setValues,
  variant,
  includePageSettings = true,
}: Props) {
  const isDesign3 = variant === "design3";
  const showSidebarBlocks = !isDesign3;
  const [topSectionView, setTopSectionView] = useState<"all" | "bannerOnly">(
    "all",
  );

  const patch = <K extends keyof WebpageEditFormValues>(
    key: K,
    value: WebpageEditFormValues[K],
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const uploadInline = async (file: File) => {
    const uploaded = await uploadWebpageImage(file, webpageId);
    return uploaded.url;
  };

  return (
    <>
      {includePageSettings ? (
      <SectionCard title="Page settings" icon={<Settings className="size-4" />}>
        <SeoKeywordsField
          titleLine={values.titleLine}
          keywords={values.keywords}
          onTitleLineChange={(v) => patch("titleLine", v)}
          onKeywordsChange={(v) => patch("keywords", v)}
        />

        <div className="space-y-2">
          <Label>Top section view layout</Label>
          <div className="inline-flex rounded-xl border border-border bg-muted/40 p-1">
            <Button
              type="button"
              size="sm"
              variant={topSectionView === "all" ? "secondary" : "ghost"}
              onClick={() => setTopSectionView("all")}
            >
              All inputs
            </Button>
            <Button
              type="button"
              size="sm"
              variant={topSectionView === "bannerOnly" ? "secondary" : "ghost"}
              onClick={() => setTopSectionView("bannerOnly")}
            >
              Banner image only
            </Button>
          </div>
        </div>

        {topSectionView === "all" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstTitle">Main top tag line</Label>
              <Input
                id="firstTitle"
                value={values.firstTitle}
                onChange={(e) => patch("firstTitle", e.target.value)}
                placeholder="Enter main tagline…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondTitle">Main short tag line</Label>
              <Input
                id="secondTitle"
                value={values.secondTitle}
                onChange={(e) => patch("secondTitle", e.target.value)}
                placeholder="Enter subtitle tagline…"
              />
            </div>
          </div>
        ) : null}

        {topSectionView === "all" && !isDesign3 ? (
          <>
            <ImageAssetField
             
              webpageId={webpageId}
              inputId="image-first"
              label="Main top image (laptop)"
              hint="Supports PNG, JPG, JPEG"
              value={values.imageFirst}
              onChange={(v) => patch("imageFirst", v)}
            />
            <ImageAssetField
             
              webpageId={webpageId}
              inputId="image-first-mobile"
              label="Main top image (mobile)"
              hint="Recommended size: 800x1000 px"
              value={values.imageFirstMobile}
              onChange={(v) => patch("imageFirstMobile", v)}
            />
          </>
        ) : null}

        {/* {topSectionView === "all" && !isDesign3 ? (
          <>
            <ImageAssetField
             
              webpageId={webpageId}
              inputId="image-first-d3"
              label="Hero image"
              value={values.imageFirst}
              onChange={(v) => patch("imageFirst", v)}
            />
            <ImageAssetField
             
              webpageId={webpageId}
              inputId="main-profile-d3"
              label="Main profile image"
              value={values.mainProfileImage}
              onChange={(v) => patch("mainProfileImage", v)}
            />
          </>
        ) : null} */}

        {topSectionView === "bannerOnly" ? (
          <>
            <ImageAssetField
             
              webpageId={webpageId}
              inputId="banner-image"
              label="Main top banner image (laptop)"
              hint="Recommended size: 1200x400 px"
              value={values.bannerImage}
              onChange={(v) => patch("bannerImage", v)}
            />
            <ImageAssetField
             
              webpageId={webpageId}
              inputId="banner-image-mobile"
              label="Main top banner image (mobile)"
              hint="Recommended size: 800x1000 px"
              value={values.bannerImageMobile}
              onChange={(v) => patch("bannerImageMobile", v)}
            />
          </>
        ) : null}

        {isDesign3 ? (
          <>
            <StringListField
              label="Create tags"
              values={values.createTags}
              onChange={(v) => patch("createTags", v)}
              placeholder="Add new tag…"
            />
            <PostedByField
              admin={values.postedBy.admin}
              user={values.postedBy.user}
              onChange={(v) => patch("postedBy", v)}
            />
          </>
        ) : (
          <StringListField
            label="Create tags"
            values={values.createTags}
            onChange={(v) => patch("createTags", v)}
            placeholder="Add new tag…"
          />
        )}
      </SectionCard>
      ) : null}

      <SectionCard title="Highlights" icon={<Sparkles className="size-4" />}>
        <div className="space-y-3">
          {values.highlights.map((row, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 md:grid-cols-[1fr_2fr_auto]"
            >
              <Input
                value={row.title}
                placeholder="Highlight title"
                onChange={(e) => {
                  const next = [...values.highlights];
                  next[index] = { ...next[index], title: e.target.value };
                  patch("highlights", next);
                }}
              />
              <Input
                value={row.point}
                placeholder="Bullet point description…"
                onChange={(e) => {
                  const next = [...values.highlights];
                  next[index] = { ...next[index], point: e.target.value };
                  patch("highlights", next);
                }}
              />
              <div className="flex gap-1.5">
                <Button
                  type="button"
                  size="icon"
                  onClick={() =>
                    patch("highlights", [
                      ...values.highlights,
                      { title: "", point: "" },
                    ])
                  }
                >
                  <Plus className="size-4" />
                </Button>
                {values.highlights.length > 1 ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="border-rose-200 text-rose-600"
                    onClick={() =>
                      patch(
                        "highlights",
                        values.highlights.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Paragraph sections"
        icon={<AlignLeft className="size-4" />}
      >
        <div className="space-y-6">
          {values.paragraphSections.map((row, index) => (
            <div
              key={index}
              className="space-y-4 rounded-xl border border-border bg-muted/10 p-5"
            >
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                  Section #{index + 1}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      patch("paragraphSections", [
                        ...values.paragraphSections,
                        createEmptyParagraphSection(),
                      ])
                    }
                  >
                    <Plus className="mr-1 size-3.5" /> Add section
                  </Button>
                  {values.paragraphSections.length > 1 ? (
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="border-rose-200 text-rose-600"
                      onClick={() =>
                        patch(
                          "paragraphSections",
                          values.paragraphSections.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Paragraph heading title</Label>
                <Input
                  value={row.title}
                  onChange={(e) => {
                    const next = [...values.paragraphSections];
                    next[index] = { ...next[index], title: e.target.value };
                    patch("paragraphSections", next);
                  }}
                />
              </div>

              <RichHtmlField
                label="Paragraph description content"
                value={row.description}
                onChange={(html) => {
                  const next = [...values.paragraphSections];
                  next[index] = { ...next[index], description: html };
                  patch("paragraphSections", next);
                }}
                onUploadImage={uploadInline}
              />

              <div className="grid gap-6 pt-2 md:grid-cols-2">
                <ImageAssetField
                 
                  webpageId={webpageId}
                  inputId={`para-first-${index}`}
                  label="First image asset"
                  value={row.firstImage}
                  onChange={(img) => {
                    const next = [...values.paragraphSections];
                    next[index] = { ...next[index], firstImage: img };
                    patch("paragraphSections", next);
                  }}
                />
                <ImageAssetField
                 
                  webpageId={webpageId}
                  inputId={`para-second-${index}`}
                  label="Second image asset"
                  value={row.secondImage}
                  onChange={(img) => {
                    const next = [...values.paragraphSections];
                    next[index] = { ...next[index], secondImage: img };
                    patch("paragraphSections", next);
                  }}
                />
                <div className="space-y-3 md:col-span-2">
                  <Label>Bullet point records</Label>
                  {(row.bulletPoints || [""]).map((bullet, bulletIndex) => (
                    <div key={bulletIndex} className="flex items-center gap-2">
                      <Input
                        value={bullet}
                        placeholder="Type bullet point…"
                        onChange={(e) => {
                          const next = [...values.paragraphSections];
                          const bullets = [
                            ...(next[index].bulletPoints || [""]),
                          ];
                          bullets[bulletIndex] = e.target.value;
                          next[index] = {
                            ...next[index],
                            bulletPoints: bullets,
                          };
                          patch("paragraphSections", next);
                        }}
                      />
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => {
                          const next = [...values.paragraphSections];
                          next[index] = {
                            ...next[index],
                            bulletPoints: [
                              ...(next[index].bulletPoints || []),
                              "",
                            ],
                          };
                          patch("paragraphSections", next);
                        }}
                      >
                        <Plus className="size-4" />
                      </Button>
                      {(row.bulletPoints || []).length > 1 ? (
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="border-rose-200 text-rose-600"
                          onClick={() => {
                            const next = [...values.paragraphSections];
                            next[index] = {
                              ...next[index],
                              bulletPoints: (next[index].bulletPoints || []).filter(
                                (_, i) => i !== bulletIndex,
                              ),
                            };
                            patch("paragraphSections", next);
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Table rows layout" icon={<FileText className="size-4" />}>
        <div className="space-y-2">
          <Label htmlFor="tableTitle">Table main heading title</Label>
          <Input
            id="tableTitle"
            value={values.tableTitle}
            onChange={(e) => patch("tableTitle", e.target.value)}
          />
        </div>
        <div className="space-y-4">
          <Label>Table data row records</Label>
          {values.tableRows.map((row, index) => (
            <div
              key={index}
              className="space-y-3 rounded-xl border border-border bg-muted/20 p-4"
            >
              <div className="flex gap-2">
                <Input
                  value={row.column1}
                  placeholder="Column 1 title (left side)"
                  onChange={(e) => {
                    const next = [...values.tableRows];
                    next[index] = { ...next[index], column1: e.target.value };
                    patch("tableRows", next);
                  }}
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={() =>
                    patch("tableRows", [
                      ...values.tableRows,
                      { column1: "", column2: "" },
                    ])
                  }
                >
                  <Plus className="size-4" />
                </Button>
                {values.tableRows.length > 1 ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="border-rose-200 text-rose-600"
                    onClick={() =>
                      patch(
                        "tableRows",
                        values.tableRows.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </div>
              <RichHtmlField
                label="Column 2 details content"
                value={row.column2}
                onChange={(html) => {
                  const next = [...values.tableRows];
                  next[index] = { ...next[index], column2: html };
                  patch("tableRows", next);
                }}
                onUploadImage={uploadInline}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Blockquote settings" icon={<Quote className="size-4" />}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Blockquote main title</Label>
            <Input
              value={values.blockquoteMainTitle}
              onChange={(e) => patch("blockquoteMainTitle", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Blockquote left para</Label>
            <Input
              value={values.blockquoteLeftTitle}
              onChange={(e) => patch("blockquoteLeftTitle", e.target.value)}
            />
          </div>
        </div>
        <RichHtmlField
          label="Blockquote HTML description"
          value={values.blockquoteDescription}
          onChange={(html) => patch("blockquoteDescription", html)}
          onUploadImage={uploadInline}
        />
        <StringListField
          label="Blockquote tags list"
          values={values.blockquoteTags}
          onChange={(v) => patch("blockquoteTags", v)}
        />
      </SectionCard>

      {showSidebarBlocks ? (
        <>
          <SectionCard
            title="Sidebar advertisement"
            icon={<Share2 className="size-4" />}
          >
            <div className="grid gap-6 md:grid-cols-2">
              <ImageAssetField
               
                webpageId={webpageId}
                inputId="sidebar-ad-image"
                label="Advertisement banner image"
                value={values.advertisementImage}
                onChange={(v) => patch("advertisementImage", v)}
              />
              <div className="space-y-2">
                <Label>Advertisement redirect URL</Label>
                <Input
                  value={values.advertisementUrl}
                  onChange={(e) => patch("advertisementUrl", e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Accordion tags" icon={<Plus className="size-4" />}>
            <div className="space-y-3">
              {values.accordionTags.map((row, index) => (
                <div
                  key={index}
                  className="grid items-end gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 md:grid-cols-[1fr_2fr_auto]"
                >
                  <div className="space-y-2">
                    <Label>Accordion main title</Label>
                    <Input
                      value={row.left}
                      onChange={(e) => {
                        const next = [...values.accordionTags];
                        next[index] = { ...next[index], left: e.target.value };
                        patch("accordionTags", next);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Accordion description</Label>
                    <Input
                      value={row.right}
                      onChange={(e) => {
                        const next = [...values.accordionTags];
                        next[index] = { ...next[index], right: e.target.value };
                        patch("accordionTags", next);
                      }}
                    />
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      type="button"
                      size="icon"
                      onClick={() =>
                        patch("accordionTags", [
                          ...values.accordionTags,
                          { left: "", right: "" },
                        ])
                      }
                    >
                      <Plus className="size-4" />
                    </Button>
                    {values.accordionTags.length > 1 ? (
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="border-rose-200 text-rose-600"
                        onClick={() =>
                          patch(
                            "accordionTags",
                            values.accordionTags.filter((_, i) => i !== index),
                          )
                        }
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Side thumb blog"
            icon={<ImageIcon className="size-4" />}
          >
            <div className="grid gap-6 md:grid-cols-2">
              <ImageAssetField
               
                webpageId={webpageId}
                inputId="side-thumb-image"
                label="Side thumb image"
                value={values.sideThumbImage}
                onChange={(v) => patch("sideThumbImage", v)}
              />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Side thumb name</Label>
                  <Input
                    value={values.sideThumbName}
                    onChange={(e) => patch("sideThumbName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Side thumb designation</Label>
                  <Input
                    value={values.sideThumbDesignation}
                    onChange={(e) =>
                      patch("sideThumbDesignation", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Side thumb description</Label>
                  <Textarea
                    value={values.sideThumbDescription}
                    onChange={(e) =>
                      patch("sideThumbDescription", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-4 border-t border-border pt-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Facebook profile</Label>
                <Input
                  value={values.facebookUrl}
                  onChange={(e) => patch("facebookUrl", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>YouTube channel</Label>
                <Input
                  value={values.youtubeUrl}
                  onChange={(e) => patch("youtubeUrl", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Instagram handle</Label>
                <Input
                  value={values.instaUrl}
                  onChange={(e) => patch("instaUrl", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Google business link</Label>
                <Input
                  value={values.googleUrl}
                  onChange={(e) => patch("googleUrl", e.target.value)}
                />
              </div>
            </div>
          </SectionCard>
        </>
      ) : null}
    </>
  );
}