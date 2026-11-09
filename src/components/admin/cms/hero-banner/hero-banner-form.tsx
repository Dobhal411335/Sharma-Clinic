"use client";

import {
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import {
  Columns3,
  ImagePlus,
  LayoutTemplate,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";

import {
  createEmptyGridImage,
  createEmptySlide,
  HERO_TAB_META,
} from "@/components/admin/cms/hero-banner/hero-banner-form-utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { showError, showSuccess } from "@/lib/toast";
import type { HeroBannerFormErrors } from "@/schemas/hero-banner-schema";
import { uploadHeroImage } from "@/services/api/hero-banner";
import { ApiError } from "@/services/api/errors";
import type {
  HeroBannerFormValues,
  HeroBannerImageValue,
  HeroBannerLayoutType,
  HeroBannerSlideFormValues,
} from "@/types/admin/hero-banner";

type HeroBannerFormProps = {
  
  values: HeroBannerFormValues;
  errors: HeroBannerFormErrors;
  onChange: Dispatch<SetStateAction<HeroBannerFormValues>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  formId?: string;
};

function ImageField({
  label,
  value,
  uploading,
  onPick,
  onClear,
  clickUrl,
  onClickUrlChange,
  inputRef,
}: {
  label: string;
  value: HeroBannerImageValue;
  uploading: boolean;
  onPick: () => void;
  onClear: () => void;
  clickUrl?: string;
  onClickUrlChange?: (url: string) => void;
  inputRef: (node: HTMLInputElement | null) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value.url ? (
        <div className="overflow-hidden rounded-lg border border-border bg-muted/20">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of Cloudinary URL */}
          <img src={value.url} alt="" className="h-72 w-full object-contain" />
        </div>
      ) : (
        <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-border bg-muted/10 text-muted-foreground">
          <ImagePlus className="h-6 w-6" />
        </div>
      )}
      {onClickUrlChange ? (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Image click URL</Label>
          <Input
            value={clickUrl ?? ""}
            onChange={(event) => onClickUrlChange(event.target.value)}
            placeholder="/category or https://…"
          />
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={uploading}
          onClick={onPick}
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading…" : "Upload image"}
        </Button>
        {value.url ? (
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            Remove
          </Button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
      />
    </div>
  );
}

function CopyFields({
  slide,
  index,
  activeTab,
  updateSlide,
}: {
  slide: HeroBannerSlideFormValues;
  index: number;
  activeTab: HeroBannerLayoutType;
  updateSlide: (index: number, patch: Partial<HeroBannerSlideFormValues>) => void;
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`mini-${slide.clientKey}`}>Mini heading</Label>
          <Input
            id={`mini-${slide.clientKey}`}
            value={slide.miniHeading}
            onChange={(event) =>
              updateSlide(index, { miniHeading: event.target.value })
            }
            placeholder="Small line above the title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`main-${slide.clientKey}`}>Main heading</Label>
          <Input
            id={`main-${slide.clientKey}`}
            value={slide.mainHeading}
            onChange={(event) =>
              updateSlide(index, { mainHeading: event.target.value })
            }
            placeholder="Primary headline"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`desc-${slide.clientKey}`}>Sub description</Label>
        <Textarea
          id={`desc-${slide.clientKey}`}
          value={slide.description}
          onChange={(event) =>
            updateSlide(index, { description: event.target.value })
          }
          rows={3}
          placeholder="Supporting copy for the hero"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`btn1-${slide.clientKey}`}>
            {activeTab === "SPLIT_DUAL" ? "Button 1 label" : "Button label"}
          </Label>
          <Input
            id={`btn1-${slide.clientKey}`}
            value={slide.buttonLabel}
            onChange={(event) =>
              updateSlide(index, { buttonLabel: event.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`btn1url-${slide.clientKey}`}>
            {activeTab === "SPLIT_DUAL" ? "Button 1 URL" : "Button URL"}
          </Label>
          <Input
            id={`btn1url-${slide.clientKey}`}
            value={slide.buttonUrl}
            onChange={(event) =>
              updateSlide(index, { buttonUrl: event.target.value })
            }
            placeholder="/category"
          />
        </div>
      </div>

      {activeTab === "SPLIT_DUAL" || activeTab === "MULTI_IMAGE" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`btn2-${slide.clientKey}`}>Button 2 label</Label>
            <Input
              id={`btn2-${slide.clientKey}`}
              value={slide.button2Label}
              onChange={(event) =>
                updateSlide(index, { button2Label: event.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`btn2url-${slide.clientKey}`}>Button 2 URL</Label>
            <Input
              id={`btn2url-${slide.clientKey}`}
              value={slide.button2Url}
              onChange={(event) =>
                updateSlide(index, { button2Url: event.target.value })
              }
              placeholder="/category"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

export function HeroBannerForm({
  values,
  errors,
  onChange,
  onSubmit,
  formId = "hero-banner-form",
}: HeroBannerFormProps) {
  const [activeTab, setActiveTab] = useState<HeroBannerLayoutType>("DOCTOR_BANNER");
  const [uploadingKey, setUploadingKey] = useState("");
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const slidesForTab = values.slides
    .map((slide, index) => ({ slide, index }))
    .filter(({ slide }) => slide.layoutType === activeTab);

  const updateSlide = (
    index: number,
    patch: Partial<HeroBannerSlideFormValues>,
  ) => {
    onChange((prev) => ({
      ...prev,
      slides: prev.slides.map((slide, slideIndex) =>
        slideIndex === index ? { ...slide, ...patch } : slide,
      ),
    }));
  };

  const addSlide = () => {
    onChange((prev) => ({
      ...prev,
      slides: [
        ...prev.slides,
        createEmptySlide(activeTab, prev.slides.length),
      ],
    }));
  };

  const removeSlide = (index: number) => {
    onChange((prev) => ({
      ...prev,
      slides: prev.slides.filter((_, slideIndex) => slideIndex !== index),
    }));
  };

  const handleUpload = async (
    key: string,
    file: File | undefined,
    apply: (uploaded: { url: string; publicId: string }) => void,
  ) => {
    if (!file) return;
    setUploadingKey(key);
    try {
      const uploaded = await uploadHeroImage(file);
      if (!uploaded.url) {
        throw new Error("Upload succeeded but no image URL was returned");
      }
      apply(uploaded);
      showSuccess("Image uploaded successfully");
    } catch (error) {
      showError(error instanceof ApiError ? error.message : "Cloudinary upload failed");
    } finally {
      setUploadingKey("");
    }
  };

  const tabMeta = HERO_TAB_META.find((tab) => tab.layoutType === activeTab)!;

  return (
    <form id={formId} onSubmit={onSubmit} className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {HERO_TAB_META.map((tab) => {
          const count = values.slides.filter(
            (slide) => slide.layoutType === tab.layoutType,
          ).length;
          const selected = activeTab === tab.layoutType;
          return (
            <button
              key={tab.layoutType}
              type="button"
              onClick={() => setActiveTab(tab.layoutType)}
              className={[
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                selected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
              ].join(" ")}
            >
              {tab.label}
              {count > 0 ? ` (${count})` : ""}
            </button>
          );
        })}
      </div>

      <Card className="overflow-hidden border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border/70 pb-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {activeTab === "SPLIT_DUAL" ? (
                  <Columns3 className="h-5 w-5 text-primary" />
                ) : (
                  <LayoutTemplate className="h-5 w-5 text-primary" />
                )}
                <CardTitle className="text-lg font-semibold">{tabMeta.label}</CardTitle>
              </div>
              <CardDescription>{tabMeta.description}</CardDescription>
            </div>
            <Button type="button" variant="outline" className="gap-2" onClick={addSlide}>
              <Plus className="h-4 w-4" />
              Add slide
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {errors.slides ? (
            <p className="text-sm text-destructive">{errors.slides}</p>
          ) : null}

          {slidesForTab.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/10 px-4 py-8 text-center text-sm text-muted-foreground">
              No {tabMeta.label.toLowerCase()} slides yet. Add a slide to configure
              this variant for the home carousel.
            </p>
          ) : null}

          {slidesForTab.map(({ slide, index }) => (
            <div
              key={slide.clientKey}
              className="space-y-5 rounded-xl border border-border p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">
                  {tabMeta.label} · #{index + 1}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={slide.active}
                      onCheckedChange={(active) => updateSlide(index, { active })}
                      id={`hero-active-${slide.clientKey}`}
                    />
                    <Label htmlFor={`hero-active-${slide.clientKey}`}>Active</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`hero-order-${slide.clientKey}`}>Order</Label>
                    <Input
                      id={`hero-order-${slide.clientKey}`}
                      type="number"
                      min={0}
                      className="w-20"
                      value={slide.order}
                      onChange={(event) =>
                        updateSlide(index, {
                          order: Number(event.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-destructive"
                    onClick={() => removeSlide(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>

              {activeTab !== "FULL_WIDTH" && activeTab !== "DOCTOR_BANNER" ? (
                <CopyFields
                  slide={slide}
                  index={index}
                  activeTab={activeTab}
                  updateSlide={updateSlide}
                />
              ) : null}

              {activeTab === "DOCTOR_BANNER" ? (
                <div className="space-y-6">
                  <ImageField
                    label="Background image"
                    value={slide.desktopImage}
                    uploading={uploadingKey === `${slide.clientKey}-desktop`}
                    onPick={() =>
                      fileRefs.current[`${slide.clientKey}-desktop`]?.click()
                    }
                    onClear={() =>
                      updateSlide(index, {
                        desktopImage: { url: "", publicId: "" },
                        mobileImage: { url: "", publicId: "" },
                      })
                    }
                    inputRef={(node) => {
                      fileRefs.current[`${slide.clientKey}-desktop`] = node;
                      if (node) {
                        node.onchange = () => {
                          void handleUpload(
                            `${slide.clientKey}-desktop`,
                            node.files?.[0],
                            (uploaded) =>
                              updateSlide(index, {
                                desktopImage: {
                                  url: uploaded.url,
                                  publicId: uploaded.publicId,
                                },
                                mobileImage: {
                                  url: uploaded.url,
                                  publicId: uploaded.publicId,
                                },
                              }),
                          );
                          node.value = "";
                        };
                      }
                    }}
                  />

                  <div className="space-y-4 rounded-xl border border-border/80 bg-muted/10 p-4">
                    <p className="text-sm font-semibold">Card 1 · Headline</p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`mini-${slide.clientKey}`}>Mini heading</Label>
                        <Input
                          id={`mini-${slide.clientKey}`}
                          value={slide.miniHeading}
                          onChange={(event) =>
                            updateSlide(index, { miniHeading: event.target.value })
                          }
                          placeholder="Small line above the title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`main-${slide.clientKey}`}>Main heading</Label>
                        <Input
                          id={`main-${slide.clientKey}`}
                          value={slide.mainHeading}
                          onChange={(event) =>
                            updateSlide(index, { mainHeading: event.target.value })
                          }
                          placeholder="Primary headline"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`desc-${slide.clientKey}`}>Sub description</Label>
                      <Textarea
                        id={`desc-${slide.clientKey}`}
                        value={slide.description}
                        onChange={(event) =>
                          updateSlide(index, { description: event.target.value })
                        }
                        rows={3}
                        placeholder="Supporting copy for the headline card"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`btn1-${slide.clientKey}`}>Button label</Label>
                        <Input
                          id={`btn1-${slide.clientKey}`}
                          value={slide.buttonLabel}
                          onChange={(event) =>
                            updateSlide(index, { buttonLabel: event.target.value })
                          }
                          placeholder="Learn More"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`btn1url-${slide.clientKey}`}>Button URL</Label>
                        <Input
                          id={`btn1url-${slide.clientKey}`}
                          value={slide.buttonUrl}
                          onChange={(event) =>
                            updateSlide(index, { buttonUrl: event.target.value })
                          }
                          placeholder="/doctors or https://…"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-xl border border-border/80 bg-muted/10 p-4">
                    <p className="text-sm font-semibold">Card 2 · Image</p>
                    <ImageField
                      label="Card image"
                      value={slide.leftImage}
                      uploading={uploadingKey === `${slide.clientKey}-left`}
                      onPick={() =>
                        fileRefs.current[`${slide.clientKey}-left`]?.click()
                      }
                      onClear={() =>
                        updateSlide(index, {
                          leftImage: { url: "", publicId: "" },
                        })
                      }
                      inputRef={(node) => {
                        fileRefs.current[`${slide.clientKey}-left`] = node;
                        if (node) {
                          node.onchange = () => {
                            void handleUpload(
                              `${slide.clientKey}-left`,
                              node.files?.[0],
                              (uploaded) =>
                                updateSlide(index, {
                                  leftImage: {
                                    url: uploaded.url,
                                    publicId: uploaded.publicId,
                                  },
                                }),
                            );
                            node.value = "";
                          };
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-4 rounded-xl border border-border/80 bg-muted/10 p-4">
                    <p className="text-sm font-semibold">Card 3 · Welcome / Call</p>
                    <div className="space-y-2">
                      <Label htmlFor={`sec-heading-${slide.clientKey}`}>
                        Heading
                      </Label>
                      <Input
                        id={`sec-heading-${slide.clientKey}`}
                        value={slide.secondaryHeading}
                        onChange={(event) =>
                          updateSlide(index, {
                            secondaryHeading: event.target.value,
                          })
                        }
                        placeholder="Welcome heading"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`sec-desc-${slide.clientKey}`}>
                        Sub description
                      </Label>
                      <Textarea
                        id={`sec-desc-${slide.clientKey}`}
                        value={slide.secondaryDescription}
                        onChange={(event) =>
                          updateSlide(index, {
                            secondaryDescription: event.target.value,
                          })
                        }
                        rows={3}
                        placeholder="Short welcome copy"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`call-${slide.clientKey}`}>Call number</Label>
                      <Input
                        id={`call-${slide.clientKey}`}
                        value={slide.callNumber}
                        onChange={(event) =>
                          updateSlide(index, { callNumber: event.target.value })
                        }
                        placeholder="+011 3253 4567"
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === "FULL_WIDTH" ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <ImageField
                      label="Mobile image"
                      value={slide.mobileImage}
                      uploading={uploadingKey === `${slide.clientKey}-mobile`}
                      onPick={() =>
                        fileRefs.current[`${slide.clientKey}-mobile`]?.click()
                      }
                      onClear={() =>
                        updateSlide(index, {
                          mobileImage: { url: "", publicId: "" },
                        })
                      }
                      inputRef={(node) => {
                        fileRefs.current[`${slide.clientKey}-mobile`] = node;
                        if (node) {
                          node.onchange = () => {
                            void handleUpload(
                              `${slide.clientKey}-mobile`,
                              node.files?.[0],
                              (uploaded) =>
                                updateSlide(index, {
                                  mobileImage: {
                                    url: uploaded.url,
                                    publicId: uploaded.publicId,
                                  },
                                }),
                            );
                            node.value = "";
                          };
                        }
                      }}
                    />
                    <ImageField
                      label="Laptop / desktop image"
                      value={slide.desktopImage}
                      uploading={uploadingKey === `${slide.clientKey}-desktop`}
                      onPick={() =>
                        fileRefs.current[`${slide.clientKey}-desktop`]?.click()
                      }
                      onClear={() =>
                        updateSlide(index, {
                          desktopImage: { url: "", publicId: "" },
                        })
                      }
                      inputRef={(node) => {
                        fileRefs.current[`${slide.clientKey}-desktop`] = node;
                        if (node) {
                          node.onchange = () => {
                            void handleUpload(
                              `${slide.clientKey}-desktop`,
                              node.files?.[0],
                              (uploaded) =>
                                updateSlide(index, {
                                  desktopImage: {
                                    url: uploaded.url,
                                    publicId: uploaded.publicId,
                                  },
                                }),
                            );
                            node.value = "";
                          };
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`click-${slide.clientKey}`}>
                      Image click URL
                    </Label>
                    <Input
                      id={`click-${slide.clientKey}`}
                      value={slide.buttonUrl}
                      onChange={(event) =>
                        updateSlide(index, { buttonUrl: event.target.value })
                      }
                      placeholder="/category or https://…"
                    />
                    <p className="text-xs text-muted-foreground">
                      When customers click the banner image, they go to this URL.
                    </p>
                  </div>
                </div>
              ) : null}

              {activeTab === "SPLIT_DUAL" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <ImageField
                    label="Left side image (laptop)"
                    value={slide.leftImage}
                    clickUrl={slide.leftImageClickUrl}
                    onClickUrlChange={(url) =>
                      updateSlide(index, { leftImageClickUrl: url })
                    }
                    uploading={uploadingKey === `${slide.clientKey}-left`}
                    onPick={() => fileRefs.current[`${slide.clientKey}-left`]?.click()}
                    onClear={() =>
                      updateSlide(index, {
                        leftImage: { url: "", publicId: "" },
                      })
                    }
                    inputRef={(node) => {
                      fileRefs.current[`${slide.clientKey}-left`] = node;
                      if (node) {
                        node.onchange = () => {
                          void handleUpload(
                            `${slide.clientKey}-left`,
                            node.files?.[0],
                            (uploaded) =>
                              updateSlide(index, {
                                leftImage: {
                                  url: uploaded.url,
                                  publicId: uploaded.publicId,
                                },
                              }),
                          );
                          node.value = "";
                        };
                      }
                    }}
                  />
                  <ImageField
                    label="Right side image (laptop)"
                    value={slide.rightImage}
                    clickUrl={slide.rightImageClickUrl}
                    onClickUrlChange={(url) =>
                      updateSlide(index, { rightImageClickUrl: url })
                    }
                    uploading={uploadingKey === `${slide.clientKey}-right`}
                    onPick={() => fileRefs.current[`${slide.clientKey}-right`]?.click()}
                    onClear={() =>
                      updateSlide(index, {
                        rightImage: { url: "", publicId: "" },
                      })
                    }
                    inputRef={(node) => {
                      fileRefs.current[`${slide.clientKey}-right`] = node;
                      if (node) {
                        node.onchange = () => {
                          void handleUpload(
                            `${slide.clientKey}-right`,
                            node.files?.[0],
                            (uploaded) =>
                              updateSlide(index, {
                                rightImage: {
                                  url: uploaded.url,
                                  publicId: uploaded.publicId,
                                },
                              }),
                          );
                          node.value = "";
                        };
                      }
                    }}
                  />
                </div>
              ) : null}

              {activeTab === "MULTI_IMAGE" ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">Associate brand images</p>
                      <p className="text-xs text-muted-foreground">
                        Add 4–6 images for the brand grid.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      disabled={slide.gridImages.length >= 6}
                      onClick={() =>
                        updateSlide(index, {
                          gridImages: [...slide.gridImages, createEmptyGridImage()],
                        })
                      }
                    >
                      <Plus className="h-4 w-4" />
                      Add image
                    </Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {slide.gridImages.map((gridImage, gridIndex) => {
                      const key = `${slide.clientKey}-grid-${gridIndex}`;
                      return (
                        <div
                          key={key}
                          className="space-y-3 rounded-lg border border-border/80 p-3"
                        >
                          <ImageField
                            label={`Image ${gridIndex + 1}`}
                            value={gridImage.image}
                            uploading={uploadingKey === key}
                            onPick={() => fileRefs.current[key]?.click()}
                            onClear={() =>
                              updateSlide(index, {
                                gridImages: slide.gridImages.map((item, i) =>
                                  i === gridIndex
                                    ? { ...item, image: { url: "", publicId: "" } }
                                    : item,
                                ),
                              })
                            }
                            inputRef={(node) => {
                              fileRefs.current[key] = node;
                              if (node) {
                                node.onchange = () => {
                                  void handleUpload(key, node.files?.[0], (uploaded) =>
                                    updateSlide(index, {
                                      gridImages: slide.gridImages.map((item, i) =>
                                        i === gridIndex
                                          ? {
                                            ...item,
                                            image: {
                                              url: uploaded.url,
                                              publicId: uploaded.publicId,
                                            },
                                          }
                                          : item,
                                      ),
                                    }),
                                  );
                                  node.value = "";
                                };
                              }
                            }}
                          />
                          <div className="space-y-2">
                            <Label htmlFor={`alt-${key}`}>Alt / label</Label>
                            <Input
                              id={`alt-${key}`}
                              value={gridImage.alt}
                              onChange={(event) =>
                                updateSlide(index, {
                                  gridImages: slide.gridImages.map((item, i) =>
                                    i === gridIndex
                                      ? { ...item, alt: event.target.value }
                                      : item,
                                  ),
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`click-url-${key}`}>Image click URL</Label>
                            <Input
                              id={`click-url-${key}`}
                              value={gridImage.clickUrl}
                              onChange={(event) =>
                                updateSlide(index, {
                                  gridImages: slide.gridImages.map((item, i) =>
                                    i === gridIndex
                                      ? { ...item, clickUrl: event.target.value }
                                      : item,
                                  ),
                                })
                              }
                              placeholder="/category or https://…"
                            />
                          </div>
                          {slide.gridImages.length > 4 ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() =>
                                updateSlide(index, {
                                  gridImages: slide.gridImages.filter(
                                    (_, i) => i !== gridIndex,
                                  ),
                                })
                              }
                            >
                              Remove image
                            </Button>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </form>
  );
}
