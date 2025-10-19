import type { ReactNode } from "react";

import { Switch } from "@medusajs/ui";

import type { ControllerProps, FieldPath, FieldValues } from "react-hook-form";

import { Form } from "@/components/common/form";

type HeadlessControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ControllerProps<TFieldValues, TName>, "render">;

interface SwitchBoxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends HeadlessControllerProps<TFieldValues, TName> {
  label: string;
  description: string;
  optional?: boolean;
  tooltip?: ReactNode;
  /**
   * Callback for performing additional actions when the checked state changes.
   * This does not intercept the form control, it is only used for injecting side-effects.
   */
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * Wrapper for the Switch component to be used with `react-hook-form`.
 *
 * Use this component whenever a design calls for wrapping the Switch component
 * in a container with a label and description.
 */
export const SwitchBox = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  label,
  description,
  optional = false,
  tooltip,
  onCheckedChange,
  ...props
}: SwitchBoxProps<TFieldValues, TName>) => (
  <Form.Field
    {...props}
    render={({ field: { value, onChange, ...field } }) => (
      <Form.Item>
        <div className="flex items-start gap-x-3 rounded-lg bg-ui-bg-component p-3 shadow-elevation-card-rest">
          <Form.Control>
            <Switch
              className="rtl:rotate-180"
              dir="ltr"
              {...field}
              checked={value}
              onCheckedChange={(e) => {
                onCheckedChange?.(e);
                onChange(e);
              }}
            />
          </Form.Control>
          <div>
            <Form.Label optional={optional} tooltip={tooltip}>
              {label}
            </Form.Label>
            <Form.Hint>{description}</Form.Hint>
          </div>
        </div>
        <Form.ErrorMessage />
      </Form.Item>
    )}
  />
);
