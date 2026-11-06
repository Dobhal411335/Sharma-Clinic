"use client";

import { ListTree, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { NavbarSectionDto } from "@/types/admin/manage-navbar";

type ManageNavbarTableProps = {
  sections: NavbarSectionDto[];
  onEdit: (section: NavbarSectionDto) => void;
  onDelete: (section: NavbarSectionDto) => void;
  onToggleActive: (section: NavbarSectionDto) => void;
};

export function ManageNavbarTable({
  sections,
  onEdit,
  onDelete,
  onToggleActive,
}: ManageNavbarTableProps) {
  const sorted = [...sections].sort(
    (left, right) => (left.order || 0) - (right.order || 0),
  );

  return (
    <Card className="overflow-hidden border-border bg-card shadow-sm">
      <CardHeader className="border-b border-border/70 pb-5">
        <div className="flex items-center gap-2">
          <ListTree className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg font-semibold">Saved Sections</CardTitle>
        </div>
        <CardDescription>
          Currently active and hidden menu items for this site.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Title &amp; URL</th>
                <th className="px-3 py-3 text-center font-medium">Sub-Links</th>
                <th className="px-3 py-3 text-center font-medium">Order</th>
                <th className="px-3 py-3 text-center font-medium">Status</th>
                <th className="px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length > 0 ? (
                sorted.map((section) => (
                  <tr
                    key={section.id}
                    className="border-b border-border/70 last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">
                        {section.title}
                      </div>
                      {section.description ? (
                        <div className="mt-1 max-w-sm text-xs text-muted-foreground">
                          {section.description}
                        </div>
                      ) : null}
                      <div className="mt-1 w-fit rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                        {section.url}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <Badge variant="secondary" className="rounded-full px-2.5">
                        {section.subSections?.length || 0}
                      </Badge>
                    </td>
                    <td className="px-3 py-4 text-center font-medium">
                      {section.order}
                    </td>
                    <td className="px-3 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleActive(section)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                          section.active
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {section.active ? "Active" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9"
                          onClick={() => onEdit(section)}
                          aria-label={`Edit ${section.title}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => onDelete(section)}
                          aria-label={`Delete ${section.title}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    No sections found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
