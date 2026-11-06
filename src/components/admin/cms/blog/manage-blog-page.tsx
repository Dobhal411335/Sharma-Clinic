"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Copy, Newspaper, Pencil, Trash2 } from "lucide-react";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { storefrontBaseUrl } from "@/lib/storefront-url";
import {
  slugifyBlogName,
  validateBlogCreateForm,
  type BlogCreateFormErrors,
} from "@/schemas/blog-schema";
import {
  createBlog,
  deleteBlog,
  fetchBlogs,
  updateBlog,
} from "@/services/api/blog";
import { ApiError } from "@/services/api/errors";
import { showError, showSuccess } from "@/lib/toast";
import type { BlogCreateFormValues, BlogDto } from "@/types/admin/blog";

function createEmptyValues(): BlogCreateFormValues {
  return {
    name: "",
    category: "",
    slug: "",
    badgeText: "",
    stat1Number: "",
    stat1Name: "",
    stat1Text: "",
    stat2Number: "",
    stat2Name: "",
    stat2Text: "",
  };
}

function storefrontBlogUrl(slug: string): string {
  const base = storefrontBaseUrl();
  return `${base}/blog/${encodeURIComponent(slug)}`;
}

export function ManageBlogPage() {
  const [blogs, setBlogs] = useState<BlogDto[]>([]);
  const [values, setValues] = useState<BlogCreateFormValues>(createEmptyValues);
  const [errors, setErrors] = useState<BlogCreateFormErrors>({});
  const [slugTouched, setSlugTouched] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogDto | null>(null);
  const [pendingDelete, setPendingDelete] = useState<BlogDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadBlogs = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchBlogs();
      setBlogs(data);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Failed to load blogs";
      setLoadError(message);
      showError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial blog list
    void loadBlogs();
  }, [loadBlogs]);

  const resetForm = () => {
    setValues(createEmptyValues());
    setErrors({});
    setSlugTouched(false);
    setEditingBlog(null);
  };

  const startEdit = (blog: BlogDto) => {
    setEditingBlog(blog);
    setValues({
      name: blog.name,
      category: blog.category,
      slug: blog.slug,
      badgeText: blog.badgeText,
      stat1Number: blog.stat1Number,
      stat1Name: blog.stat1Name,
      stat1Text: blog.stat1Text,
      stat2Number: blog.stat2Number,
      stat2Name: blog.stat2Name,
      stat2Text: blog.stat2Text,
    });
    setErrors({});
    setSlugTouched(true);
    setPendingDelete(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNameChange = (name: string) => {
    setValues((prev) => ({
      ...prev,
      name,
      slug: slugTouched ? prev.slug : slugifyBlogName(name),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validated = validateBlogCreateForm(values);
    if (!validated.ok) {
      setErrors(validated.errors);
      showError("Please fix the highlighted fields");
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      if (editingBlog) {
        await updateBlog(editingBlog.id, {
          ...editingBlog,
          ...validated.data,
          publishedAt: editingBlog.publishedAt,
          title: editingBlog.title || editingBlog.name,
        });
        showSuccess("Blog updated");
      } else {
        await createBlog(validated.data);
        showSuccess("Blog created");
      }
      resetForm();
      await loadBlogs();
    } catch (error) {
      showError(
        error instanceof ApiError ? error.message : "Failed to create blog",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await deleteBlog(pendingDelete.id);
      showSuccess("Blog deleted");
      if (editingBlog?.id === pendingDelete.id) {
        resetForm();
      }
      setPendingDelete(null);
      await loadBlogs();
    } catch (error) {
      showError(
        error instanceof ApiError ? error.message : "Failed to delete blog",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyUrl = async (blog: BlogDto) => {
    const url = storefrontBlogUrl(blog.slug);
    try {
      await navigator.clipboard.writeText(url);
      showSuccess("Blog URL copied");
    } catch {
      showError("Could not copy URL");
    }
  };

  return (
    <AdminAppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        {loadError ? (
          <Alert variant="destructive">
            <AlertTitle>Could not load blogs</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border/70">
              <div className="flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-semibold">
                  {editingBlog ? "Edit blog" : "Create blog"}
                </CardTitle>
              </div>
              <CardDescription>
                Add the landing-card badge and optional stat cards here. Slug is
                generated from the name and can be edited before saving.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="blog-name">Blog name</Label>
                  <Input
                    id="blog-name"
                    value={values.name}
                    onChange={(event) => handleNameChange(event.target.value)}
                    placeholder="e.g. Morning routine tips"
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name ? (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blog-category">Blog category</Label>
                  <Input
                    id="blog-category"
                    value={values.category}
                    onChange={(event) =>
                      setValues((prev) => ({
                        ...prev,
                        category: event.target.value,
                      }))
                    }
                    placeholder="e.g. Education"
                    aria-invalid={Boolean(errors.category)}
                  />
                  {errors.category ? (
                    <p className="text-sm text-destructive">{errors.category}</p>
                  ) : null}
                </div>
              </div>
              <div className="space-y-4 rounded-lg border border-border/70 p-4">
                <div>
                  <Label htmlFor="blog-badge">Landing card badge (optional)</Label>
                  <Input
                    id="blog-badge"
                    value={values.badgeText}
                    onChange={(event) =>
                      setValues((prev) => ({ ...prev, badgeText: event.target.value }))
                    }
                    placeholder="e.g. Transformation · Technology"
                  />
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {([1, 2] as const).map((number) => (
                    <div key={number} className="space-y-3 rounded-md bg-muted/30 p-3">
                      <p className="text-sm font-medium">Stat card {number} (optional)</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                          value={values[`stat${number}Number`]}
                          onChange={(event) =>
                            setValues((prev) => ({
                              ...prev,
                              [`stat${number}Number`]: event.target.value,
                            }))
                          }
                          placeholder="Number, e.g. 32%"
                          aria-label={`Stat card ${number} number`}
                        />
                        <Input
                          value={values[`stat${number}Name`]}
                          onChange={(event) =>
                            setValues((prev) => ({
                              ...prev,
                              [`stat${number}Name`]: event.target.value,
                            }))
                          }
                          placeholder="Name, e.g. faster decisions"
                          aria-label={`Stat card ${number} name`}
                        />
                      </div>
                      <Input
                        value={values[`stat${number}Text`]}
                        onChange={(event) =>
                          setValues((prev) => ({
                            ...prev,
                            [`stat${number}Text`]: event.target.value,
                          }))
                        }
                        placeholder="Optional supporting text"
                        aria-label={`Stat card ${number} supporting text`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? editingBlog
                      ? "Updating…"
                      : "Creating…"
                    : editingBlog
                      ? "Update blog"
                      : "Create blog"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  {editingBlog ? "Cancel" : "Clear"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/70">
            <CardTitle className="text-lg font-semibold">Existing blogs</CardTitle>
            <CardDescription>
              Edit the blog details above, delete a post, or open the full editor.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <p className="py-8 text-sm text-muted-foreground">Loading blogs…</p>
            ) : blogs.length === 0 ? (
              <p className="py-8 text-sm text-muted-foreground">
                No blogs yet. Create one above.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogs.map((blog) => {
                    return (
                      <TableRow key={blog.id}>
                        <TableCell className="max-w-[220px] font-medium">
                          {blog.name}
                        </TableCell>
                        <TableCell>{blog.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-7 shrink-0"
                              onClick={() => void handleCopyUrl(blog)}
                              aria-label={`Copy storefront URL for ${blog.name}`}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(blog)}
                            >
                              <Pencil className="mr-1 size-3.5" aria-hidden />
                              Edit
                            </Button>
                            <Button asChild size="sm">
                              <Link
                                href={`/admin/blog/${blog.id}`}
                              >
                                Edit Blog
                              </Link>
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => setPendingDelete(blog)}
                            >
                              <Trash2 className="mr-1 size-3.5" aria-hidden />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
            <AlertDialogTitle>Delete blog?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes “{pendingDelete?.name}” and its cover
              image. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminAppShell>
  );
}
