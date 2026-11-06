import { Globe } from "lucide-react";

import { CompanyListFields } from "@/components/admin/cms/company-basic-info/company-list-fields";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CompanyBasicInfoFormErrors } from "@/schemas/company-basic-info-schema";
import type { CompanyBasicInfoFormValues } from "@/types/admin/company-basic-info";

interface CompanySeoFieldsProps {
  values: CompanyBasicInfoFormValues;
  errors: CompanyBasicInfoFormErrors;
  onScalarChange: (name: keyof CompanyBasicInfoFormValues, value: string) => void;
  onListChange: (field: "keywords", index: number, value: string) => void;
  onListAdd: (field: "keywords") => void;
  onListRemove: (field: "keywords", index: number) => void;
}

export function CompanySeoFields({
  values,
  errors,
  onScalarChange,
  onListChange,
  onListAdd,
  onListRemove,
}: CompanySeoFieldsProps) {
  return (
    <Card>
      <CardHeader className="border-b border-border/70">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">SEO & Tracking</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <Label htmlFor="titleTagForMainLandingPage">Title Tag For Main Landing Page</Label>
          <Input
            id="titleTagForMainLandingPage"
            value={values.titleTagForMainLandingPage}
            onChange={(event) =>
              onScalarChange("titleTagForMainLandingPage", event.target.value)
            }
            placeholder="e.g. Clinical care | Example Clinic"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="googleTrackingTag">Google Tracking Tag</Label>
          <Textarea
            id="googleTrackingTag"
            value={values.googleTrackingTag}
            onChange={(event) => onScalarChange("googleTrackingTag", event.target.value)}
            placeholder="Paste tracking snippet text here..."
            className="min-h-[150px] font-mono text-xs"
            rows={6}
          />
        </div>

        <CompanyListFields
          field="keywords"
          label="SEO Keywords"
          values={values.keywords}
          placeholder="e.g. skincare, dermatology"
          error={errors.keywords}
          onChange={(index, value) => onListChange("keywords", index, value)}
          onAdd={() => onListAdd("keywords")}
          onRemove={(index) => onListRemove("keywords", index)}
        />
      </CardContent>
    </Card>
  );
}
