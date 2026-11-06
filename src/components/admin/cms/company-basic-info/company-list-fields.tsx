import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ListField = "emails" | "officeAddresses" | "keywords" | "contactNumbers";

interface CompanyListFieldsProps {
  field: ListField;
  label: string;
  values: string[];
  placeholder?: string;
  type?: "text" | "email" | "tel";
  isTextarea?: boolean;
  prefix?: string;
  error?: string;
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export function CompanyListFields({
  field,
  label,
  values,
  placeholder,
  type = "text",
  isTextarea = false,
  prefix,
  error,
  onChange,
  onAdd,
  onRemove,
}: CompanyListFieldsProps) {
  return (
    <div className="space-y-4 rounded-[14px] border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-3">
        <Label className="text-base font-semibold text-foreground">{label}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-2"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
      <div className="space-y-3">
        {values.map((value, index) => (
          <div key={`${field}-${index}`} className="flex items-start gap-3">
            {prefix ? (
              <div className="flex h-12 min-w-14 shrink-0 items-center justify-center rounded-[10px] border border-input bg-muted px-3 text-sm text-muted-foreground">
                {prefix}
              </div>
            ) : null}
            {isTextarea ? (
              <Textarea
                value={value}
                onChange={(event) => onChange(index, event.target.value)}
                placeholder={placeholder}
                rows={3}
                aria-invalid={Boolean(error)}
              />
            ) : (
              <Input
                type={type}
                value={value}
                onChange={(event) => onChange(index, event.target.value)}
                placeholder={placeholder}
                maxLength={field === "contactNumbers" ? 10 : undefined}
                inputMode={field === "contactNumbers" ? "numeric" : undefined}
                aria-invalid={Boolean(error)}
              />
            )}
            {values.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-12 w-12 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onRemove(index)}
                aria-label={`Remove ${label} item ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        ))}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
