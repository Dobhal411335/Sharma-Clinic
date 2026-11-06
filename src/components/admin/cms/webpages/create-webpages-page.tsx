"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Copy, FileText, Pencil, Trash2, X } from "lucide-react";

import { AdminAppShell } from "@/components/layout/admin-app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { storefrontBaseUrl } from "@/lib/storefront-url";
import { showError, showSuccess } from "@/lib/toast";
import {
  createWebpage,
  deleteWebpage,
  fetchWebpages,
  patchWebpageMeta,
} from "@/services/api/webpages";
import { ApiError } from "@/services/api/errors";
import {
  WEBPAGE_TEMPLATE_TYPES,
  type WebpageListDto,
  type WebpageTemplateType,
} from "@/types/admin/webpages";

const TEMPLATE_OPTIONS: { value: WebpageTemplateType; label: string }[] = [
  { value: "design1", label: "Design 1" },
  { value: "design2", label: "Design 2" },
  { value: "design3", label: "Design 3" },
  { value: "design4", label: "Design 4" },
  { value: "design5", label: "Blog Page Design" },
  { value: "design6", label: "Team Page Design" },
  { value: "design7", label: "Gallery Page Design" },
  { value: "design9", label: "Our Philosophy Design" },
  { value: "design10", label: "About Us Design" },
  { value: "design11", label: "Our Services Design" },
  { value: "design12", label: "Services Details Design" },
  { value: "design13", label: "Contact Us Design" },
  { value: "design14", label: "Industries Design" },
  { value: "design15", label: "Terms and Conditions Design" },
];

function slugifyTitle(title: string): string {
  return (
    title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 160) || "page"
  );
}

function templateLabel(templateType: string): string {
  return (
    TEMPLATE_OPTIONS.find((option) => option.value === templateType)?.label ||
    templateType
  );
}

function publicWebpageUrl(slug: string): string {
  return `${storefrontBaseUrl()}/${encodeURIComponent(slug)}`;
}

function asTemplateType(value: string): WebpageTemplateType {
  return (WEBPAGE_TEMPLATE_TYPES as readonly string[]).includes(value)
    ? (value as WebpageTemplateType)
    : "design1";
}

export function CreateWebpagesPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pages, setPages] = useState<WebpageListDto[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [active, setActive] = useState(true);
  const [templateType, setTemplateType] =
    useState<WebpageTemplateType>("design1");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<WebpageListDto | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const isEditing = Boolean(editingId);

  const loadPages = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchWebpages();
      setPages(data);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Failed to load webpages";
      setLoadError(message);
      showError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial list
    void loadPages();
  }, [loadPages]);

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setSlugTouched(false);
    setActive(true);
    setTemplateType("design1");
    setEditingId(null);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugifyTitle(value));
    }
  };

  const startEditMeta = (page: WebpageListDto) => {
    setEditingId(page.id);
    setTitle(page.title);
    setSlug(page.slug);
    setSlugTouched(true);
    setActive(page.active);
    setTemplateType(asTemplateType(page.templateType));
    setPendingDelete(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      showError("Title is required");
      return;
    }

    const nextSlug = (slug.trim() || slugifyTitle(title)).toLowerCase();

    setIsSubmitting(true);
    try {
      if (editingId) {
        await patchWebpageMeta(editingId, {
          title: title.trim(),
          slug: nextSlug,
          active,
          templateType,
        });
        showSuccess("Webpage updated");
      } else {
        await createWebpage({
          title: title.trim(),
          slug: nextSlug,
          active,
          templateType,
        });
        showSuccess("Webpage created");
      }
      resetForm();
      await loadPages();
    } catch (error) {
      showError(
        error instanceof ApiError
          ? error.message
          : editingId
            ? "Failed to update webpage"
            : "Failed to create webpage",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (page: WebpageListDto) => {
    try {
      await patchWebpageMeta(page.id, { active: !page.active });
      showSuccess(`Webpage is now ${!page.active ? "active" : "inactive"}`);
      if (editingId === page.id) {
        setActive(!page.active);
      }
      await loadPages();
    } catch (error) {
      showError(
        error instanceof ApiError
          ? error.message
          : "Failed to update webpage status",
      );
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await deleteWebpage(pendingDelete.id);
      showSuccess("Webpage deleted");
      if (editingId === pendingDelete.id) {
        resetForm();
      }
      setPendingDelete(null);
      await loadPages();
    } catch (error) {
      showError(
        error instanceof ApiError ? error.message : "Failed to delete webpage",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyUrl = async (page: WebpageListDto) => {
    try {
      await navigator.clipboard.writeText(publicWebpageUrl(page.slug));
      showSuccess("URL copied");
    } catch {
      showError("Could not copy URL");
    }
  };

  return (
    <AdminAppShell>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit webpage" : "New webpage"}</CardTitle>
            <CardDescription>
              {isEditing
                ? "Update title, slug, template, or active status, then save."
                : "Choose a template, then open Edit content from the table for SEO and design fields."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              ref={formRef}
              className="space-y-4"
              onSubmit={handleSubmit}
            >
              <div className="flex w-full flex-col gap-4 md:flex-row md:items-end">
                <div className="w-full min-w-0 md:w-[75%]">
                  <Label htmlFor="webpage-title">Title</Label>
                  <Input
                    id="webpage-title"
                    value={title}
                    onChange={(event) => handleTitleChange(event.target.value)}
                    placeholder="Our Story"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="w-full min-w-0 md:w-[25%]">
                  <Label>Template</Label>
                  <Select
                    value={templateType}
                    onValueChange={(value) =>
                      setTemplateType(value as WebpageTemplateType)
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select design" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {TEMPLATE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full">
                <Switch
                  id="webpage-active"
                  checked={active}
                  onCheckedChange={setActive}
                  disabled={isSubmitting}
                />
                <Label htmlFor="webpage-active">Active</Label>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? isEditing
                      ? "Saving…"
                      : "Creating…"
                    : isEditing
                      ? "Save changes"
                      : "Create webpage"}
                </Button>
                {isEditing ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={resetForm}
                  >
                    <X className="mr-1.5 size-4" aria-hidden />
                    Cancel edit
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Webpages</CardTitle>
            <CardDescription>
              Pencil edits meta in the form above. Document icon opens the design
              content editor. Public URL uses the page slug.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadError ? (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Could not load webpages</AlertTitle>
                <AlertDescription>{loadError}</AlertDescription>
              </Alert>
            ) : null}

            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : pages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No webpages yet. Create one above.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead className="text-start">Copy URL</TableHead>
                    <TableHead className="text-start">Active</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow
                      key={page.id}
                      className={
                        editingId === page.id ? "bg-muted/40" : undefined
                      }
                    >
                      <TableCell>{page.title}</TableCell>
                      <TableCell>{templateLabel(page.templateType)}</TableCell>
                      <TableCell className="text-start">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          title="Copy URL"
                          onClick={() => void handleCopyUrl(page)}
                        >
                          <Copy className="size-4" />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={page.active}
                          onCheckedChange={() => void handleToggleActive(page)}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            asChild
                            title="Edit content"
                          >
                            <Link
                              href={`/admin/webpages/${page.id}`}
                            >
                              <FileText className="size-4" />
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            title="Edit in form"
                            onClick={() => startEditMeta(page)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            title="Delete"
                            onClick={() => setPendingDelete(page)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete webpage?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes “{pendingDelete?.title}” and its media
              references.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDelete()}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminAppShell>
  );
}
