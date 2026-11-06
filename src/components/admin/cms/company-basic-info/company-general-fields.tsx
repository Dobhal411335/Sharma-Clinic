import { Building2 } from "lucide-react";

import { CompanyListFields } from "@/components/admin/cms/company-basic-info/company-list-fields";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CompanyBasicInfoFormErrors } from "@/schemas/company-basic-info-schema";
import type { CompanyBasicInfoFormValues } from "@/types/admin/company-basic-info";

interface CompanyGeneralFieldsProps {
  values: CompanyBasicInfoFormValues;
  errors: CompanyBasicInfoFormErrors;
  onScalarChange: (name: keyof CompanyBasicInfoFormValues, value: string) => void;
  onListChange: (field: "contactNumbers", index: number, value: string) => void;
  onListAdd: (field: "contactNumbers") => void;
  onListRemove: (field: "contactNumbers", index: number) => void;
}

export function CompanyGeneralFields({
  values,
  errors,
  onScalarChange,
  onListChange,
  onListAdd,
  onListRemove,
}: CompanyGeneralFieldsProps) {
  return (
    <Card>
      <CardHeader className="border-b border-border/70">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">General Information</CardTitle>
        </div>
        <CardDescription>Core business identity for this website.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="companyName">
              Company Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="companyName"
              value={values.companyName}
              onChange={(event) => onScalarChange("companyName", event.target.value)}
              placeholder="e.g. Example Clinic"
              aria-invalid={Boolean(errors.companyName)}
            />
            {errors.companyName ? (
              <p className="text-sm text-destructive">{errors.companyName}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyDomainName">
              Domain Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="companyDomainName"
              value={values.companyDomainName}
              onChange={(event) => onScalarChange("companyDomainName", event.target.value)}
              placeholder="example.com"
              aria-invalid={Boolean(errors.companyDomainName)}
            />
            {errors.companyDomainName ? (
              <p className="text-sm text-destructive">{errors.companyDomainName}</p>
            ) : null}
          </div>
        </div>

        <CompanyListFields
          field="contactNumbers"
          label="Contact Numbers"
          values={values.contactNumbers}
          placeholder="9876543210"
          type="tel"
          prefix="+91"
          error={errors.contactNumbers}
          onChange={(index, value) =>
            onListChange("contactNumbers", index, value.replace(/\D/g, "").slice(0, 10))
          }
          onAdd={() => onListAdd("contactNumbers")}
          onRemove={(index) => onListRemove("contactNumbers", index)}
        />

        <div className="space-y-2">
          <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
          <div className="flex items-center gap-3">
            <div className="flex h-12 min-w-14 shrink-0 items-center justify-center rounded-[10px] border border-input bg-muted px-3 text-sm text-muted-foreground">
              +91
            </div>
            <Input
              id="whatsappNumber"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={values.whatsappNumber}
              onChange={(event) =>
                onScalarChange(
                  "whatsappNumber",
                  event.target.value.replace(/\D/g, "").slice(0, 10),
                )
              }
              placeholder="9876543210"
              aria-invalid={Boolean(errors.whatsappNumber)}
            />
          </div>
          {errors.whatsappNumber ? (
            <p className="text-sm text-destructive">{errors.whatsappNumber}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
