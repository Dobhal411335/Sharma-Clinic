"use client";

import {
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import {
  ImagePlus,
  Layers3,
  Megaphone,
  Plus,
  Stethoscope,
  Trash2,
  Upload,
} from "lucide-react";

import {
  createEmptyAboutCard,
  createEmptyService,
  createEmptyTextSlide,
} from "@/components/admin/cms/about-us-banner/about-us-banner-form-utils";
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
import type { AboutUsBannerFormErrors } from "@/schemas/about-us-banner-schema";
import { uploadAboutUsImage } from "@/services/api/about-us-banner";
import { ApiError } from "@/services/api/errors";
import type {
  AboutUsAboutCardFormValues,
  AboutUsBannerFormValues,
  AboutUsHighlightItemFormValues,
  AboutUsServiceFormValues,
  AboutUsTextSlideFormValues,
} from "@/types/admin/about-us-banner";

type AboutUsBannerFormProps = {
  
  recordId: string | null;
  values: AboutUsBannerFormValues;
  errors: AboutUsBannerFormErrors;
  onChange: Dispatch<SetStateAction<AboutUsBannerFormValues>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  formId?: string;
};

function ImageField({
  label,
  url,
  uploading,
  onPick,
  onClear,
  inputRef,
}: {
  label: string;
  url: string;
  uploading: boolean;
  onPick: () => void;
  onClear: () => void;
  inputRef: (node: HTMLInputElement | null) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {url ? (
        <div className="overflow-hidden rounded-lg border border-border bg-muted/20">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of Cloudinary URL */}
          <img src={url} alt="" className="h-36 w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-border bg-muted/10 text-muted-foreground">
          <ImagePlus className="h-6 w-6" />
        </div>
      )}
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
        {url ? (
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

export function AboutUsBannerForm({
  recordId,
  values,
  errors,
  onChange,
  onSubmit,
  formId = "about-us-banner-form",
}: AboutUsBannerFormProps) {
  const aboutFileRefs = useRef<Array<HTMLInputElement | null>>([]);
  const serviceFileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [uploadingKey, setUploadingKey] = useState("");
  const services = values.services ?? [];

  const updateAboutCard = (
    index: number,
    patch: Partial<AboutUsAboutCardFormValues>,
  ) => {
    onChange((prev) => ({
      ...prev,
      aboutCards: prev.aboutCards.map((card, cardIndex) =>
        cardIndex === index ? { ...card, ...patch } : card,
      ),
    }));
  };

  const updateHighlight = (
    index: number,
    patch: Partial<AboutUsHighlightItemFormValues>,
  ) => {
    onChange((prev) => ({
      ...prev,
      highlightItems: prev.highlightItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    }));
  };

  const updateTextSlide = (
    index: number,
    patch: Partial<AboutUsTextSlideFormValues>,
  ) => {
    onChange((prev) => ({
      ...prev,
      textSlides: prev.textSlides.map((slide, slideIndex) =>
        slideIndex === index ? { ...slide, ...patch } : slide,
      ),
    }));
  };

  const updateService = (
    index: number,
    patch: Partial<AboutUsServiceFormValues>,
  ) => {
    onChange((prev) => ({
      ...prev,
      services: (prev.services ?? []).map((service, serviceIndex) =>
        serviceIndex === index ? { ...service, ...patch } : service,
      ),
    }));
  };

  const handleUpload = async (
    kind: "about" | "highlight" | "service" | "doctor",
    index: number,
    file: File | undefined,
  ) => {
    if (!file) return;
    const key = `${kind}-${index}`;
    setUploadingKey(key);
    try {
      const uploaded = await uploadAboutUsImage(file, recordId);
      if (!uploaded.url) {
        throw new Error("Upload succeeded but no image URL was returned");
      }
      if (kind === "about") {
        updateAboutCard(index, {
          image: { url: uploaded.url, publicId: uploaded.publicId },
        });
      } else {
        if (kind === "highlight") {
          updateHighlight(index, {
            image: { url: uploaded.url, publicId: uploaded.publicId },
          });
        } else {
          updateService(index, {
            [kind === "service" ? "image" : "doctorImage"]: {
              url: uploaded.url,
              publicId: uploaded.publicId,
            },
          });
        }
      }
      showSuccess("Image uploaded successfully");
    } catch (error) {
      showError(error instanceof ApiError ? error.message : "Cloudinary upload failed");
    } finally {
      setUploadingKey("");
    }
  };

  return (
    <form id={formId} onSubmit={onSubmit} className="space-y-6">
  
      <Card className="overflow-hidden border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border/70 pb-5">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">
              Section 1 — Insight introduction
            </CardTitle>
          </div>
          <CardDescription className="mt-1">
            Configure the fixed left introduction and the scrollable insight cards on the right.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="promo-label">Small heading</Label>
            <Input
              id="promo-label"
              value={values.promoLabel}
              onChange={(event) =>
                onChange({ ...values, promoLabel: event.target.value })
              }
              placeholder="A different kind of consultancy"
            />
            {errors.promoLabel ? (
              <p className="text-xs text-destructive">{errors.promoLabel}</p>
            ) : null}
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="promo-heading">Big heading</Label>
            <Input
              id="promo-heading"
              value={values.promoHeading}
              onChange={(event) =>
                onChange({ ...values, promoHeading: event.target.value })
              }
              placeholder="Insight that moves your business forward."
            />
            {errors.promoHeading ? (
              <p className="text-xs text-destructive">{errors.promoHeading}</p>
            ) : null}
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="promo-description">Description</Label>
            <Textarea
              id="promo-description"
              value={values.promoDescription ?? ""}
              onChange={(event) =>
                onChange({ ...values, promoDescription: event.target.value })
              }
              placeholder="Elvaris combines board-level perspective, sector expertise and hands-on execution."
              rows={4}
            />
            {errors.promoDescription ? (
              <p className="text-xs text-destructive">{errors.promoDescription}</p>
            ) : null}
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="promo-subheading">Sub description</Label>
            <Textarea
              id="promo-subheading"
              value={values.promoSubheading}
              onChange={(event) =>
                onChange({ ...values, promoSubheading: event.target.value })
              }
              placeholder="Explore seasonal highlights while stocks last."
              rows={3}
            />
            {errors.promoSubheading ? (
              <p className="text-xs text-destructive">{errors.promoSubheading}</p>
            ) : null}
          </div>
          <div className="space-y-4 border-t border-border/70 pt-6 md:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">Insight cards</h3>
                <p className="text-sm text-muted-foreground">
                  Each card needs only a heading and a short sub description.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 shrink-0 gap-2"
                onClick={() =>
                  onChange({
                    ...values,
                    textSlides: [...values.textSlides, createEmptyTextSlide()],
                  })
                }
              >
                <Plus className="h-4 w-4" />
                Add card
              </Button>
            </div>
            {errors.textSlides ? (
              <p className="text-xs text-destructive">{errors.textSlides}</p>
            ) : null}
            {values.textSlides.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                No insight cards yet. Add one to populate the right column.
              </p>
            ) : null}
            <div className="grid gap-3 md:grid-cols-2">
              {values.textSlides.map((slide, index) => (
                <div
                  key={`promo-card-${index}`}
                  className="space-y-3 rounded-lg border border-border/80 bg-muted/20 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">
                      Card {String(index + 1).padStart(2, "0")}
                    </p>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={slide.active}
                        onCheckedChange={(checked) =>
                          updateTextSlide(index, { active: checked })
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          onChange({
                            ...values,
                            textSlides: values.textSlides.filter(
                              (_, slideIndex) => slideIndex !== index,
                            ),
                          })
                        }
                        aria-label={`Remove insight card ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`promo-card-${index}-heading`}>Heading</Label>
                    <Input
                      id={`promo-card-${index}-heading`}
                      value={slide.heading}
                      onChange={(event) =>
                        updateTextSlide(index, { heading: event.target.value })
                      }
                      placeholder="Senior expertise, always"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`promo-card-${index}-subheading`}>
                      Sub description
                    </Label>
                    <Textarea
                      id={`promo-card-${index}-subheading`}
                      value={slide.subheading}
                      onChange={(event) =>
                        updateTextSlide(index, { subheading: event.target.value })
                      }
                      placeholder="Your core team stays involved from diagnosis through delivery."
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border/70 pb-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Layers3 className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-semibold">
                  Section 2 — About cards carousel
                </CardTitle>
              </div>
              <CardDescription className="mt-1">
                Split cards with image, copy, and CTA. Multiple active cards
                rotate as a carousel on the storefront.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-2"
              onClick={() =>
                onChange({
                  ...values,
                  aboutCards: [...values.aboutCards, createEmptyAboutCard()],
                })
              }
            >
              <Plus className="h-4 w-4" />
              Add card
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {errors.aboutCards ? (
            <p className="text-xs text-destructive">{errors.aboutCards}</p>
          ) : null}
          {values.aboutCards.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No about cards yet. Add one to show the About Us split section.
            </p>
          ) : null}
          {values.aboutCards.map((card, index) => (
            <div
              key={`about-card-${index}`}
              className="space-y-4 rounded-xl border border-border/80 bg-muted/20 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Card {index + 1}</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={card.active}
                      onCheckedChange={(checked) =>
                        updateAboutCard(index, { active: checked })
                      }
                    />
                    <span className="text-xs text-muted-foreground">Active</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      onChange({
                        ...values,
                        aboutCards: values.aboutCards.filter(
                          (_, cardIndex) => cardIndex !== index,
                        ),
                      })
                    }
                    aria-label={`Remove about card ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                <ImageField
                  label="Image"
                  url={card.image.url}
                  uploading={uploadingKey === `about-${index}`}
                  onPick={() => aboutFileRefs.current[index]?.click()}
                  onClear={() =>
                    updateAboutCard(index, { image: { url: "", publicId: "" } })
                  }
                  inputRef={(node) => {
                    aboutFileRefs.current[index] = node;
                    if (node) {
                      node.onchange = (event) => {
                        const target = event.target as HTMLInputElement;
                        void handleUpload("about", index, target.files?.[0]);
                        target.value = "";
                      };
                    }
                  }}
                />
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor={`about-${index}-label`}>Label</Label>
                    <Input
                      id={`about-${index}-label`}
                      value={card.label}
                      onChange={(event) =>
                        updateAboutCard(index, { label: event.target.value })
                      }
                      placeholder="About us"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`about-${index}-heading`}>Heading</Label>
                    <Input
                      id={`about-${index}-heading`}
                      value={card.heading}
                      onChange={(event) =>
                        updateAboutCard(index, { heading: event.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`about-${index}-description`}>
                      Description
                    </Label>
                    <Textarea
                      id={`about-${index}-description`}
                      value={card.description}
                      onChange={(event) =>
                        updateAboutCard(index, {
                          description: event.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor={`about-${index}-button-label`}>
                        Button label
                      </Label>
                      <Input
                        id={`about-${index}-button-label`}
                        value={card.buttonLabel}
                        onChange={(event) =>
                          updateAboutCard(index, {
                            buttonLabel: event.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`about-${index}-button-url`}>
                        Button URL
                      </Label>
                      <Input
                        id={`about-${index}-button-url`}
                        value={card.buttonUrl}
                        onChange={(event) =>
                          updateAboutCard(index, {
                            buttonUrl: event.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

       <Card className="overflow-hidden border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border/70 pb-5">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">Section 3 — Our Services</CardTitle>
          </div>
          <CardDescription className="mt-1">
            Configure the service selector and the detail card shown beside it on the landing page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="services-heading">Services heading</Label>
              <Input
                id="services-heading"
                value={values.servicesHeading ?? ""}
                onChange={(event) => onChange({ ...values, servicesHeading: event.target.value })}
                placeholder="Caring for your child, every step of the way"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="services-view-all-label">View all button label</Label>
              <Input
                id="services-view-all-label"
                value={values.servicesViewAllLabel ?? ""}
                onChange={(event) => onChange({ ...values, servicesViewAllLabel: event.target.value })}
                placeholder="View all services"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="services-view-all-url">View all button URL</Label>
              <Input
                id="services-view-all-url"
                value={values.servicesViewAllUrl ?? ""}
                onChange={(event) => onChange({ ...values, servicesViewAllUrl: event.target.value })}
                placeholder="/services"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Service tabs</p>
              <p className="text-xs text-muted-foreground">Each service becomes a selectable button on the left.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => onChange({ ...values, services: [...services, createEmptyService()] })}
            >
              <Plus className="h-4 w-4" /> Add service
            </Button>
          </div>
          {errors.services ? <p className="text-xs text-destructive">{errors.services}</p> : null}
          {services.map((service, index) => {
            const imageKey = `service-${index}`;
            const doctorKey = `doctor-${index}`;
            return (
              <div key={`service-${index}`} className="space-y-4 rounded-xl border border-border/80 bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">Service {index + 1}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2"><Switch checked={service.active} onCheckedChange={(active) => updateService(index, { active })} /><span className="text-xs text-muted-foreground">Active</span></div>
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive" onClick={() => onChange({ ...values, services: services.filter((_, serviceIndex) => serviceIndex !== index) })} aria-label={`Remove service ${index + 1}`}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                  <ImageField
                    label="Service image"
                    url={service.image.url}
                    uploading={uploadingKey === imageKey}
                    onPick={() => serviceFileRefs.current[imageKey]?.click()}
                    onClear={() => updateService(index, { image: { url: "", publicId: "" } })}
                    inputRef={(node) => { serviceFileRefs.current[imageKey] = node; if (node) { node.onchange = (event) => { const target = event.target as HTMLInputElement; void handleUpload("service", index, target.files?.[0]); target.value = ""; }; } }}
                  />
                  <div className="grid gap-3">
                    <div className="grid gap-2"><Label htmlFor={`service-${index}-button`}>Service button name</Label><Input id={`service-${index}-button`} value={service.buttonLabel} onChange={(event) => updateService(index, { buttonLabel: event.target.value })} placeholder="Well Child Check-ups" /></div>
                    <div className="grid gap-2"><Label htmlFor={`service-${index}-heading`}>Service heading</Label><Input id={`service-${index}-heading`} value={service.heading} onChange={(event) => updateService(index, { heading: event.target.value })} /></div>
                    <div className="grid gap-2"><Label htmlFor={`service-${index}-description`}>Sub description</Label><Textarea id={`service-${index}-description`} value={service.description} onChange={(event) => updateService(index, { description: event.target.value })} rows={4} /></div>
                  </div>
                </div>
                <div className="space-y-3 rounded-lg border border-border/70 bg-background p-3">
                  <div className="flex items-center justify-between"><p className="text-sm font-medium">Highlights</p><Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => updateService(index, { highlights: [...service.highlights, { text: "" }] })}><Plus className="h-4 w-4" /> Add highlight</Button></div>
                  {service.highlights.map((highlight, highlightIndex) => <div key={`service-${index}-highlight-${highlightIndex}`} className="flex gap-2"><Input value={highlight.text} onChange={(event) => updateService(index, { highlights: service.highlights.map((item, itemIndex) => itemIndex === highlightIndex ? { text: event.target.value } : item) })} placeholder="Excellent laboratory" /><Button type="button" variant="ghost" size="icon" onClick={() => updateService(index, { highlights: service.highlights.filter((_, itemIndex) => itemIndex !== highlightIndex) })} aria-label="Remove highlight"><Trash2 className="h-4 w-4" /></Button></div>)}
                </div>
                <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                  <ImageField
                    label="Doctor image"
                    url={service.doctorImage.url}
                    uploading={uploadingKey === doctorKey}
                    onPick={() => serviceFileRefs.current[doctorKey]?.click()}
                    onClear={() => updateService(index, { doctorImage: { url: "", publicId: "" } })}
                    inputRef={(node) => { serviceFileRefs.current[doctorKey] = node; if (node) { node.onchange = (event) => { const target = event.target as HTMLInputElement; void handleUpload("doctor", index, target.files?.[0]); target.value = ""; }; } }}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-2"><Label>Doctor name</Label><Input value={service.doctorName} onChange={(event) => updateService(index, { doctorName: event.target.value })} /></div>
                    <div className="grid gap-2"><Label>Doctor designation</Label><Input value={service.doctorDesignation} onChange={(event) => updateService(index, { doctorDesignation: event.target.value })} /></div>
                    <div className="grid gap-2"><Label>Doctor button label</Label><Input value={service.doctorButtonLabel} onChange={(event) => updateService(index, { doctorButtonLabel: event.target.value })} /></div>
                    <div className="grid gap-2"><Label>Doctor button URL</Label><Input value={service.doctorButtonUrl} onChange={(event) => updateService(index, { doctorButtonUrl: event.target.value })} placeholder="/appointments" /></div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </form>
  );
}
