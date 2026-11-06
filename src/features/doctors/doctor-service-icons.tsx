import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Ambulance,
  Baby,
  Bone,
  Brain,
  Eye,
  FlaskConical,
  HeartPulse,
  Hospital,
  LayoutGrid,
  Microscope,
  Pill,
  Scan,
  Stethoscope,
  Syringe,
  Thermometer,
} from "lucide-react";

export const DOCTOR_SERVICE_ICONS: Record<string, LucideIcon> = {
  Stethoscope,
  HeartPulse,
  Ambulance,
  FlaskConical,
  Eye,
  LayoutGrid,
  Bone,
  Brain,
  Baby,
  Pill,
  Activity,
  Syringe,
  Hospital,
  Microscope,
  Thermometer,
  Scan,
};

export const DOCTOR_SERVICE_ICON_TONES = [
  "bg-rose-100 text-rose-600 shadow-rose-200/80",
  "bg-violet-100 text-violet-600 shadow-violet-200/80",
  "bg-sky-100 text-sky-600 shadow-sky-200/80",
  "bg-indigo-100 text-indigo-600 shadow-indigo-200/80",
  "bg-teal-100 text-teal-700 shadow-teal-200/80",
  "bg-emerald-100 text-emerald-700 shadow-emerald-200/80",
  "bg-amber-100 text-amber-700 shadow-amber-200/80",
  "bg-cyan-100 text-cyan-700 shadow-cyan-200/80",
] as const;

export function getDoctorServiceIcon(iconKey: string): LucideIcon {
  return DOCTOR_SERVICE_ICONS[iconKey] ?? Stethoscope;
}
