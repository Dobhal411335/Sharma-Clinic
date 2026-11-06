"use client";

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
  createEmptyTeamCard,
  emptyImage,
} from "@/components/admin/cms/webpages/webpage-form-state";
import type { WebpageEditFormValues } from "@/types/admin/webpages";

export function Design6Form({
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
  ) => setValues((prev) => ({ ...prev, [key]: value }));

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
          inputId="d6-image-first"
          label="Main top image (laptop)"
          value={values.imageFirst}
          onChange={(v) => patch("imageFirst", v)}
        />
      </SectionCard>
      
      <SectionCard
        title="Design 6 team sections"
        icon={<Sparkles className="size-4" />}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Top chip text</Label>
            <Input
              value={values.design6Chip}
              onChange={(e) => patch("design6Chip", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Explore area link</Label>
            <Input
              value={values.design6ExploreLink}
              onChange={(e) => patch("design6ExploreLink", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Main heading section</Label>
          <Input
            value={values.design6MainHeading}
            onChange={(e) => patch("design6MainHeading", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Sub heading / paragraph description</Label>
          <Textarea
            value={values.design6SubHeading}
            onChange={(e) => patch("design6SubHeading", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Author attribution</Label>
          <Input
            value={values.design6Author}
            onChange={(e) => patch("design6Author", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Mid section heading</Label>
          <Input
            value={values.design6MidHeading}
            onChange={(e) => patch("design6MidHeading", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Mid section link</Label>
          <Input
            value={values.design6MidLink}
            onChange={(e) => patch("design6MidLink", e.target.value)}
          />
        </div>

        <div className="space-y-4 pt-2">
          <Label>Team profiles</Label>
          {values.teamCards.map((card, index) => (
            <div
              key={index}
              className="space-y-4 rounded-xl border border-border bg-muted/10 p-4"
            >
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                  Member #{index + 1}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="border-rose-200 text-rose-600"
                  onClick={() =>
                    patch(
                      "teamCards",
                      values.teamCards.filter((_, i) => i !== index),
                    )
                  }
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                <ImageAssetField
                 
                  webpageId={webpageId}
                  inputId={`d6-team-${index}`}
                  label="Avatar photo"
                  value={card.image || emptyImage()}
                  onChange={(img) => {
                    const next = [...values.teamCards];
                    next[index] = { ...next[index], image: img };
                    patch("teamCards", next);
                  }}
                />
                <div className="grid gap-3.5 md:col-span-2 md:grid-cols-2">
                  {(
                    [
                      ["name", "Full name"],
                      ["designation", "Designation"],
                      ["phone", "Phone number"],
                      ["facebook", "Facebook URL"],
                      ["instagram", "Instagram URL"],
                      ["youtube", "YouTube URL"],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key} className="space-y-1">
                      <Label>{label}</Label>
                      <Input
                        value={card[key]}
                        onChange={(e) => {
                          const next = [...values.teamCards];
                          next[index] = {
                            ...next[index],
                            [key]: e.target.value,
                          };
                          patch("teamCards", next);
                        }}
                      />
                    </div>
                  ))}
                  <div className="space-y-1 md:col-span-2">
                    <Label>Qualification</Label>
                    <Textarea
                      value={card.qualification}
                      onChange={(e) => {
                        const next = [...values.teamCards];
                        next[index] = {
                          ...next[index],
                          qualification: e.target.value,
                        };
                        patch("teamCards", next);
                      }}
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label>Specialization</Label>
                    <Textarea
                      value={card.specialization}
                      onChange={(e) => {
                        const next = [...values.teamCards];
                        next[index] = {
                          ...next[index],
                          specialization: e.target.value,
                        };
                        patch("teamCards", next);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            onClick={() =>
              patch("teamCards", [...values.teamCards, createEmptyTeamCard()])
            }
          >
            <Plus className="mr-1 size-3.5" /> Add team card
          </Button>
        </div>
      </SectionCard>
    </>
  );
}
