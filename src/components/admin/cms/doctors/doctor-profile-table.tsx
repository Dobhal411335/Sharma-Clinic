"use client";

import {
  ArrowDown,
  ArrowUp,
  ImageIcon,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DoctorProfileDto } from "@/types/admin/doctor-profile";

type DoctorProfileTableProps = {
  doctors: DoctorProfileDto[];
  onEdit: (doctor: DoctorProfileDto) => void;
  onDelete: (doctor: DoctorProfileDto) => void;
  onToggleActive: (doctor: DoctorProfileDto) => void;
  onMove: (doctor: DoctorProfileDto, direction: "up" | "down") => void;
};

export function DoctorProfileTable({
  doctors,
  onEdit,
  onDelete,
  onToggleActive,
  onMove,
}: DoctorProfileTableProps) {
  const sorted = [...doctors].sort(
    (left, right) => (left.order || 0) - (right.order || 0),
  );

  return (
    <Card className="overflow-hidden border-border bg-card shadow-sm">
      <CardHeader className="border-b border-border/70 pb-5">
        <div className="flex items-center gap-2">
          <UserRound className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg font-semibold">Doctor profiles</CardTitle>
        </div>
        <CardDescription>
          Reorder, edit, and control storefront visibility for doctor cards.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground">
              <tr>
                <th className="w-14 px-4 py-3 text-center font-medium">#</th>
                <th className="w-28 px-3 py-3 text-center font-medium">Photo</th>
                <th className="px-3 py-3 font-medium">Doctor</th>
                <th className="px-3 py-3 font-medium">Specialization</th>
                <th className="w-28 px-3 py-3 text-center font-medium">Exp.</th>
                <th className="w-44 px-3 py-3 font-medium">Location</th>
                <th className="w-28 px-3 py-3 text-center font-medium">Status</th>
                <th className="w-40 px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length > 0 ? (
                sorted.map((doctor, index) => (
                  <tr
                    key={doctor.id}
                    className="border-b border-border/70 last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-4 text-center text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="px-3 py-4">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/40">
                        {doctor.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
                          <img
                            src={doctor.photoUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-medium text-foreground">{doctor.name}</p>
                      <p className="mt-1 line-clamp-2 max-w-xs text-xs text-muted-foreground">
                        {doctor.about}
                      </p>
                    </td>
                    <td className="px-3 py-4 text-muted-foreground">
                      {doctor.specializations.join(", ") || "—"}
                    </td>
                    <td className="px-3 py-4 text-center">
                      {doctor.experienceYears} yrs
                    </td>
                    <td className="px-3 py-4 text-muted-foreground">
                      {[doctor.city, doctor.state].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-3 py-4 text-center">
                      <button type="button" onClick={() => onToggleActive(doctor)}>
                        <Badge variant={doctor.active ? "default" : "secondary"}>
                          {doctor.active ? "Active" : "Hidden"}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label="Move up"
                          onClick={() => onMove(doctor, "up")}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label="Move down"
                          onClick={() => onMove(doctor, "down")}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label="Edit"
                          onClick={() => onEdit(doctor)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label="Delete"
                          onClick={() => onDelete(doctor)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No doctor profiles yet. Create the first profile above.
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
