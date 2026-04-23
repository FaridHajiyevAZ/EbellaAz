import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { FormSection } from '@/components/ui/FormSection';
import { Field, Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { ParentCategorySelect } from '@/components/admin/ParentCategorySelect';
import { useToast } from '@/components/ui/Toast';
import {
  useAdminCategory,
  useCreateCategory,
  useUpdateCategory,
} from '@/hooks/useAdminCategories';
import { apiErrorMessage, applyBackendFieldErrors } from '@/utils/apiErrors';
import type { CategoryAdminDto, ContentStatus, UUID } from '@/types/api';

/* -------------------------------- schema -------------------------------- */

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(160),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(160)
    .regex(slugPattern, 'Lowercase letters, digits, and hyphens only'),
  parentId: z.string().uuid().nullable().optional(),
  description: z.string().max(10000).optional().nullable(),
  sortOrder: z.number().int().min(0).max(10000).optional().nullable(),
  active: z.boolean(),
  metaTitle: z.string().max(180).optional().nullable(),
  metaDescription: z.string().max(320).optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

/* ---------------------------- page component ---------------------------- */

export function CategoryEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';

  return isNew ? <CategoryEditor key="new" /> : <CategoryEditor key={id} categoryId={id as UUID} />;
}

/**
 * Split into its own component so the form state gets a fresh mount per
 * category id via the outer key — no stale defaults on navigation.
 */
function CategoryEditor({ categoryId }: { categoryId?: UUID }) {
  const navigate = useNavigate();
  const toast = useToast();
  const isNew = !categoryId;

  const existing = useAdminCategory(categoryId);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory(categoryId as UUID);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues(),
  });

  // Hydrate form when an existing category loads.
  useEffect(() => {
    if (existing.data) form.reset(toFormValues(existing.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing.data]);

  const submitting = form.formState.isSubmitting || createMutation.isPending || updateMutation.isPending;

  const onSubmit = form.handleSubmit(async (values) => {
    const body = toRequestBody(values);
    try {
      if (isNew) {
        const created = await createMutation.mutateAsync(body);
        toast.success(`"${created.name}" created`);
        navigate(`/admin/categories/${created.id}`, { replace: true });
      } else {
        const updated = await updateMutation.mutateAsync(body);
        toast.success(`"${updated.name}" saved`);
      }
    } catch (err) {
      applyBackendFieldErrors(err, form, FIELD_MAP);
      toast.error(apiErrorMessage(err, 'Could not save'));
    }
  });

  if (!isNew && existing.isLoading) return <EditorSkeleton />;
  if (!isNew && existing.isError)  return <ErrorState onRetry={() => existing.refetch()} />;

  const title = isNew ? 'New category' : existing.data?.name ?? 'Edit category';

  return (
    <div>
      <PageHeader
        eyebrow={isNew ? 'Create' : 'Edit'}
        title={title}
        description={isNew ? 'Add a new top-level or nested category.' : undefined}
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/categories')}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        }
      />

      <form onSubmit={onSubmit}>
        <Card>
          <CardBody className="divide-y divide-border">
            <FormSection title="Basics" description="Name, slug, and where this category sits in the tree.">
              <Field label="Name" required error={form.formState.errors.name?.message}>
                <Input
                  placeholder="Coffee tables"
                  invalid={Boolean(form.formState.errors.name)}
                  {...form.register('name')}
                />
              </Field>
              <Field
                label="Slug"
                required
                hint="Used in the public URL. Lowercase letters, digits, and hyphens only."
                error={form.formState.errors.slug?.message}
              >
                <Input
                  placeholder="coffee-tables"
                  invalid={Boolean(form.formState.errors.slug)}
                  {...form.register('slug')}
                />
              </Field>

              <Field label="Parent" hint="Leave empty for a top-level category.">
                <Controller
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <ParentCategorySelect
                      value={field.value ?? null}
                      onChange={field.onChange}
                      excludeId={categoryId}
                    />
                  )}
                />
              </Field>

              <Field
                label="Description"
                error={form.formState.errors.description?.message}
              >
                <Textarea rows={3} {...form.register('description')} />
              </Field>
            </FormSection>

            <FormSection
              title="Display"
              description="Visibility on the public site and ordering among siblings."
            >
              <Controller
                control={form.control}
                name="active"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onChange={field.onChange}
                    label="Active"
                    description="Visible on the public site. Disable to move this category to Draft."
                  />
                )}
              />

              <Field
                label="Sort order"
                hint="Lower values appear first among siblings."
                error={form.formState.errors.sortOrder?.message}
              >
                <Input
                  type="number"
                  min={0}
                  className="max-w-[8rem]"
                  {...form.register('sortOrder', { setValueAs: emptyStringToNull })}
                />
              </Field>
            </FormSection>

            <FormSection title="SEO" description="Optional overrides for title and meta description.">
              <Field label="Meta title" error={form.formState.errors.metaTitle?.message}>
                <Input {...form.register('metaTitle')} />
              </Field>
              <Field
                label="Meta description"
                error={form.formState.errors.metaDescription?.message}
              >
                <Textarea rows={3} {...form.register('metaDescription')} />
              </Field>
            </FormSection>

            {/* Root error — surfaced when backend returns a non-field ApiError. */}
            {form.formState.errors.root?.message && (
              <div className="px-0 pt-4">
                <p className="rounded-md bg-danger/5 px-3 py-2 text-sm text-danger">
                  {form.formState.errors.root.message}
                </p>
              </div>
            )}
          </CardBody>
        </Card>

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/admin/categories')}
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

/* ------------------------------ helpers -------------------------------- */

function emptyValues(): FormValues {
  return {
    name: '',
    slug: '',
    parentId: null,
    description: '',
    sortOrder: 0,
    active: true,
    metaTitle: '',
    metaDescription: '',
  };
}

function toFormValues(c: CategoryAdminDto): FormValues {
  return {
    name: c.name,
    slug: c.slug,
    parentId: c.parentId ?? null,
    description: c.description ?? '',
    sortOrder: c.sortOrder,
    active: c.status === 'PUBLISHED',
    metaTitle: c.metaTitle ?? '',
    metaDescription: c.metaDescription ?? '',
  };
}

function toRequestBody(v: FormValues): {
  parentId: UUID | null;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number | null;
  status: ContentStatus;
  metaTitle: string | null;
  metaDescription: string | null;
} {
  return {
    parentId: v.parentId ?? null,
    name: v.name.trim(),
    slug: v.slug.trim(),
    description: blankToNull(v.description),
    sortOrder: v.sortOrder ?? 0,
    status: v.active ? 'PUBLISHED' : 'DRAFT',
    metaTitle: blankToNull(v.metaTitle),
    metaDescription: blankToNull(v.metaDescription),
  };
}

function blankToNull(v: string | null | undefined): string | null {
  if (v === null || v === undefined) return null;
  const trimmed = v.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function emptyStringToNull(v: unknown): number | null {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Backend field paths -> form field names. Used by applyBackendFieldErrors. */
const FIELD_MAP: Partial<Record<string, keyof FormValues>> = {
  name: 'name',
  slug: 'slug',
  parentId: 'parentId',
  description: 'description',
  sortOrder: 'sortOrder',
  status: 'active',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
};

function EditorSkeleton() {
  return (
    <div>
      <Skeleton className="h-8 w-64" />
      <div className="mt-6 space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
