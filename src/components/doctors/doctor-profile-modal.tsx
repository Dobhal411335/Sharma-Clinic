"use client";

import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDoctorDisplayName, type DoctorProfile } from "@/types/doctors";

type DoctorProfileModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: DoctorProfile | null;
  onSelectSpecialization?: (specialization: string) => void;
  onSelectLocation?: (location: { state: string; city: string }) => void;
};

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card size="sm" className="border border-border shadow-none ring-0">
      <CardHeader className="border-b">
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function TextBlock({ value }: { value: string }) {
  if (!value.trim()) return null;
  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
      {value}
    </p>
  );
}

export function DoctorProfileModal({
  open,
  onOpenChange,
  doctor,
  onSelectSpecialization,
  onSelectLocation,
}: DoctorProfileModalProps) {
  const phoneHref = doctor?.phone ? `tel:${doctor.phone.replace(/\s/g, "")}` : "";
  const hasQualification = Boolean(
    doctor &&
      (doctor.education.trim() ||
        doctor.degree.trim() ||
        doctor.workHistory.trim() ||
        doctor.workDays.trim()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="h-[90vh] max-h-[90vh] overflow-hidden p-0 sm:max-w-4xl"
      >
        {doctor ? (
          <div className="flex h-full min-h-0 flex-col md:grid md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <div className="relative h-56 shrink-0 overflow-hidden bg-muted md:h-full">
              {/* eslint-disable-next-line @next/next/no-img-element -- CMS Cloudinary URL */}
              <img
                src={doctor.photoUrl}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-6 pr-12 md:h-full md:p-8 md:pr-14">
              <DialogHeader className="space-y-2 text-left">
                <DialogTitle className="text-2xl font-bold tracking-tight">
                  {formatDoctorDisplayName(doctor.name)}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Profile details for {formatDoctorDisplayName(doctor.name)}
                </DialogDescription>
                {doctor.specializations.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {doctor.specializations.map((item) =>
                      onSelectSpecialization ? (
                        <button
                          key={item}
                          type="button"
                          onClick={() => onSelectSpecialization(item)}
                          className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                        >
                          {item}
                        </button>
                      ) : (
                        <span
                          key={item}
                          className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                        >
                          {item}
                        </span>
                      ),
                    )}
                  </div>
                ) : null}
              </DialogHeader>

              {doctor.about.trim() ? (
                <Section title="About">
                  <TextBlock value={doctor.about} />
                </Section>
              ) : null}

              {doctor.phone.trim() || doctor.email.trim() ? (
                <Section title="Contact">
                  <div className="space-y-1 text-sm">
                    {doctor.phone.trim() ? (
                      <p>
                        <a
                          href={phoneHref}
                          className="font-medium text-primary hover:underline"
                        >
                          {doctor.phone}
                        </a>
                      </p>
                    ) : null}
                    {doctor.email.trim() ? (
                      <p>
                        <a
                          href={`mailto:${doctor.email}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {doctor.email}
                        </a>
                      </p>
                    ) : null}
                  </div>
                </Section>
              ) : null}

              {doctor.location.trim() || doctor.city.trim() || doctor.state.trim() ? (
                <Section title="Location">
                  <TextBlock value={doctor.location} />
                  {doctor.city.trim() || doctor.state.trim() ? (
                    onSelectLocation ? (
                      <button
                        type="button"
                        onClick={() =>
                          onSelectLocation({
                            state: doctor.state,
                            city: doctor.city,
                          })
                        }
                        className="text-left text-sm font-medium text-primary hover:underline"
                      >
                        {[doctor.city, doctor.state].filter(Boolean).join(", ")}
                      </button>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {[doctor.city, doctor.state].filter(Boolean).join(", ")}
                      </p>
                    )
                  ) : null}
                </Section>
              ) : null}

              {doctor.experienceYears > 0 ? (
                <Section title="Experience">
                  <p className="text-sm text-foreground">
                    {doctor.experienceYears} years
                  </p>
                </Section>
              ) : null}

              {hasQualification ? (
                <Section title="Qualification">
                  <div className="divide-y divide-border">
                    {doctor.education.trim() ? (
                      <div className="py-3 first:pt-0 last:pb-0">
                        <p className="text-sm font-semibold text-foreground">Education</p>
                        <TextBlock value={doctor.education} />
                      </div>
                    ) : null}
                    {doctor.degree.trim() ? (
                      <div className="py-3 first:pt-0 last:pb-0">
                        <p className="text-sm font-semibold text-foreground">Degree</p>
                        <TextBlock value={doctor.degree} />
                      </div>
                    ) : null}
                    {doctor.workHistory.trim() ? (
                      <div className="py-3 first:pt-0 last:pb-0">
                        <p className="text-sm font-semibold text-foreground">
                          Work history
                        </p>
                        <TextBlock value={doctor.workHistory} />
                      </div>
                    ) : null}
                    {doctor.workDays.trim() ? (
                      <div className="py-3 first:pt-0 last:pb-0">
                        <p className="text-sm font-semibold text-foreground">Work days</p>
                        <TextBlock value={doctor.workDays} />
                      </div>
                    ) : null}
                  </div>
                </Section>
              ) : null}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
