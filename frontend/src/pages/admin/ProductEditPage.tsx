import { useEffect } from 'react';
import { Controller, useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Palette } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { FormSection } from '@/components/ui/FormSection';
import { Field, Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { TagsInput } from '@/components/ui/TagsInput';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Badge } from '@/components/ui/Badge';
import { KeyValueEditor } from '@/components/admin/KeyValueEditor';
import { ParentCategorySelect } from '@/components/admin/ParentCategorySelect';
import { useToast } from '@/components/ui/Toast';
import {
  useAdminProduct,
  useCreateProduct,
  useUpdateProduct,
} from '@/hooks/useAdminProducts';
import { AppApiError } from '@/api/client';
import type {
  ProductAdminDetailDto,
  ProductStatus,
  UUID,
} from '@/types/api';

/* -------------------------------- schema -------------------------------- */

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const skuPattern  = /^[A-Z0-9][A-Z0-9\-_]{1,63}$/;

const STATUSES: ProductStatus[] = ['DRAFT', 'PUBLISHED', 'OUT_OF_STOCK', 'ARCHIVED'];

const schema = z.object({
  categoryId: z.string().uuid({ message: 'Pick a category' }),
  name: z.string().min(1, 'Name is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(200).regex(slugPattern, 'Lowercase letters, digits, and hyphens only'),
  sku:  z.string().min(1, 'SKU is required').max(64).regex(skuPattern, 'Upper-case letters, digits, "-" or "_"'),
  brand: z.string().max(120).optional().nullable(),
  shortDescription: z.string().max(500).optional().nullable(),
  longDescription:  z.string().max(20000).optional().nullable(),
  dimensions: z.record(z.unknown()),
  materials:  z.array(z.string()),
  specs:      z.record(z.unknown()),
  status:     z.enum(['DRAFT', 'PUBLISHED', 'OUT_OF_STOCK', 'ARCHIVED']),
  featured:   z.boolean(),
  sortOrder:  z.number().int().min(0).max(10000),
  metaTitle:        z.string().max(180).optional().nullable(),
  metaDescription:  z.string().max(320).optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

/* ------------------------------ component ------------------------------ */

export function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  return isNew
    ? <ProductEditor key="new" />
    : <ProductEditor key={id} productId={id as UUID} />;
}

function ProductEditor({ productId }: { productId?: UUID }) {
  const navigate = useNavigate();
  const toast = useToast();
  const isNew = !productId;

  const existing = useAdminProduct(productId);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(productId as UUID);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues(),
  });

  useEffect(() => {
    if (existing.data) form.reset(toFormValues(existing.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing.data]);

  if (!isNew && existing.isLoading) return <EditorSkeleton />;
  if (!isNew && existing.isError)  return <ErrorState onRetry={() => existing.refetch()} />;

  const submitting =
    form.formState.isSubmitting || createMutation.isPending || updateMutation.isPending;

  const onSubmit = form.handleSubmit(async (values) => {
    const body = toRequestBody(values);
    try {
      if (isNew) {
        const created = await createMutation.mutateAsync(body);
        toast.success(`"${created.name}" created`);
        navigate(`/admin/products/${created.id}`, { replace: true });
      } else {
        const updated = await updateMutation.mutateAsync(body);
        toast.success(`"${updated.name}" saved`);
      }
    } catch (err) {
      applyBackendErrors(err, form);
      toast.error(err instanceof AppApiError ? err.message : 'Could not save');
    }
  });

  const title = isNew ? 'New product' : existing.data?.name ?? 'Edit product';

  return (
    <div>
      <PageHeader
        eyebrow={isNew ? 'Create' : 'Edit'}
        title={title}
        description={
          !isNew && existing.data
            ? `${existing.data.categoryName} · ${existing.data.sku}`
            : 'Basics live here. Variations and images are managed on a dedicated page.'
        }
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/products')}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        }
      />

      <form onSubmit={onSubmit}>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardBody className="divide-y divide-border">
              <BasicsSection form={form} />
              <DescriptionsSection form={form} />
              <AttributesSection form={form} />
              <SeoSection form={form} />

              {form.formState.errors.root?.message && (
                <div className="px-0 pt-4">
                  <p className="rounded-md bg-danger/5 px-3 py-2 text-sm text-danger">
                    {form.formState.errors.root.message}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          <aside className="space-y-6">
            <PublishingCard form={form} />
            {!isNew && existing.data && <VariationsCard product={existing.data} />}
          </aside>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/admin/products')}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isNew ? 'Create' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}

/* ----------------------------- form sections --------------------------- */

function BasicsSection({ form }: { form: UseFormReturn<FormValues> }) {
  const { register, formState, control } = form;
  return (
    <FormSection title="Basics" description="Taxonomy, public-facing name, and identifiers.">
      <Field label="Category" required error={formState.errors.categoryId?.message}>
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <ParentCategorySelect
              value={field.value || null}
              onChange={(id) => field.onChange(id ?? '')}
              placeholder="Pick a category…"
            />
          )}
        />
      </Field>

      <Field label="Name" required error={formState.errors.name?.message}>
        <Input
          placeholder="Oak Dining Table 180"
          invalid={Boolean(formState.errors.name)}
          {...register('name')}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Slug"
          required
          hint="Used in the public URL."
          error={formState.errors.slug?.message}
        >
          <Input
            placeholder="oak-dining-table"
            invalid={Boolean(formState.errors.slug)}
            {...register('slug')}
          />
        </Field>
        <Field
          label="SKU"
          required
          hint="Upper-case identifier used internally."
          error={formState.errors.sku?.message}
        >
          <Input
            placeholder="DT-OAK-180"
            invalid={Boolean(formState.errors.sku)}
            {...register('sku')}
          />
        </Field>
      </div>

      <Field label="Brand" error={formState.errors.brand?.message}>
        <Input {...register('brand')} />
      </Field>
    </FormSection>
  );
}

function DescriptionsSection({ form }: { form: UseFormReturn<FormValues> }) {
  const { register, formState } = form;
  return (
    <FormSection title="Descriptions" description="Content that appears on the public product page.">
      <Field
        label="Short description"
        hint="One or two sentences. Used on cards and search previews."
        error={formState.errors.shortDescription?.message}
      >
        <Input {...register('shortDescription')} />
      </Field>
      <Field label="Long description" error={formState.errors.longDescription?.message}>
        <Textarea rows={6} {...register('longDescription')} />
      </Field>
    </FormSection>
  );
}

function AttributesSection({ form }: { form: UseFormReturn<FormValues> }) {
  const { control } = form;
  return (
    <FormSection title="Attributes" description="Structured data shown in the product detail pane.">
      <Field label="Dimensions" hint="Examples: width_cm, depth_cm, height_cm, weight_kg.">
        <Controller
          control={control}
          name="dimensions"
          render={({ field }) => (
            <KeyValueEditor value={field.value ?? {}} onChange={field.onChange} />
          )}
        />
      </Field>

      <Field label="Materials" hint="Press Enter or comma to add; Backspace to remove.">
        <Controller
          control={control}
          name="materials"
          render={({ field }) => (
            <TagsInput
              value={field.value ?? []}
              onChange={field.onChange}
              placeholder="oak, steel, leather…"
            />
          )}
        />
      </Field>

      <Field label="Specifications" hint="Any additional properties (seats, firmness, warranty, …).">
        <Controller
          control={control}
          name="specs"
          render={({ field }) => (
            <KeyValueEditor
              value={field.value ?? {}}
              onChange={field.onChange}
              keyPlaceholder="e.g. seats"
              valuePlaceholder="e.g. 6"
            />
          )}
        />
      </Field>
    </FormSection>
  );
}

function SeoSection({ form }: { form: UseFormReturn<FormValues> }) {
  const { register, formState } = form;
  return (
    <FormSection title="SEO" description="Optional overrides for title and meta description.">
      <Field label="Meta title" error={formState.errors.metaTitle?.message}>
        <Input {...register('metaTitle')} />
      </Field>
      <Field label="Meta description" error={formState.errors.metaDescription?.message}>
        <Textarea rows={3} {...register('metaDescription')} />
      </Field>
    </FormSection>
  );
}

function PublishingCard({ form }: { form: UseFormReturn<FormValues> }) {
  const { control, register, formState } = form;
  return (
    <Card>
      <CardBody className="space-y-5">
        <div>
          <span className="text-[11px] uppercase tracking-[0.14em] text-subtle">Publishing</span>
          <h3 className="mt-1 font-display text-heading text-fg">Status</h3>
        </div>

        <Field label="Status" error={formState.errors.status?.message}>
          <select
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg focus-ring"
            {...register('status')}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>

        <Controller
          control={control}
          name="featured"
          render={({ field }) => (
            <Switch
              checked={field.value}
              onChange={field.onChange}
              label="Featured"
              description="Surfaces this product in the homepage featured grid."
            />
          )}
        />

        <Field
          label="Sort order"
          hint="Lower appears first."
          error={formState.errors.sortOrder?.message}
        >
          <Input
            type="number"
            min={0}
            className="max-w-[8rem]"
            {...register('sortOrder', { valueAsNumber: true })}
          />
        </Field>
      </CardBody>
    </Card>
  );
}

function VariationsCard({ product }: { product: ProductAdminDetailDto }) {
  return (
    <Card>
      <CardBody className="space-y-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.14em] text-subtle">Variations</span>
          <h3 className="mt-1 font-display text-heading text-fg">Colors & galleries</h3>
          <p className="mt-1 text-xs text-muted">
            Variations, images, and stock labels live on their own page to keep this form focused.
          </p>
        </div>

        <div className="rounded-md border border-border p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Variations</span>
            <span className="text-fg">{product.variations.length}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-muted">Default</span>
            <span className="text-fg">
              {product.variations.find((v) => v.isDefault)?.colorName ?? '—'}
            </span>
          </div>
          {product.variations.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {product.variations.slice(0, 8).map((v) => (
                <span
                  key={v.id}
                  className="h-4 w-4 rounded-full border border-border"
                  title={v.colorName}
                  style={{ backgroundColor: v.colorHex }}
                />
              ))}
              {product.variations.length > 8 && (
                <Badge tone="neutral">+{product.variations.length - 8}</Badge>
              )}
            </div>
          )}
        </div>

        <Button asChild={false} className="w-full">
          <Link to={`/admin/products/${product.id}/variations`}>
            <Palette className="h-4 w-4" /> Manage variations
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardBody>
    </Card>
  );
}

/* ------------------------------- helpers ------------------------------- */

function emptyValues(): FormValues {
  return {
    categoryId: '',
    name: '',
    slug: '',
    sku: '',
    brand: '',
    shortDescription: '',
    longDescription: '',
    dimensions: {},
    materials: [],
    specs: {},
    status: 'DRAFT',
    featured: false,
    sortOrder: 0,
    metaTitle: '',
    metaDescription: '',
  };
}

function toFormValues(p: ProductAdminDetailDto): FormValues {
  return {
    categoryId: p.categoryId,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    brand: p.brand ?? '',
    shortDescription: p.shortDescription ?? '',
    longDescription: p.longDescription ?? '',
    dimensions: (p.dimensions as Record<string, unknown> | null) ?? {},
    materials: p.materials ?? [],
    specs: p.specs ?? {},
    status: p.status,
    featured: p.featured,
    sortOrder: p.sortOrder,
    metaTitle: p.metaTitle ?? '',
    metaDescription: p.metaDescription ?? '',
  };
}

function toRequestBody(v: FormValues) {
  return {
    categoryId: v.categoryId,
    sku: v.sku.trim(),
    slug: v.slug.trim(),
    name: v.name.trim(),
    brand: blankToNull(v.brand),
    shortDescription: blankToNull(v.shortDescription),
    longDescription:  blankToNull(v.longDescription),
    dimensions: Object.keys(v.dimensions).length > 0 ? v.dimensions : null,
    materials:  v.materials,
    specs:      v.specs,
    status:     v.status,
    featured:   v.featured,
    sortOrder:  v.sortOrder,
    metaTitle:        blankToNull(v.metaTitle),
    metaDescription:  blankToNull(v.metaDescription),
  };
}

function blankToNull(v: string | null | undefined): string | null {
  if (v === null || v === undefined) return null;
  const trimmed = v.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function applyBackendErrors(err: unknown, form: UseFormReturn<FormValues>) {
  if (!(err instanceof AppApiError)) {
    form.setError('root', { message: 'Something went wrong. Please try again.' });
    return;
  }
  if (err.fieldErrors?.length) {
    let mapped = false;
    for (const fe of err.fieldErrors) {
      const field = mapBackendField(fe.field);
      if (field) {
        form.setError(field, { message: fe.message });
        mapped = true;
      }
    }
    if (!mapped) form.setError('root', { message: err.message });
    return;
  }
  form.setError('root', { message: err.message });
}

function mapBackendField(backendField: string): keyof FormValues | null {
  const known: Record<string, keyof FormValues> = {
    categoryId: 'categoryId',
    name: 'name',
    slug: 'slug',
    sku: 'sku',
    brand: 'brand',
    shortDescription: 'shortDescription',
    longDescription:  'longDescription',
    status: 'status',
    featured: 'featured',
    sortOrder: 'sortOrder',
    metaTitle: 'metaTitle',
    metaDescription: 'metaDescription',
  };
  return known[backendField] ?? null;
}

function EditorSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Skeleton className="h-[600px] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}
