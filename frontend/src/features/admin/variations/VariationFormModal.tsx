import { useEffect } from 'react';
import { Controller, useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Field, Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { useToast } from '@/components/ui/Toast';
import { useCreateVariation, useUpdateVariation } from '@/hooks/useAdminVariations';
import { AppApiError } from '@/api/client';
import type { UUID, VariationAdminDto } from '@/types/api';
import { cn } from '@/utils/cn';

const hexPattern = /^#[0-9A-Fa-f]{6}$/;

const schema = z.object({
  colorName:       z.string().min(1, 'Color name is required').max(80),
  colorHex:        z.string().regex(hexPattern, 'Use #RRGGBB (e.g. #8B6F47)'),
  variationSku:    z.string().max(64).optional().nullable(),
  stockStatusText: z.string().max(80).optional().nullable(),
  sortOrder:       z.number().int().min(0).max(10000),
  isDefault:       z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  productId: UUID;
  /** When provided, the modal edits this variation instead of creating. */
  existing?: VariationAdminDto | null;
}

export function VariationFormModal({ open, onClose, productId, existing }: Props) {
  const toast = useToast();
  const isEdit = Boolean(existing);

  const createMutation = useCreateVariation(productId);
  const updateMutation = useUpdateVariation(productId, existing?.id as UUID);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues(),
  });

  useEffect(() => {
    if (!open) return;
    form.reset(existing ? toFormValues(existing) : emptyValues());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, existing?.id]);

  const submitting = form.formState.isSubmitting || createMutation.isPending || updateMutation.isPending;

  const onSubmit = form.handleSubmit(async (values) => {
    const body = toRequest(values);
    try {
      if (isEdit) {
        const updated = await updateMutation.mutateAsync(body);
        toast.success(`"${updated.colorName}" saved`);
      } else {
        const created = await createMutation.mutateAsync(body);
        toast.success(`"${created.colorName}" added`);
      }
      onClose();
    } catch (err) {
      applyBackendErrors(err, form);
      toast.error(err instanceof AppApiError ? err.message : 'Could not save');
    }
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit variation' : 'New variation'}
      description="A variation represents one color option. Images live in its own gallery."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} loading={submitting}>
            {isEdit ? 'Save changes' : 'Create variation'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
          <Field label="Color name" required error={form.formState.errors.colorName?.message}>
            <Input
              placeholder="Natural Oak"
              invalid={Boolean(form.formState.errors.colorName)}
              {...form.register('colorName')}
            />
          </Field>
          <ColorHexField form={form} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Variation SKU"
            hint="Optional override when the color affects pricing or stock."
            error={form.formState.errors.variationSku?.message}
          >
            <Input {...form.register('variationSku')} />
          </Field>
          <Field
            label="Stock label"
            hint="Shown below the color swatch. Defaults to “In stock”."
            error={form.formState.errors.stockStatusText?.message}
          >
            <Input placeholder="In stock" {...form.register('stockStatusText')} />
          </Field>
        </div>

        <Field
          label="Sort order"
          hint="Lower appears first in the color picker."
          error={form.formState.errors.sortOrder?.message}
        >
          <Input
            type="number"
            min={0}
            className="max-w-[8rem]"
            {...form.register('sortOrder', { valueAsNumber: true })}
          />
        </Field>

        <Controller
          control={form.control}
          name="isDefault"
          render={({ field }) => (
            <Switch
              checked={field.value}
              onChange={field.onChange}
              label="Set as default variation"
              description="The default is pre-selected on the product page. Only one variation per product is default; turning this on will unset the others."
            />
          )}
        />

        {form.formState.errors.root?.message && (
          <p className="rounded-md bg-danger/5 px-3 py-2 text-sm text-danger">
            {form.formState.errors.root.message}
          </p>
        )}
      </form>
    </Modal>
  );
}

/* ------------------------- colour hex field ------------------------- */

function ColorHexField({ form }: { form: UseFormReturn<FormValues> }) {
  const value = form.watch('colorHex');
  const valid = hexPattern.test(value ?? '');

  return (
    <Field label="Color hex" required error={form.formState.errors.colorHex?.message}>
      <div className="flex items-center gap-2">
        {/* Native picker — keeps state in sync via RHF */}
        <Controller
          control={form.control}
          name="colorHex"
          render={({ field }) => (
            <input
              type="color"
              aria-label="Pick color"
              value={valid ? field.value : '#000000'}
              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
              className={cn(
                'h-10 w-10 cursor-pointer rounded-md border border-border bg-surface p-1 focus-ring',
              )}
            />
          )}
        />
        <Input
          placeholder="#8B6F47"
          spellCheck={false}
          invalid={Boolean(form.formState.errors.colorHex)}
          {...form.register('colorHex', {
            setValueAs: (v: unknown) =>
              typeof v === 'string' && v ? (v.startsWith('#') ? v : `#${v}`).toUpperCase() : v,
          })}
        />
      </div>
    </Field>
  );
}

/* ----------------------------- helpers ----------------------------- */

function emptyValues(): FormValues {
  return {
    colorName: '',
    colorHex: '#000000',
    variationSku: '',
    stockStatusText: 'In stock',
    sortOrder: 0,
    isDefault: false,
  };
}

function toFormValues(v: VariationAdminDto): FormValues {
  return {
    colorName: v.colorName,
    colorHex: v.colorHex,
    variationSku: v.variationSku ?? '',
    stockStatusText: v.stockStatusText ?? 'In stock',
    sortOrder: v.sortOrder,
    isDefault: v.isDefault,
  };
}

function toRequest(v: FormValues) {
  const sku = v.variationSku?.trim() || null;
  const stock = v.stockStatusText?.trim() || null;
  return {
    colorName: v.colorName.trim(),
    colorHex: v.colorHex.toUpperCase(),
    variationSku: sku,
    stockStatusText: stock,
    sortOrder: v.sortOrder,
    isDefault: v.isDefault,
  };
}

function applyBackendErrors(err: unknown, form: UseFormReturn<FormValues>) {
  if (!(err instanceof AppApiError)) {
    form.setError('root', { message: 'Something went wrong. Please try again.' });
    return;
  }
  if (err.fieldErrors?.length) {
    let mapped = false;
    for (const fe of err.fieldErrors) {
      const key = (
        {
          colorName: 'colorName',
          colorHex: 'colorHex',
          variationSku: 'variationSku',
          stockStatusText: 'stockStatusText',
          sortOrder: 'sortOrder',
          isDefault: 'isDefault',
        } as Record<string, keyof FormValues>
      )[fe.field];
      if (key) {
        form.setError(key, { message: fe.message });
        mapped = true;
      }
    }
    if (!mapped) form.setError('root', { message: err.message });
    return;
  }
  form.setError('root', { message: err.message });
}
