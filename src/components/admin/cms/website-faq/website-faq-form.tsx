"use client";

import { ChevronDown, ChevronUp, HelpCircle, Plus, Trash2 } from "lucide-react";

import {
  createEmptyItem,
  createEmptySection,
  moveItem,
} from "@/components/admin/cms/website-faq/website-faq-form-utils";
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
import type { WebsiteFaqFormErrors } from "@/schemas/website-faq-schema";
import type { WebsiteFaqFormValues } from "@/types/admin/website-faq";

type WebsiteFaqFormProps = {
  values: WebsiteFaqFormValues;
  errors: WebsiteFaqFormErrors;
  onChange: (next: WebsiteFaqFormValues) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  formId?: string;
};

export function WebsiteFaqForm({
  values,
  errors,
  onChange,
  onSubmit,
  formId = "website-faq-form",
}: WebsiteFaqFormProps) {
  return (
    <form id={formId} onSubmit={onSubmit} className="space-y-6">
      <Card className="overflow-hidden border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border/70 pb-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-semibold">FAQ sections</CardTitle>
              </div>
              <CardDescription className="mt-1">
                Add headings (General, Shipping) and question cards. Only items
                marked “Show on landing page” appear in the home snippet.
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
                  sections: [...values.sections, createEmptySection()],
                })
              }
            >
              <Plus className="h-4 w-4" />
              Add FAQ section
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {errors.sections ? (
            <p className="text-xs text-destructive">{errors.sections}</p>
          ) : null}
          {values.sections.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No FAQ sections yet. Add a section heading and then questions.
            </p>
          ) : null}

          {values.sections.map((section, sectionIndex) => (
            <div
              key={`section-${sectionIndex}`}
              className="space-y-4 rounded-xl border border-border bg-muted/20 p-4"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_120px]">
                  <div className="grid gap-2">
                    <Label>Section heading</Label>
                    <Input
                      value={section.title}
                      onChange={(event) => {
                        const sections = values.sections.map((item, index) =>
                          index === sectionIndex
                            ? { ...item, title: event.target.value }
                            : item,
                        );
                        onChange({ ...values, sections });
                      }}
                      placeholder="e.g. General"
                      className="h-11"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Order</Label>
                    <Input
                      type="number"
                      value={section.order}
                      onChange={(event) => {
                        const sections = values.sections.map((item, index) =>
                          index === sectionIndex
                            ? { ...item, order: event.target.value }
                            : item,
                        );
                        onChange({ ...values, sections });
                      }}
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1 sm:pt-7">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={section.active}
                      onCheckedChange={(checked) => {
                        const sections = values.sections.map((item, index) =>
                          index === sectionIndex ? { ...item, active: checked } : item,
                        );
                        onChange({ ...values, sections });
                      }}
                    />
                    <span className="text-xs text-muted-foreground">Active</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={sectionIndex === 0}
                    onClick={() =>
                      onChange({
                        ...values,
                        sections: moveItem(values.sections, sectionIndex, "up"),
                      })
                    }
                    aria-label="Move section up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={sectionIndex === values.sections.length - 1}
                    onClick={() =>
                      onChange({
                        ...values,
                        sections: moveItem(values.sections, sectionIndex, "down"),
                      })
                    }
                    aria-label="Move section down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() =>
                      onChange({
                        ...values,
                        sections: values.sections.filter(
                          (_, index) => index !== sectionIndex,
                        ),
                      })
                    }
                    aria-label="Delete section"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">Questions</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5"
                    onClick={() => {
                      const sections = values.sections.map((item, index) =>
                        index === sectionIndex
                          ? { ...item, items: [...item.items, createEmptyItem()] }
                          : item,
                      );
                      onChange({ ...values, sections });
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add question
                  </Button>
                </div>

                {section.items.map((item, itemIndex) => (
                  <div
                    key={`item-${sectionIndex}-${itemIndex}`}
                    className="space-y-3 rounded-lg border border-border/70 bg-background p-3"
                  >
                    <div className="grid gap-3 sm:grid-cols-[1fr_100px]">
                      <div className="grid gap-2">
                        <Label className="text-xs">Question heading</Label>
                        <Input
                          value={item.question}
                          onChange={(event) => {
                            const sections = values.sections.map((sectionItem, index) => {
                              if (index !== sectionIndex) return sectionItem;
                              return {
                                ...sectionItem,
                                items: sectionItem.items.map((entry, entryIndex) =>
                                  entryIndex === itemIndex
                                    ? { ...entry, question: event.target.value }
                                    : entry,
                                ),
                              };
                            });
                            onChange({ ...values, sections });
                          }}
                          placeholder="How do returns work?"
                          className="h-10"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-xs">Order</Label>
                        <Input
                          type="number"
                          value={item.order}
                          onChange={(event) => {
                            const sections = values.sections.map((sectionItem, index) => {
                              if (index !== sectionIndex) return sectionItem;
                              return {
                                ...sectionItem,
                                items: sectionItem.items.map((entry, entryIndex) =>
                                  entryIndex === itemIndex
                                    ? { ...entry, order: event.target.value }
                                    : entry,
                                ),
                              };
                            });
                            onChange({ ...values, sections });
                          }}
                          className="h-10"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label className="text-xs">Description / answer</Label>
                      <Textarea
                        value={item.answer}
                        onChange={(event) => {
                          const sections = values.sections.map((sectionItem, index) => {
                            if (index !== sectionIndex) return sectionItem;
                            return {
                              ...sectionItem,
                              items: sectionItem.items.map((entry, entryIndex) =>
                                entryIndex === itemIndex
                                  ? { ...entry, answer: event.target.value }
                                  : entry,
                              ),
                            };
                          });
                          onChange({ ...values, sections });
                        }}
                        placeholder="Write the answer shown on the FAQ page…"
                        className="min-h-24"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-4">
                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Switch
                            checked={item.showOnLanding}
                            onCheckedChange={(checked) => {
                              const sections = values.sections.map((sectionItem, index) => {
                                if (index !== sectionIndex) return sectionItem;
                                return {
                                  ...sectionItem,
                                  items: sectionItem.items.map((entry, entryIndex) =>
                                    entryIndex === itemIndex
                                      ? { ...entry, showOnLanding: checked }
                                      : entry,
                                  ),
                                };
                              });
                              onChange({ ...values, sections });
                            }}
                          />
                          Show on landing page
                        </label>
                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Switch
                            checked={item.active}
                            onCheckedChange={(checked) => {
                              const sections = values.sections.map((sectionItem, index) => {
                                if (index !== sectionIndex) return sectionItem;
                                return {
                                  ...sectionItem,
                                  items: sectionItem.items.map((entry, entryIndex) =>
                                    entryIndex === itemIndex
                                      ? { ...entry, active: checked }
                                      : entry,
                                  ),
                                };
                              });
                              onChange({ ...values, sections });
                            }}
                          />
                          Active
                        </label>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={itemIndex === 0}
                          onClick={() => {
                            const sections = values.sections.map((sectionItem, index) =>
                              index === sectionIndex
                                ? {
                                    ...sectionItem,
                                    items: moveItem(sectionItem.items, itemIndex, "up"),
                                  }
                                : sectionItem,
                            );
                            onChange({ ...values, sections });
                          }}
                          aria-label="Move question up"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={itemIndex === section.items.length - 1}
                          onClick={() => {
                            const sections = values.sections.map((sectionItem, index) =>
                              index === sectionIndex
                                ? {
                                    ...sectionItem,
                                    items: moveItem(sectionItem.items, itemIndex, "down"),
                                  }
                                : sectionItem,
                            );
                            onChange({ ...values, sections });
                          }}
                          aria-label="Move question down"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            const sections = values.sections.map((sectionItem, index) =>
                              index === sectionIndex
                                ? {
                                    ...sectionItem,
                                    items: sectionItem.items.filter(
                                      (_, entryIndex) => entryIndex !== itemIndex,
                                    ),
                                  }
                                : sectionItem,
                            );
                            onChange({ ...values, sections });
                          }}
                          aria-label="Delete question"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </form>
  );
}
