import { CompanyGeneralFields } from "@/components/admin/cms/company-basic-info/company-general-fields";
import { CompanyListFields } from "@/components/admin/cms/company-basic-info/company-list-fields";
import { CompanyLocationFields } from "@/components/admin/cms/company-basic-info/company-location-fields";
import { CompanyLogoUploader } from "@/components/admin/cms/company-basic-info/company-logo-uploader";
import { CompanySeoFields } from "@/components/admin/cms/company-basic-info/company-seo-fields";
import { CompanySocialFields } from "@/components/admin/cms/company-basic-info/company-social-fields";
import type { CompanyBasicInfoFormErrors } from "@/schemas/company-basic-info-schema";
import type {
  CompanyBasicInfoFormValues,
  CompanyImageRef,
} from "@/types/admin/company-basic-info";

type ListField = "contactNumbers" | "emails" | "officeAddresses" | "keywords";

interface CompanyBasicInfoFormProps {
  recordId: string | null;
  values: CompanyBasicInfoFormValues;
  errors: CompanyBasicInfoFormErrors;
  onChange: (next: CompanyBasicInfoFormValues) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  formId?: string;
}

export function CompanyBasicInfoForm({
  recordId,
  values,
  errors,
  onChange,
  onSubmit,
  formId = "company-basic-info-form",
}: CompanyBasicInfoFormProps) {
  const setScalar = (name: keyof CompanyBasicInfoFormValues, value: string) => {
    onChange({ ...values, [name]: value });
  };

  const setImage = (name: keyof CompanyBasicInfoFormValues, value: CompanyImageRef) => {
    onChange({ ...values, [name]: value });
  };

  const setListItem = (field: ListField, index: number, value: string) => {
    const next = [...values[field]];
    next[index] = value;
    onChange({ ...values, [field]: next });
  };

  const addListItem = (field: ListField) => {
    onChange({ ...values, [field]: [...values[field], ""] });
  };

  const removeListItem = (field: ListField, index: number) => {
    const next = values[field].filter((_, itemIndex) => itemIndex !== index);
    onChange({ ...values, [field]: next.length > 0 ? next : [""] });
  };

  return (
    <form id={formId} onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <CompanyGeneralFields
            values={values}
            errors={errors}
            onScalarChange={setScalar}
            onListChange={(field, index, value) => setListItem(field, index, value)}
            onListAdd={(field) => addListItem(field)}
            onListRemove={(field, index) => removeListItem(field, index)}
          />

          <CompanyListFields
            field="emails"
            label="Email Addresses"
            values={values.emails}
            placeholder="contact@example.com"
            type="email"
            error={errors.emails}
            onChange={(index, value) => setListItem("emails", index, value)}
            onAdd={() => addListItem("emails")}
            onRemove={(index) => removeListItem("emails", index)}
          />

          <CompanyListFields
            field="officeAddresses"
            label="Office Addresses"
            values={values.officeAddresses}
            placeholder="123 Business St, Suite 100..."
            isTextarea
            error={errors.officeAddresses}
            onChange={(index, value) => setListItem("officeAddresses", index, value)}
            onAdd={() => addListItem("officeAddresses")}
            onRemove={(index) => removeListItem("officeAddresses", index)}
          />

          <CompanyLocationFields
            values={values}
            errors={errors}
            onScalarChange={setScalar}
          />
        </div>

        <div className="space-y-6">
          <CompanyLogoUploader
            values={values}
            recordId={recordId}
            onChange={setImage}
          />
          <CompanySocialFields
            values={values}
            errors={errors}
            onScalarChange={setScalar}
          />
        </div>

        <div className="lg:col-span-3">
          <CompanySeoFields
            values={values}
            errors={errors}
            onScalarChange={setScalar}
            onListChange={(field, index, value) => setListItem(field, index, value)}
            onListAdd={(field) => addListItem(field)}
            onListRemove={(field, index) => removeListItem(field, index)}
          />
        </div>
      </div>
    </form>
  );
}
