import { useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import {
  useCreateHomeSection,
  useUpdateHomeSection,
} from '@/hooks/useAdminCms';
import { AppApiError } from '@/api/client';
import type {
  ContentStatus,
  HomeSectionAdminDto,
  HomeSectionType,
} from '@/types/api';

const SECTION_TYPES: Array<{ value: HomeSectionType; label: string }> = [
  { value: 'FEATURED_CATEGORIES', label: 'Featured categories' },
  { value: 'FEATURED_PRODUCTS',   label: 'Featured products' },
  { value: 'PROMO_BANNER',        label: 'Promo banner' },
  { value: 'TEXT_BLOCK',          label: 'Text block' },
  { value: 'CTA_STRIP',           label: 'CTA strip' },
  { value: 'IMAGE_GRID',          label: 'Image grid' },
  { value: 'HERO_BANNER',         label: 'Hero banner' },
];

const STATUSES: ContentStatus[] = ['PUBLISHED', 'DRAFT', 'ARCHIVED'];

const schema = z.object({
  sectionType: z.enum([
    'FEATURED_CATEGORIES',
    'FEATURED_PRODUCTS',
    'PROMO_BANNER',
    'TEXT_BLOCK',
    'CTA_STRIP',
    'IMAGE_GRID',
    'HERO_BANNER',
  ]),
  title:     z.string().max(200).optional().nullable(),
  subtitle:  z.string().max(400).optional().nullable(),
  body:      z.string().optional().nullable(),
  imageKey:  z.string().optional().nullable(),
  sortOrder: z.number().int().min(0).max(10000),
  status:    z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  configJson: z.string().refine(isValidJson, 'Must be valid JSON'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  existing?: HomeSectionAdminDto | null;
}

export function HomeSectionFormModal({ open, onClose, existing }: Props) {
  const isEdit = Boolean(existing);
  const toast = useToast();

  const createMutation = useCreateHomeSection();
  const updateMutation = useUpdateHomeSection(existing?.id as string);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues(),
  });

  useEffect(() => {
    if (!open) return;
    form.reset(existing ? toFormValues(existing) : emptyValues());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, existing?.id]);

  const submitting =
    form.formState.isSubmitting || createMutation.isPending || updateMutation.isPending;

  const onSubmit = form.handleSubmit(async (values) => {
    const body = toRequestBody(values);
    try {
      if (isEdit) {
        const updated = await updateMutation.mutateAsync(body);
        toast.success(`Section "${updated.title ?? updated.sectionType}" saved`);
      } else {
        const created = await createMutation.mutateAsync(body);
        toast.success(`Section "${created.title ?? created.sectionType}" created`);
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
      size="lg"
      title={isEdit ? 'Edit section' : 'New section'}
      description="Sections render on the public homepage in sort order."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button onClick={onSubmit} loading={submitting}>
            {isEdit ? 'Save changes' : 'Create section'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Section type" required>
          <select
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg focus-ring"
            {...form.register('sectionType')}
          >
            {SECTION_TYPES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Title" error={form.formState.errors.title?.message}>
          <Input {...form.register('title')} />
        </Field>
        <Field label="Subtitle" error={form.formState.errors.subtitle?.message}>
          <Input {...form.register('subtitle')} />
        </Field>
        <Field
          label="Body"
          hint="Used by TEXT_BLOCK and PROMO_BANNER."
          error={form.formState.errors.body?.message}
        >
          <Textarea rows={4} {...form.register('body')} />
        </Field>

        <Field
          label="Image key"
          hint="Storage key of an uploaded asset. Leave blank for sections that don't use an image."
        >
          <Input
            placeholder="site-assets/banner.jpg"
            {...form.register('imageKey')}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Status">
            <select
              className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg focus-ring"
              {...form.register('status')}
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Sort order" error={form.formState.errors.sortOrder?.message}>
            <Input
              type="number"
              min={0}
              {...form.register('sortOrder', { valueAsNumber: true })}
            />
          </Field>
          <div />
        </div>

        <Field
          label="Config (JSON)"
          hint='Type-specific options. Examples: {"productIds":["…"],"limit":8}'
          error={form.formState.errors.configJson?.message}
        >
          <Textarea
            rows={6}
            spellCheck={false}
            className="font-mono text-xs"
            {...form.register('configJson')}
          />
        </Field>

        {form.formState.errors.root?.message && (
          <p className="rounded-md bg-danger/5 px-3 py-2 text-sm text-danger">
            {form.formState.errors.root.message}
          </p>
        )}
      </form>
    </Modal>
  );
}

/* ----------------------------- helpers ----------------------------- */

function emptyValues(): FormValues {
  return {
    sectionType: 'FEATURED_CATEGORIES',
    title: '',
    subtitle: '',
    body: '',
    imageKey: '',
    sortOrder: 0,
    status: 'PUBLISHED',
    configJson: '{}',
  };
}

function toFormValues(s: HomeSectionAdminDto): FormValues {
  return {
    sectionType: s.sectionType,
    title: s.title ?? '',
    subtitle: s.subtitle ?? '',
    body: s.body ?? '',
    imageKey: s.imageKey ?? '',
    sortOrder: s.sortOrder,
    status: s.status,
    configJson: s.config ? JSON.stringify(s.config, null, 2) : '{}',
  };
}

function toRequestBody(v: FormValues) {
  const config = safeParseJson(v.configJson);
  return {
    sectionType: v.sectionType,
    title: blankToNull(v.title),
    subtitle: blankToNull(v.subtitle),
    body: blankToNull(v.body),
    imageKey: blankToNull(v.imageKey),
    config: config ?? {},
    sortOrder: v.sortOrder,
    status: v.status,
  };
}

function blankToNull(v: string | null | undefined): string | null {
  if (v === null || v === undefined) return null;
  const s = v.trim();
  return s.length === 0 ? null : s;
}

function isValidJson(s: string): boolean {
  if (!s || !s.trim()) return true; // empty allowed → treated as {}
  try {
    JSON.parse(s);
    return true;
  } catch {
    return false;
  }
}

function safeParseJson(s: string): Record<string, unknown> | null {
  if (!s || !s.trim()) return {};
  try {
    const v = JSON.parse(s);
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
  } catch {
    return null;
  }
}

function applyBackendErrors(err: unknown, form: UseFormReturn<FormValues>) {
  if (!(err instanceof AppApiError)) {
    form.setError('root', { message: 'Something went wrong. Please try again.' });
    return;
  }
  if (err.fieldErrors?.length) {
    let mapped = false;
    for (const fe of err.fieldErrors) {
      const k = (
        {
          sectionType: 'sectionType',
          title: 'title',
          subtitle: 'subtitle',
          body: 'body',
          imageKey: 'imageKey',
          sortOrder: 'sortOrder',
          status: 'status',
          config: 'configJson',
        } as Record<string, keyof FormValues>
      )[fe.field];
      if (k) {
        form.setError(k, { message: fe.message });
        mapped = true;
      }
    }
    if (!mapped) form.setError('root', { message: err.message });
    return;
  }
  form.setError('root', { message: err.message });
}
