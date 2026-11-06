"use client";

import { LayoutTemplate, Plus, RefreshCcw, Trash2 } from "lucide-react";

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
import type { NavbarSectionFormErrors } from "@/schemas/manage-navbar-schema";
import type { NavbarSectionFormValues } from "@/types/admin/manage-navbar";
import { createSubSectionFormValues } from "@/components/admin/cms/manage-navbar/manage-navbar-form-utils";

type ManageNavbarFormProps = {
  values: NavbarSectionFormValues;
  errors: NavbarSectionFormErrors;
  isSubmitting: boolean;
  isEditing: boolean;
  onChange: (values: NavbarSectionFormValues) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
};

export function ManageNavbarForm({
  values,
  errors,
  isSubmitting,
  isEditing,
  onChange,
  onSubmit,
  onReset,
}: ManageNavbarFormProps) {
  const updateField = <K extends keyof NavbarSectionFormValues>(
    key: K,
    value: NavbarSectionFormValues[K],
  ) => {
    onChange({ ...values, [key]: value });
  };

  const updateSubSection = (
    index: number,
    key: keyof NavbarSectionFormValues["subSections"][number],
    value: string | boolean,
  ) => {
    onChange({
      ...values,
      subSections: values.subSections.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    });
  };

  return (
    <Card className="overflow-hidden border-border bg-card shadow-sm">
      <CardHeader className="border-b border-border/70 pb-5">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg font-semibold">
            {isEditing ? "Edit Navbar Section" : "Add New Section"}
          </CardTitle>
        </div>
        <CardDescription>
          Configure the main navigation link and optional nested dropdowns.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form id="manage-navbar-form" onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="navbar-title">
              Section Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="navbar-title"
              value={values.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="e.g. Shop"
              className="h-11"
              aria-invalid={Boolean(errors.title)}
            />
            {errors.title ? (
              <p className="text-xs text-destructive">{errors.title}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="navbar-description">Description</Label>
            <Input
              id="navbar-description"
              value={values.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="A short description for the featured dropdown panel"
              className="h-11"
            />
          </div>

          <div className="grid gap-5 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="navbar-menu-heading">Dropdown Heading</Label>
              <Input
                id="navbar-menu-heading"
                value={values.menuHeading}
                onChange={(event) => updateField("menuHeading", event.target.value)}
                placeholder="Strategy through delivery."
                className="h-11"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="navbar-menu-description">Dropdown Description</Label>
              <Input
                id="navbar-menu-description"
                value={values.menuDescription}
                onChange={(event) => updateField("menuDescription", event.target.value)}
                placeholder="Complete capabilities and services"
                className="h-11"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="navbar-url">Section URL</Label>
              <Input
                id="navbar-url"
                value={values.url}
                onChange={(event) => updateField("url", event.target.value)}
                placeholder="/category"
                className="h-11"
                aria-invalid={Boolean(errors.url)}
              />
              {errors.url ? (
                <p className="text-xs text-destructive">{errors.url}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="navbar-order">Display Order</Label>
              <Input
                id="navbar-order"
                type="number"
                value={values.order}
                onChange={(event) => updateField("order", event.target.value)}
                placeholder="1"
                className="h-11"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-5 py-4">
            <div>
              <Label htmlFor="navbar-active" className="text-sm font-semibold">
                Visibility Status
              </Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Hide this section without deleting it.
              </p>
            </div>
            <Switch
              id="navbar-active"
              checked={values.active}
              onCheckedChange={(checked) => updateField("active", checked)}
            />
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">Nested Dropdowns</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add sub-links under this section.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 gap-2"
                onClick={() =>
                  onChange({
                    ...values,
                    subSections: [
                      ...values.subSections,
                      createSubSectionFormValues(),
                    ],
                  })
                }
              >
                <Plus className="size-4" />
                Add Link
              </Button>
            </div>

            <div className="space-y-4">
              {values.subSections.map((subSection, index) => (
                <div
                  key={`sub-${index}`}
                  className="relative rounded-xl border border-border bg-background p-5"
                >
                  <div className="absolute right-3 top-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() =>
                        onChange({
                          ...values,
                          subSections: values.subSections.filter(
                            (_, itemIndex) => itemIndex !== index,
                          ),
                        })
                      }
                      disabled={values.subSections.length === 1}
                      aria-label={`Remove sub-link ${index + 1}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <div className="mt-1 grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2 sm:col-span-2 pr-10">
                      <Label htmlFor={`sub-title-${index}`}>Link Title</Label>
                      <Input
                        id={`sub-title-${index}`}
                        value={subSection.title}
                        onChange={(event) =>
                          updateSubSection(index, "title", event.target.value)
                        }
                        placeholder="e.g. Serums"
                        className="h-10"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`sub-url-${index}`}>Link URL</Label>
                      <Input
                        id={`sub-url-${index}`}
                        value={subSection.url}
                        onChange={(event) =>
                          updateSubSection(index, "url", event.target.value)
                        }
                        placeholder="/category/serums"
                        className="h-10"
                      />
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
                      <Label htmlFor={`sub-description-${index}`}>Small Description</Label>
                      <Input
                        id={`sub-description-${index}`}
                        value={subSection.description}
                        onChange={(event) =>
                          updateSubSection(index, "description", event.target.value)
                        }
                        placeholder="Complete capabilities"
                        className="h-10"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`sub-order-${index}`}>Order</Label>
                      <Input
                        id={`sub-order-${index}`}
                        type="number"
                        value={subSection.order}
                        onChange={(event) =>
                          updateSubSection(index, "order", event.target.value)
                        }
                        placeholder="1"
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <Switch
                      id={`sub-active-${index}`}
                      checked={subSection.active}
                      onCheckedChange={(checked) =>
                        updateSubSection(index, "active", checked)
                      }
                    />
                    <Label htmlFor={`sub-active-${index}`} className="text-xs">
                      Active Link
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-border pt-4">
            <Button
              type="submit"
              className="h-11 flex-1 bg-primary hover:bg-primary-hover"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Update Section"
                  : "Create Section"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 px-4"
              onClick={onReset}
              aria-label="Reset form"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
