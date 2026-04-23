import { useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Input';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { useToast } from '@/components/ui/Toast';
import {
  useCreateHeroSlide,
  useUpdateHeroSlide,
  useUploadHeroSlideImage,
} from '@/hooks/useAdminCms';
import { AppApiError } from '@/api/client';
import type {
  ContentStatus,
  HeroSlideAdminDto,
} from '@/types/api';

const STATUSES: ContentStatus[] = ['PUBLISHED', 'DRAFT', 'ARCHIVED'];

const schema = z.object({
  title:      z.string().min(1, 'Title is required').max(200),
  subtitle:   z.string().max(400).optional().nullable(),
  ctaText:    z.string().max(80).optional().nullable(),
  ctaUrl:     z.string().max(500).optional().nullable(),
  sortOrder:  z.number().int().min(0).max(10000),
  status:     z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  startsAt:   z.string().optional().nullable(),
  endsAt:     z.string().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  existing?: HeroSlideAdminDto | null;
}

export function HeroSlideFormModal({ open, onClose, existing }: Props) {
  const isEdit = Boolean(existing);
  const toast = useToast();

  const createMutation = useCreateHeroSlide();
  const updateMutation = useUpdateHeroSlide(existing?.id as string);
  const uploadMutation = useUploadHeroSlideImage();

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
    form.formState.isSubmitting ||
    createMutation.isPending ||
    updateMutation.isPending;

  const onSubmit = form.handleSubmit(async (values) => {
    const body = toRequestBody(values);
    try {
      if (isEdit) {
        const updated = await updateMutation.mutateAsync(body);
        toast.success(`"${updated.title}" saved`);
      } else {
        const created = await createMutation.mutateAsync(body);
        toast.success(`"${created.title}" created — now add an image`);
      }
      onClose();
    } catch (err) {
      applyBackendErrors(err, form);
      toast.error(err instanceof AppApiError ? err.message : 'Could not save');
    }
  });

  const handleImageFiles = async (files: File[]) => {
    if (!existing) return; // image upload needs a persisted slide id
    const [file] = files;
    if (!file) return;
    try {
      await uploadMutation.mutateAsync({ id: existing.id, file });
      toast.success('Image updated');
    } catch (err) {
      toast.error(err instanceof AppApiError ? err.message : 'Upload failed');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit hero slide' : 'New hero slide'}
      description="Slides appear on the homepage hero in the order you set."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} loading={submitting}>
            {isEdit ? 'Save changes' : 'Create slide'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Title" required error={form.formState.errors.title?.message}>
          <Input
            placeholder="Sleep better. Live better."
            invalid={Boolean(form.formState.errors.title)}
            {...form.register('title')}
          />
        </Field>
        <Field label="Subtitle" error={form.formState.errors.subtitle?.message}>
          <Textarea rows={2} {...form.register('subtitle')} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="CTA label" error={form.formState.errors.ctaText?.message}>
            <Input placeholder="Shop mattresses" {...form.register('ctaText')} />
          </Field>
          <Field
            label="CTA URL"
            hint="Relative or absolute. Leave blank for no button."
            error={form.formState.errors.ctaUrl?.message}
          >
            <Input placeholder="/category/mattresses" {...form.register('ctaUrl')} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Status">
            <select
              className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg focus-ring"
              {...form.register('status')}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Starts at" hint="Optional. Slide hides before this moment.">
            <Input type="datetime-local" {...form.register('startsAt')} />
          </Field>
          <Field label="Ends at" hint="Optional. Slide hides after this moment.">
            <Input type="datetime-local" {...form.register('endsAt')} />
          </Field>
        </div>

        {/* Image: only available after the slide exists because the upload
            endpoint is keyed by slideId. Fresh-create shows a helpful note. */}
        <div className="rounded-md border border-border bg-bg-alt/40 p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[11px] uppercase tracking-[0.14em] text-subtle">Image</span>
            {uploadMutation.isPending && (
              <span className="text-xs text-muted">Uploading…</span>
            )}
          </div>
          {existing ? (
            <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
              <div className="aspect-[5/3] overflow-hidden rounded bg-bg-alt">
                {existing.imageUrl ? (
                  <img
                    src={existing.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-xs text-subtle">
                    No image yet
                  </div>
                )}
              </div>
              <ImageUploader
                onFiles={handleImageFiles}
                hint="Replace the current image. JPG, PNG, or WebP up to 8MB."
                multiple={false}
                disabled={uploadMutation.isPending}
              />
            </div>
          ) : (
            <p className="text-sm text-muted">
              Image upload becomes available after you save the slide.
            </p>
          )}
        </div>

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
    title: '',
    subtitle: '',
    ctaText: '',
    ctaUrl: '',
    sortOrder: 0,
    status: 'PUBLISHED',
    startsAt: '',
    endsAt: '',
  };
}

function toFormValues(h: HeroSlideAdminDto): FormValues {
  return {
    title: h.title,
    subtitle: h.subtitle ?? '',
    ctaText: h.ctaText ?? '',
    ctaUrl: h.ctaUrl ?? '',
    sortOrder: h.sortOrder,
    status: h.status,
    startsAt: toDatetimeLocal(h.startsAt),
    endsAt: toDatetimeLocal(h.endsAt),
  };
}

function toRequestBody(v: FormValues) {
  return {
    title: v.title.trim(),
    subtitle: blankToNull(v.subtitle),
    ctaText: blankToNull(v.ctaText),
    ctaUrl: blankToNull(v.ctaUrl),
    sortOrder: v.sortOrder,
    status: v.status,
    startsAt: fromDatetimeLocal(v.startsAt),
    endsAt: fromDatetimeLocal(v.endsAt),
  };
}

function blankToNull(v: string | null | undefined): string | null {
  if (v === null || v === undefined) return null;
  const s = v.trim();
  return s.length === 0 ? null : s;
}

/** "2026-04-23T10:12" expected by <input type=datetime-local>. */
function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(s: string | null | undefined): string | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
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
          title: 'title',
          subtitle: 'subtitle',
          ctaText: 'ctaText',
          ctaUrl: 'ctaUrl',
          sortOrder: 'sortOrder',
          status: 'status',
          startsAt: 'startsAt',
          endsAt: 'endsAt',
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
