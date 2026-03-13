'use client';

import { type ReactNode } from 'react';
import {
  useForm,
  FormProvider,
  type UseFormReturn,
  type FieldValues,
  type DefaultValues,
  type SubmitHandler,
} from 'react-hook-form';
import { type ZodSchema } from 'zod';

// zod v4 form resolver
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function zodFormResolver(schema: ZodSchema): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (values: any) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors: Record<string, any> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.');
      if (path && !errors[path]) {
        errors[path] = { type: 'validation', message: issue.message };
      }
    }
    return { values: {}, errors };
  };
}

interface FormProps<T extends FieldValues> {
  schema: ZodSchema;
  defaultValues?: DefaultValues<T>;
  onSubmit: SubmitHandler<T>;
  children: (methods: UseFormReturn<T>) => ReactNode;
  className?: string;
}

export function Form<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
}: FormProps<T>) {
  const methods = useForm<T>({
    resolver: zodFormResolver(schema),
    defaultValues,
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={className} noValidate>
        {children(methods)}
      </form>
    </FormProvider>
  );
}
