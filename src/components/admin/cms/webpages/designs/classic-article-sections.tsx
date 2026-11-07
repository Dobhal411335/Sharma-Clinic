"use client";

import {
  AlignLeft,
  FileText,
  Plus,
  Quote,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  Button,
  ImageAssetField,
  Input,
  Label,
  RichHtmlField,
  SectionCard,
  StringListField,
} from "@/components/admin/cms/webpages/webpage-form-fields";
import { createEmptyParagraphSection } from "@/components/admin/cms/webpages/webpage-form-state";
import { uploadWebpageImage } from "@/services/api/webpages";
import type { WebpageEditFormValues } from "@/types/admin/webpages";

type Props = {
  webpageId: string;
  values: WebpageEditFormValues;
  setValues: React.Dispatch<React.SetStateAction<WebpageEditFormValues>>;
};

/** Shared highlights, paragraphs, table, and blockquote used by designs 1–4. */
export function ClassicArticleSections({
  webpageId,
  values,
  setValues,
}: Props) {
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
                webpageId={webpageId}
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
                              bulletPoints: (
                                next[index].bulletPoints || []
                              ).filter((_, i) => i !== bulletIndex),
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
                webpageId={webpageId}
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
          webpageId={webpageId}
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
    </>
  );
}
