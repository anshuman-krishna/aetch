'use client';

import { useFormContext, type FieldPath, type FieldValues } from 'react-hook-form';
import { GlassInput } from '@/components/ui/glass-input';
import { GlassTextarea } from '@/components/ui/glass-textarea';
import { GlassSelect } from '@/components/ui/glass-select';

interface FormFieldBaseProps<T extends FieldValues> {
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

interface InputFieldProps<T extends FieldValues> extends FormFieldBaseProps<T> {
  type: 'text' | 'email' | 'password' | 'url' | 'number';
}

interface TextareaFieldProps<T extends FieldValues> extends FormFieldBaseProps<T> {
  type: 'textarea';
  rows?: number;
}

interface SelectFieldProps<T extends FieldValues> extends FormFieldBaseProps<T> {
  type: 'select';
  options: { value: string; label: string }[];
}

type FormFieldProps<T extends FieldValues> =
  | InputFieldProps<T>
  | TextareaFieldProps<T>
  | SelectFieldProps<T>;

export function FormField<T extends FieldValues>(props: FormFieldProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[props.name]?.message as string | undefined;
  const registration = register(props.name, {
    valueAsNumber: props.type === 'number',
  });

  if (props.type === 'textarea') {
    return (
      <GlassTextarea
        {...registration}
        label={props.label}
        placeholder={props.placeholder}
        error={error}
        disabled={props.disabled}
        rows={props.rows}
      />
    );
  }

  if (props.type === 'select') {
    return (
      <GlassSelect
        {...registration}
        label={props.label}
        error={error}
        disabled={props.disabled}
        options={props.options}
        placeholder={props.placeholder}
      />
    );
  }

  return (
    <GlassInput
      {...registration}
      type={props.type}
      label={props.label}
      placeholder={props.placeholder}
      error={error}
      disabled={props.disabled}
    />
  );
}
