"use client";

import { useState } from "react";
import { Plus, Settings, Sparkles, Trash2 } from "lucide-react";

import {
  Button,
  ImageAssetField,
  Input,
  Label,
  SectionCard,
  SeoKeywordsField,
  Textarea,
} from "@/components/admin/cms/webpages/webpage-form-fields";
import {
  createEmptyGridCard,
  emptyImage,
} from "@/components/admin/cms/webpages/webpage-form-state";
import { showError, showSuccess } from "@/lib/toast";
import { ApiError } from "@/services/api/errors";
import { uploadWebpageImage } from "@/services/api/webpages";
import type { WebpageEditFormValues, WebpageImageAsset } from "@/types/admin/webpages";

export function Design7Form({
  webpageId,
  values,
  setValues,
}: {
  
  webpageId: string;
  values: WebpageEditFormValues;
  setValues: React.Dispatch<React.SetStateAction<WebpageEditFormValues>>;
}) {
  const [uploadingBento, setUploadingBento] = useState(false);
  const patch = <K extends keyof WebpageEditFormValues>(
    key: K,
    value: WebpageEditFormValues[K],
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .replace(/[\s\W-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleBentoUpload = async (
    cardIndex: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setUploadingBento(true);
    try {
      const uploaded: WebpageImageAsset[] = [];
      for (const file of files) {
        const result = await uploadWebpageImage(file, webpageId);
        uploaded.push({ url: result.url, key: result.key });
      }
      const next = [...values.gridCards];
      next[cardIndex] = {
        ...next[cardIndex],
        bentoImages: [...(next[cardIndex].bentoImages || []), ...uploaded],
      };
      patch("gridCards", next);
      showSuccess("Images uploaded");
    } catch (error) {
      showError(
        error instanceof ApiError ? error.message : "Image upload failed",
      );
    } finally {
      setUploadingBento(false);
      event.target.value = "";
    }
  };

  return (
    <>
      <SectionCard title="Page settings" icon={<Settings className="size-4" />}>
        <SeoKeywordsField
          titleLine={values.titleLine}
          keywords={values.keywords}
          onTitleLineChange={(v) => patch("titleLine", v)}
          onKeywordsChange={(v) => patch("keywords", v)}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Main top tag line</Label>
            <Input
              value={values.firstTitle}
              onChange={(e) => patch("firstTitle", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Main short tag line</Label>
            <Input
              value={values.secondTitle}
              onChange={(e) => patch("secondTitle", e.target.value)}
            />
          </div>
        </div>
        <ImageAssetField
         
          webpageId={webpageId}
          inputId="d7-banner"
          label="Banner image (laptop)"
          value={values.bannerImage}
          onChange={(v) => patch("bannerImage", v)}
        />
        <ImageAssetField
         
          webpageId={webpageId}
          inputId="d7-banner-mobile"
          label="Banner image (mobile)"
          value={values.bannerImageMobile}
          onChange={(v) => patch("bannerImageMobile", v)}
        />
      </SectionCard>

      <SectionCard
        title="Design 7 layout config"
        icon={<Sparkles className="size-4" />}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Top chip text</Label>
            <Input
              value={values.design7Chip}
              onChange={(e) => patch("design7Chip", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Explore link URL</Label>
            <Input
              value={values.design7ExploreLink}
              onChange={(e) => patch("design7ExploreLink", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Main heading section</Label>
          <Input
            value={values.design7MainHeading}
            onChange={(e) => patch("design7MainHeading", e.target.value)}
          />
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-5">
          <span className="text-xs font-bold tracking-wide uppercase">
            Gallery image cards
          </span>
          {values.gridCards.map((card, index) => (
            <div
              key={index}
              className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                  Image card #{index + 1}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="border-rose-200 text-rose-600"
                  onClick={() =>
                    patch(
                      "gridCards",
                      values.gridCards.filter((_, i) => i !== index),
                    )
                  }
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <ImageAssetField
                 
                  webpageId={webpageId}
                  inputId={`d7-grid-${index}`}
                  label="Card cover image"
                  value={card.image || emptyImage()}
                  onChange={(img) => {
                    const next = [...values.gridCards];
                    next[index] = { ...next[index], image: img };
                    patch("gridCards", next);
                  }}
                />
                <div className="grid gap-3.5 md:col-span-2 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Hover chip name</Label>
                    <Input
                      value={card.chipName}
                      onChange={(e) => {
                        const next = [...values.gridCards];
                        next[index] = {
                          ...next[index],
                          chipName: e.target.value,
                        };
                        patch("gridCards", next);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Hover title (link text)</Label>
                    <Input
                      value={card.title}
                      onChange={(e) => {
                        const next = [...values.gridCards];
                        next[index] = {
                          ...next[index],
                          title: e.target.value,
                          gallerySlug: slugify(e.target.value),
                        };
                        patch("gridCards", next);
                      }}
                    />
                  </div>

                  <div className="space-y-4 rounded-xl border border-blue-200/60 bg-blue-50/20 p-4 md:col-span-2">
                    <div>
                      <p className="text-sm font-bold text-blue-900">
                        Gallery detail page content
                      </p>
                      <p className="text-[10px] text-blue-600">
                        Slug: /gallery/{card.gallerySlug || "<auto-generated>"}
                      </p>
                    </div>
                    <div className="grid gap-3.5 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={card.galleryDate || ""}
                          onChange={(e) => {
                            const next = [...values.gridCards];
                            next[index] = {
                              ...next[index],
                              galleryDate: e.target.value,
                            };
                            patch("gridCards", next);
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Posted by</Label>
                        <Input
                          value={card.postedBy || ""}
                          onChange={(e) => {
                            const next = [...values.gridCards];
                            next[index] = {
                              ...next[index],
                              postedBy: e.target.value,
                            };
                            patch("gridCards", next);
                          }}
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>Description paragraph</Label>
                        <Textarea
                          rows={6}
                          value={card.galleryDescription || ""}
                          onChange={(e) => {
                            const next = [...values.gridCards];
                            next[index] = {
                              ...next[index],
                              galleryDescription: e.target.value,
                            };
                            patch("gridCards", next);
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Bento gallery images</Label>
                      <div className="flex flex-wrap gap-2.5">
                        {(card.bentoImages || []).map((img, imgIdx) => (
                          <div
                            key={imgIdx}
                            className="relative h-16 w-16 overflow-hidden rounded-lg border border-border bg-background"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.url}
                              alt="Bento"
                              className="h-full w-full object-cover"
                            />
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="outline"
                              className="absolute top-1 right-1 size-6 border-rose-200 text-rose-600"
                              onClick={() => {
                                const next = [...values.gridCards];
                                next[index] = {
                                  ...next[index],
                                  bentoImages: (
                                    next[index].bentoImages || []
                                  ).filter((_, i) => i !== imgIdx),
                                };
                                patch("gridCards", next);
                              }}
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        ))}
                        <label className="relative flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-300 bg-background text-blue-500 hover:bg-blue-50">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="absolute inset-0 cursor-pointer opacity-0"
                            disabled={uploadingBento}
                            onChange={(e) => handleBentoUpload(index, e)}
                          />
                          <span className="text-sm font-bold">+</span>
                          <span className="text-[8px] font-semibold">
                            {uploadingBento ? "…" : "Upload"}
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>YouTube shorts</Label>
                      {(card.youtubeShorts || []).map((url, shortIdx) => (
                        <div key={shortIdx} className="flex gap-2">
                          <Input
                            value={url}
                            placeholder="YouTube video URL…"
                            onChange={(e) => {
                              const next = [...values.gridCards];
                              const shorts = [
                                ...(next[index].youtubeShorts || []),
                              ];
                              shorts[shortIdx] = e.target.value;
                              next[index] = {
                                ...next[index],
                                youtubeShorts: shorts,
                              };
                              patch("gridCards", next);
                            }}
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className="border-rose-200 text-rose-600"
                            onClick={() => {
                              const next = [...values.gridCards];
                              next[index] = {
                                ...next[index],
                                youtubeShorts: (
                                  next[index].youtubeShorts || []
                                ).filter((_, i) => i !== shortIdx),
                              };
                              patch("gridCards", next);
                            }}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const next = [...values.gridCards];
                          next[index] = {
                            ...next[index],
                            youtubeShorts: [
                              ...(next[index].youtubeShorts || []),
                              "",
                            ],
                          };
                          patch("gridCards", next);
                        }}
                      >
                        + Add short URL
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>YouTube highlight videos</Label>
                      {(card.youtubeVideos || []).map((url, vidIdx) => (
                        <div key={vidIdx} className="flex gap-2">
                          <Input
                            value={url}
                            placeholder="YouTube video URL…"
                            onChange={(e) => {
                              const next = [...values.gridCards];
                              const videos = [
                                ...(next[index].youtubeVideos || []),
                              ];
                              videos[vidIdx] = e.target.value;
                              next[index] = {
                                ...next[index],
                                youtubeVideos: videos,
                              };
                              patch("gridCards", next);
                            }}
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className="border-rose-200 text-rose-600"
                            onClick={() => {
                              const next = [...values.gridCards];
                              next[index] = {
                                ...next[index],
                                youtubeVideos: (
                                  next[index].youtubeVideos || []
                                ).filter((_, i) => i !== vidIdx),
                              };
                              patch("gridCards", next);
                            }}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const next = [...values.gridCards];
                          next[index] = {
                            ...next[index],
                            youtubeVideos: [
                              ...(next[index].youtubeVideos || []),
                              "",
                            ],
                          };
                          patch("gridCards", next);
                        }}
                      >
                        + Add video URL
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            onClick={() =>
              patch("gridCards", [...values.gridCards, createEmptyGridCard()])
            }
          >
            <Plus className="mr-1 size-3.5" /> Add gallery card
          </Button>
        </div>
      </SectionCard>
    </>
  );
}
