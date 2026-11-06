import { MapPin } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CompanyBasicInfoFormErrors } from "@/schemas/company-basic-info-schema";
import type { CompanyBasicInfoFormValues } from "@/types/admin/company-basic-info";

interface CompanyLocationFieldsProps {
  values: CompanyBasicInfoFormValues;
  errors: CompanyBasicInfoFormErrors;
  onScalarChange: (name: keyof CompanyBasicInfoFormValues, value: string) => void;
}

export function CompanyLocationFields({
  values,
  errors,
  onScalarChange,
}: CompanyLocationFieldsProps) {
  return (
    <Card>
      <CardHeader className="border-b border-border/70">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Location & Maps</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        <div className="space-y-2">
          <Label htmlFor="googleAddress">Google Address Map Code</Label>
          <Textarea
            id="googleAddress"
            value={values.googleAddress}
            onChange={(event) => onScalarChange("googleAddress", event.target.value)}
            placeholder="Paste iframe or map snippet here..."
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="googleMapLink">Google Maps URL</Label>
          <Input
            id="googleMapLink"
            type="url"
            value={values.googleMapLink}
            onChange={(event) => onScalarChange("googleMapLink", event.target.value)}
            placeholder="https://maps.google.com/..."
            aria-invalid={Boolean(errors.googleMapLink)}
          />
          {errors.googleMapLink ? (
            <p className="text-sm text-destructive">{errors.googleMapLink}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
