"use client";

import { Plus, Sparkles, Trash2 } from "lucide-react";
import {
  Button,
  ImageAssetField,
  Input,
  Label,
  RichHtmlField,
  SectionCard,
  SeoKeywordsField,
} from "@/components/admin/cms/webpages/webpage-form-fields";
import {
  createEmptyDesign10DefineCard,
  createEmptyDesign10ExploreCard,
  createEmptyDesign10GlobalCard,
  createEmptyDesign10Leader,
  createEmptyDesign10TimelineItem,
  emptyImage,
} from "@/components/admin/cms/webpages/webpage-form-state";
import type { WebpageEditFormValues } from "@/types/admin/webpages";

export function Design10Form({
  webpageId,
  values,
  setValues,
}: {
  
  webpageId: string;
  values: WebpageEditFormValues;
  setValues: React.Dispatch<React.SetStateAction<WebpageEditFormValues>>;
}) {
  const patch = <K extends keyof WebpageEditFormValues>(
    key: K,
    value: WebpageEditFormValues[K],
  ) => setValues((p) => ({ ...p, [key]: value }));
  const text = (label: string, key: keyof WebpageEditFormValues) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        value={String(values[key] || "")}
        onChange={(e) => patch(key, e.target.value as never)}
      />
    </div>
  );
  const rich = (label: string, key: keyof WebpageEditFormValues) => (
    <RichHtmlField
      label={label}
      value={String(values[key] || "")}
      onChange={(html) => patch(key, html as never)}
    />
  );
  const addRemove = <T,>(
    key: keyof WebpageEditFormValues,
    list: T[],
    empty: () => T,
    render: (item: T, i: number) => React.ReactNode,
  ) => (
    <div className="space-y-3">
      <Label>
        {String(key)
          .replace("design10", "")
          .replace(/Cards|Timeline/, "")}{" "}
        items
      </Label>
      {list.map((item, i) => (
        <div key={i} className="space-y-3 rounded-xl border p-4">
          <div className="flex justify-between">
            <span className="text-xs font-bold uppercase text-muted-foreground">
              Item #{i + 1}
            </span>
            {list.length > 1 && (
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() =>
                  patch(key, list.filter((_, j) => j !== i) as never)
                }
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
          {render(item, i)}
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        onClick={() => patch(key, [...list, empty()] as never)}
      >
        <Plus className="mr-1 size-4" /> Add item
      </Button>
    </div>
  );
  const update = <T,>(
    key: keyof WebpageEditFormValues,
    list: T[],
    i: number,
    value: Partial<T>,
  ) => {
    const next = [...list];
    next[i] = { ...next[i], ...value };
    patch(key, next as never);
  };
  return (
    <SectionCard
      title="Design 10 · About page"
      icon={<Sparkles className="size-4" />}
    >
      <SeoKeywordsField
        titleLine={values.titleLine}
        keywords={values.keywords}
        onTitleLineChange={(v) => patch("titleLine", v)}
        onKeywordsChange={(v) => patch("keywords", v)}
      />
      <div className="space-y-4">
        <h3 className="text-base font-semibold">Hero section</h3>
        {text("Mini heading", "design10HeroMiniHeading")}
        {text("Main heading", "design10HeroMainHeading")}
        {rich("Description", "design10HeroDescription")}
        <ImageAssetField
         
          webpageId={webpageId}
          inputId="d10-hero"
          label="Full-width background image"
          value={values.design10HeroImage || emptyImage()}
          onChange={(v) => patch("design10HeroImage", v)}
        />
      </div>
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-base font-semibold">Our story</h3>
        {text("Mini heading", "design10StoryMiniHeading")}
        {rich("Description", "design10StoryDescription")}
        {rich("Paragraph", "design10StoryParagraph")}
        {rich("Small paragraph", "design10StorySmallParagraph")}
      </div>
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-base font-semibold">What defines us</h3>
        {text("Mini heading", "design10DefineMiniHeading")}
        {addRemove(
          "design10DefineCards",
          values.design10DefineCards,
          createEmptyDesign10DefineCard,
          (c, i) => (
            <>
              {
                <div className="space-y-2">
                  <Label>Heading</Label>
                  <Input
                    value={c.heading}
                    onChange={(e) =>
                      update(
                        "design10DefineCards",
                        values.design10DefineCards,
                        i,
                        { heading: e.target.value },
                      )
                    }
                  />
                </div>
              }
              <RichHtmlField
                label="Description"
                value={c.description}
                onChange={(v) =>
                  update("design10DefineCards", values.design10DefineCards, i, {
                    description: v,
                  })
                }
              />
            </>
          ),
        )}
      </div>
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-base font-semibold">Our journey</h3>
        {text("Mini heading", "design10JourneyMiniHeading")}
        {text("Main heading", "design10JourneyMainHeading")}
        <ImageAssetField
         
          webpageId={webpageId}
          inputId="d10-journey"
          label="Journey banner image"
          value={values.design10JourneyImage || emptyImage()}
          onChange={(v) => patch("design10JourneyImage", v)}
        />
        {addRemove(
          "design10JourneyTimeline",
          values.design10JourneyTimeline,
          createEmptyDesign10TimelineItem,
          (c, i) => (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input
                    value={c.year}
                    onChange={(e) =>
                      update(
                        "design10JourneyTimeline",
                        values.design10JourneyTimeline,
                        i,
                        { year: e.target.value },
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Heading</Label>
                  <Input
                    value={c.heading}
                    onChange={(e) =>
                      update(
                        "design10JourneyTimeline",
                        values.design10JourneyTimeline,
                        i,
                        { heading: e.target.value },
                      )
                    }
                  />
                </div>
              </div>
              <RichHtmlField
                label="Description"
                value={c.description}
                onChange={(v) =>
                  update(
                    "design10JourneyTimeline",
                    values.design10JourneyTimeline,
                    i,
                    { description: v },
                  )
                }
              />
            </>
          ),
        )}
      </div>
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-base font-semibold">Leadership</h3>
        {text("Mini heading", "design10LeadershipMiniHeading")}
        {text("Heading", "design10LeadershipMainHeading")}
        {addRemove(
          "design10LeadershipCards",
          values.design10LeadershipCards,
          createEmptyDesign10Leader,
          (c, i) => (
            <>
              <ImageAssetField
               
                webpageId={webpageId}
                inputId={`d10-leader-${i}`}
                label="Leader image"
                value={c.image || emptyImage()}
                onChange={(v) =>
                  update(
                    "design10LeadershipCards",
                    values.design10LeadershipCards,
                    i,
                    { image: v },
                  )
                }
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={c.name}
                      onChange={(e) =>
                        update(
                          "design10LeadershipCards",
                          values.design10LeadershipCards,
                          i,
                          { name: e.target.value },
                        )
                      }
                    />
                  </div>
                }
                <div className="space-y-2">
                  <Label>Designation</Label>
                  <Input
                    value={c.designation}
                    onChange={(e) =>
                      update(
                        "design10LeadershipCards",
                        values.design10LeadershipCards,
                        i,
                        { designation: e.target.value },
                      )
                    }
                  />
                </div>
              </div>
            </>
          ),
        )}
      </div>
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-base font-semibold">Global presence</h3>
        {text("Mini heading", "design10GlobalMiniHeading")}
        {text("Heading", "design10GlobalMainHeading")}
        {rich("Description", "design10GlobalDescription")}
        {addRemove(
          "design10GlobalCards",
          values.design10GlobalCards,
          createEmptyDesign10GlobalCard,
          (c, i) => (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Mini heading</Label>
                  <Input
                    value={c.miniHeading}
                    onChange={(e) =>
                      update(
                        "design10GlobalCards",
                        values.design10GlobalCards,
                        i,
                        { miniHeading: e.target.value },
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Heading</Label>
                  <Input
                    value={c.heading}
                    onChange={(e) =>
                      update(
                        "design10GlobalCards",
                        values.design10GlobalCards,
                        i,
                        { heading: e.target.value },
                      )
                    }
                  />
                </div>
              </div>
              <RichHtmlField
                label="Description"
                value={c.description}
                onChange={(v) =>
                  update("design10GlobalCards", values.design10GlobalCards, i, {
                    description: v,
                  })
                }
              />
            </>
          ),
        )}
        <ImageAssetField
         
          webpageId={webpageId}
          inputId="d10-global"
          label="Global presence banner image"
          value={values.design10GlobalImage || emptyImage()}
          onChange={(v) => patch("design10GlobalImage", v)}
        />
      </div>
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-base font-semibold">Continue exploring</h3>
        {text("Mini heading", "design10ExploreMiniHeading")}
        {text("Heading", "design10ExploreMainHeading")}
        {addRemove(
          "design10ExploreCards",
          values.design10ExploreCards,
          createEmptyDesign10ExploreCard,
          (c, i) => (
            <>
              <div className="space-y-2">
                <Label>Heading</Label>
                <Input
                  value={c.heading}
                  onChange={(e) =>
                    update(
                      "design10ExploreCards",
                      values.design10ExploreCards,
                      i,
                      { heading: e.target.value },
                    )
                  }
                />
              </div>
              <RichHtmlField
                label="Description"
                value={c.description}
                onChange={(v) =>
                  update(
                    "design10ExploreCards",
                    values.design10ExploreCards,
                    i,
                    { description: v },
                  )
                }
              />
              <div className="space-y-2">
                <Label>Card link</Label>
                <Input
                  value={c.link}
                  onChange={(e) =>
                    update(
                      "design10ExploreCards",
                      values.design10ExploreCards,
                      i,
                      { link: e.target.value },
                    )
                  }
                />
              </div>
            </>
          ),
        )}
      </div>
    </SectionCard>
  );
}
