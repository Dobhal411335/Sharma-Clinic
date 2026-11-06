import { Share2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CompanyBasicInfoFormErrors } from "@/schemas/company-basic-info-schema";
import type { CompanyBasicInfoFormValues } from "@/types/admin/company-basic-info";

const socialFields: Array<{
  name: keyof CompanyBasicInfoFormValues;
  label: string;
  placeholder: string;
}> = [
  {
    name: "googleUrl",
    label: "Google Review Widget URL",
    placeholder: "https://widget.example.com/...",
  },
  { name: "googleLink", label: "Google", placeholder: "https://google.com/..." },
  { name: "facebookLink", label: "Facebook", placeholder: "https://facebook.com/..." },
  { name: "instagramLink", label: "Instagram", placeholder: "https://instagram.com/..." },
  { name: "youtubeLink", label: "YouTube", placeholder: "https://youtube.com/..." },
];

interface CompanySocialFieldsProps {
  values: CompanyBasicInfoFormValues;
  errors: CompanyBasicInfoFormErrors;
  onScalarChange: (name: keyof CompanyBasicInfoFormValues, value: string) => void;
}

export function CompanySocialFields({
  values,
  errors,
  onScalarChange,
}: CompanySocialFieldsProps) {
  return (
    <Card>
      <CardHeader className="border-b border-border/70">
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Social Links</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        {socialFields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              type="url"
              value={String(values[field.name] ?? "")}
              onChange={(event) => onScalarChange(field.name, event.target.value)}
              placeholder={field.placeholder}
              aria-invalid={Boolean(errors[field.name])}
            />
            {errors[field.name] ? (
              <p className="text-sm text-destructive">{errors[field.name]}</p>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
