"use client";

import { useMemo, useState } from "react";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { careerHeardAbout, careerPositions } from "@/data/careers";
import { publicApiFetch, toApiError } from "@/lib/api/client";
import { showError, showSuccess } from "@/lib/toast";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const RESUME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_RESUME_BYTES = 5 * 1024 * 1024;

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: string }) {
  return (
    <Label htmlFor={htmlFor} className="text-sm font-medium text-[#17283d]">
      {children}
    </Label>
  );
}

function Hint({ children }: { children: string }) {
  return <p className="mt-1 text-xs text-[#7b8794]">{children}</p>;
}

export function CareerApplicationForm() {
  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 70 }, (_, index) => String(current - index));
  }, []);
  const days = useMemo(() => Array.from({ length: 31 }, (_, index) => String(index + 1)), []);

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [streetAddressLine2, setStreetAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [positionApplied, setPositionApplied] = useState("");
  const [heardAbout, setHeardAbout] = useState("");
  const [availableStartDate, setAvailableStartDate] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function chooseResume(file: File | null) {
    if (!file) {
      setResume(null);
      return;
    }
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const typeAllowed =
      !file.type ||
      file.type === "application/octet-stream" ||
      RESUME_TYPES.has(file.type);
    if (!["pdf", "doc", "docx"].includes(extension) || !typeAllowed) {
      showError("Upload a PDF, DOC, or DOCX résumé");
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      showError("Résumé must be 5 MB or smaller");
      return;
    }
    setResume(file);
  }

  function resetForm() {
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setBirthMonth("");
    setBirthDay("");
    setBirthYear("");
    setStreetAddress("");
    setStreetAddressLine2("");
    setCity("");
    setState("");
    setPostalCode("");
    setEmail("");
    setPhone("");
    setLinkedIn("");
    setPositionApplied("");
    setHeardAbout("");
    setAvailableStartDate("");
    setResume(null);
    setCompanyWebsite("");
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !birthMonth ||
      !birthDay ||
      !birthYear ||
      !positionApplied ||
      !heardAbout ||
      !resume
    ) {
      showError("Complete every required field, including your résumé");
      return;
    }

    const formData = new FormData();
    formData.set("firstName", firstName);
    formData.set("middleName", middleName);
    formData.set("lastName", lastName);
    formData.set("birthMonth", birthMonth);
    formData.set("birthDay", birthDay);
    formData.set("birthYear", birthYear);
    formData.set("streetAddress", streetAddress);
    formData.set("streetAddressLine2", streetAddressLine2);
    formData.set("city", city);
    formData.set("state", state);
    formData.set("postalCode", postalCode);
    formData.set("email", email);
    formData.set("phone", phone);
    formData.set("linkedIn", linkedIn);
    formData.set("positionApplied", positionApplied);
    formData.set("heardAbout", heardAbout);
    formData.set("availableStartDate", availableStartDate);
    formData.set("companyWebsite", companyWebsite);
    formData.set("resume", resume);

    setSubmitting(true);
    try {
      await publicApiFetch("/sites/IN/careers/applications", {
        method: "POST",
        body: formData,
      });
      showSuccess("Application received. We will review your résumé.");
      resetForm();
    } catch (error) {
      showError(toApiError(error).message || "Application could not be submitted");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-[#e6e8eb] bg-white p-6 shadow-[0_8px_30px_rgba(20,30,40,0.06)] sm:p-8"
    >
      <h2 className="text-2xl font-semibold tracking-tight text-[#17283d]">Job Application</h2>
      <p className="mt-2 text-sm text-[#657487]">
        Please complete the form below to apply for a position with us.
      </p>

      <div className="mt-8 space-y-7">
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-[#17283d]">Full Name</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Input id="career-first-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} required autoComplete="given-name" />
              <Hint>First Name</Hint>
            </div>
            <div>
              <Input id="career-middle-name" value={middleName} onChange={(event) => setMiddleName(event.target.value)} autoComplete="additional-name" />
              <Hint>Middle Name</Hint>
            </div>
            <div>
              <Input id="career-last-name" value={lastName} onChange={(event) => setLastName(event.target.value)} required autoComplete="family-name" />
              <Hint>Last Name</Hint>
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-[#17283d]">Birth Date</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Select value={birthMonth} onValueChange={setBirthMonth}>
                <SelectTrigger id="career-birth-month" className="w-full">
                  <SelectValue placeholder="Please select a month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month, index) => (
                    <SelectItem key={month} value={String(index + 1)}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Hint>Month</Hint>
            </div>
            <div>
              <Select value={birthDay} onValueChange={setBirthDay}>
                <SelectTrigger id="career-birth-day" className="w-full">
                  <SelectValue placeholder="Please select a day" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Hint>Day</Hint>
            </div>
            <div>
              <Select value={birthYear} onValueChange={setBirthYear}>
                <SelectTrigger id="career-birth-year" className="w-full">
                  <SelectValue placeholder="Please select a year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Hint>Year</Hint>
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-[#17283d]">Current Address</legend>
          <div>
            <Input id="career-street" value={streetAddress} onChange={(event) => setStreetAddress(event.target.value)} required autoComplete="address-line1" />
            <Hint>Street Address</Hint>
          </div>
          <div>
            <Input id="career-street-2" value={streetAddressLine2} onChange={(event) => setStreetAddressLine2(event.target.value)} autoComplete="address-line2" />
            <Hint>Street Address Line 2</Hint>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Input id="career-city" value={city} onChange={(event) => setCity(event.target.value)} required autoComplete="address-level2" />
              <Hint>City</Hint>
            </div>
            <div>
              <Input id="career-state" value={state} onChange={(event) => setState(event.target.value)} required autoComplete="address-level1" />
              <Hint>State / Province</Hint>
            </div>
          </div>
          <div>
            <Input id="career-postal" value={postalCode} onChange={(event) => setPostalCode(event.target.value)} required autoComplete="postal-code" />
            <Hint>Postal / Zip Code</Hint>
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="career-email">Email Address</FieldLabel>
            <Input id="career-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="ex: myname@example.com" autoComplete="email" />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="career-phone">Phone Number</FieldLabel>
            <Input id="career-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} required placeholder="98765 43210" autoComplete="tel" />
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="career-linkedin">LinkedIn</FieldLabel>
          <Input id="career-linkedin" type="url" value={linkedIn} onChange={(event) => setLinkedIn(event.target.value)} placeholder="https://www.linkedin.com/in/your-name" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel>Position Applied</FieldLabel>
            <Select value={positionApplied} onValueChange={setPositionApplied}>
              <SelectTrigger id="career-position" className="w-full">
                <SelectValue placeholder="Please Select" />
              </SelectTrigger>
              <SelectContent>
                {careerPositions.map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <FieldLabel>How did you hear about us</FieldLabel>
            <Select value={heardAbout} onValueChange={setHeardAbout}>
              <SelectTrigger id="career-heard-about" className="w-full">
                <SelectValue placeholder="Please Select" />
              </SelectTrigger>
              <SelectContent>
                {careerHeardAbout.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="career-start-date">Available Start Date</FieldLabel>
          <Input
            id="career-start-date"
            type="date"
            value={availableStartDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(event) => setAvailableStartDate(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="career-resume">Upload Your Resume</FieldLabel>
          <label
            htmlFor="career-resume"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              chooseResume(event.dataTransfer.files?.[0] ?? null);
            }}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#cfd6de] bg-[#f7f8fa] px-4 py-8 text-center"
          >
            <Upload className="size-6 text-[#657487]" aria-hidden />
            <span className="mt-3 text-sm font-semibold text-primary">
              {resume ? resume.name : "Browse Files"}
            </span>
            <span className="mt-1 text-xs text-[#7b8794]">
              Drag and drop a PDF, DOC, or DOCX up to 5 MB
            </span>
          </label>
          <input
            id="career-resume"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="sr-only"
            onChange={(event) => chooseResume(event.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      <input
        type="text"
        name="companyWebsite"
        value={companyWebsite}
        onChange={(event) => setCompanyWebsite(event.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />

      <div className="mt-8 flex justify-center">
        <Button
          type="submit"
          disabled={submitting}
          className="h-11 rounded-md bg-[#17191c] px-10 text-white hover:bg-[#17191c]/90"
        >
          {submitting ? "Submitting..." : "Apply"}
        </Button>
      </div>
    </form>
  );
}
