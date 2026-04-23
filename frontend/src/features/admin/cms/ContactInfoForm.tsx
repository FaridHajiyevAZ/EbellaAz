import { useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardBody } from '@/components/ui/Card';
import { FormSection } from '@/components/ui/FormSection';
import { Field, Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { useToast } from '@/components/ui/Toast';
import {
  useAdminContactInfo,
  useCreateContactInfo,
  useUpdateContactInfo,
} from '@/hooks/useAdminCms';
import { AppApiError } from '@/api/client';
import type { ContactInfoAdminDto } from '@/types/api';

const schema = z.object({
  label:          z.string().min(1, 'Label is required').max(120),
  locale:         z.string().max(10).optional().nullable(),
  phone:          z.string().max(40).optional().nullable(),
  email:          z.string().email('Enter a valid email').max(160).optional().nullable().or(z.literal('')),
  whatsappNumber: z
    .string()
    .regex(/^\d{6,20}$/, 'Digits only, 6–20 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  addressLine1:   z.string().max(200).optional().nullable(),
  addressLine2:   z.string().max(200).optional().nullable(),
  city:           z.string().max(120).optional().nullable(),
  country:        z.string().max(120).optional().nullable(),
  postalCode:     z.string().max(20).optional().nullable(),
  mapUrl:         z.string().max(500).optional().nullable(),
  workingHoursJson: z.string().refine(isValidJson, 'Must be valid JSON'),
  primary:        z.boolean(),
});

type FormValues = z.infer<typeof schema>;

/**
 * Contact info editor. Loads the primary contact block if one exists,
 * otherwise creates one on first save.
 */
export function ContactInfoForm() {
  const toast = useToast();
  const list = useAdminContactInfo();
  const existing = list.data?.find((c) => c.primary) ?? list.data?.[0] ?? null;

  const createMutation = useCreateContactInfo();
  const updateMutation = useUpdateContactInfo(existing?.id as string);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues(),
  });

  useEffect(() => {
    form.reset(existing ? toFormValues(existing) : emptyValues());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id]);

  const submitting =
    form.formState.isSubmitting || createMutation.isPending || updateMutation.isPending;

  const onSubmit = form.handleSubmit(async (values) => {
    const body = toRequestBody(values);
    try {
      if (existing) {
        await updateMutation.mutateAsync(body);
        toast.success('Contact info saved');
      } else {
        await createMutation.mutateAsync(body);
        toast.success('Contact info created');
      }
    } catch (err) {
      applyBackendErrors(err, form);
      toast.error(err instanceof AppApiError ? err.message : 'Could not save');
    }
  });

  return (
    <Card>
      <form onSubmit={onSubmit}>
        <CardBody className="divide-y divide-border">
          <FormSection
            title="Identity"
            description="Label and the locale this block applies to."
          >
            <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
              <Field label="Label" required error={form.formState.errors.label?.message}>
                <Input placeholder="Showroom" {...form.register('label')} />
              </Field>
              <Field label="Locale" hint="Default is 'en'.">
                <Input placeholder="en" {...form.register('locale')} />
              </Field>
            </div>
            <Field
              label="Set as primary"
              hint="The primary block is used by the public /contact page."
            >
              <Switch
                checked={form.watch('primary')}
                onChange={(v) => form.setValue('primary', v, { shouldDirty: true })}
                label="Primary"
              />
            </Field>
          </FormSection>

          <FormSection
            title="Reachable"
            description="Numbers and emails shown on the public site."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone" error={form.formState.errors.phone?.message}>
                <Input placeholder="+994 55 000 00 00" {...form.register('phone')} />
              </Field>
              <Field label="Email" error={form.formState.errors.email?.message}>
                <Input type="email" placeholder="info@ebella.az" {...form.register('email')} />
              </Field>
              <Field
                label="WhatsApp number"
                hint="Digits only, no + or spaces."
                error={form.formState.errors.whatsappNumber?.message}
              >
                <Input placeholder="994550000000" {...form.register('whatsappNumber')} />
              </Field>
              <div />
            </div>
          </FormSection>

          <FormSection
            title="Location"
            description="Showroom or office address; used by the footer and the contact page."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Address line 1" error={form.formState.errors.addressLine1?.message}>
                <Input {...form.register('addressLine1')} />
              </Field>
              <Field label="Address line 2" error={form.formState.errors.addressLine2?.message}>
                <Input {...form.register('addressLine2')} />
              </Field>
              <Field label="City" error={form.formState.errors.city?.message}>
                <Input {...form.register('city')} />
              </Field>
              <Field label="Country" error={form.formState.errors.country?.message}>
                <Input {...form.register('country')} />
              </Field>
              <Field label="Postal code" error={form.formState.errors.postalCode?.message}>
                <Input {...form.register('postalCode')} />
              </Field>
              <Field
                label="Map URL"
                hint="Google Maps or equivalent embed URL."
                error={form.formState.errors.mapUrl?.message}
              >
                <Input placeholder="https://www.google.com/maps/embed?…" {...form.register('mapUrl')} />
              </Field>
            </div>
          </FormSection>

          <FormSection
            title="Working hours"
            description='Keyed JSON. Example: {"mon_fri":"10:00–19:00","sat":"10:00–18:00","sun":"closed"}'
          >
            <Field label="Hours (JSON)" error={form.formState.errors.workingHoursJson?.message}>
              <Textarea
                rows={6}
                spellCheck={false}
                className="font-mono text-xs"
                {...form.register('workingHoursJson')}
              />
            </Field>
          </FormSection>

          {form.formState.errors.root?.message && (
            <div className="pt-4">
              <p className="rounded-md bg-danger/5 px-3 py-2 text-sm text-danger">
                {form.formState.errors.root.message}
              </p>
            </div>
          )}
        </CardBody>

        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
          <Button type="submit" loading={submitting}>Save contact info</Button>
        </div>
      </form>
    </Card>
  );
}

/* ----------------------------- helpers ----------------------------- */

function emptyValues(): FormValues {
  return {
    label: 'Showroom',
    locale: 'en',
    phone: '',
    email: '',
    whatsappNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    country: '',
    postalCode: '',
    mapUrl: '',
    workingHoursJson: '{}',
    primary: true,
  };
}

function toFormValues(c: ContactInfoAdminDto): FormValues {
  return {
    label: c.label,
    locale: c.locale ?? 'en',
    phone: c.phone ?? '',
    email: c.email ?? '',
    whatsappNumber: c.whatsappNumber ?? '',
    addressLine1: c.addressLine1 ?? '',
    addressLine2: c.addressLine2 ?? '',
    city: c.city ?? '',
    country: c.country ?? '',
    postalCode: c.postalCode ?? '',
    mapUrl: c.mapUrl ?? '',
    workingHoursJson: c.workingHours ? JSON.stringify(c.workingHours, null, 2) : '{}',
    primary: c.primary,
  };
}

function toRequestBody(v: FormValues) {
  return {
    label: v.label.trim(),
    locale: blankToNull(v.locale),
    phone: blankToNull(v.phone),
    email: blankToNull(v.email),
    whatsappNumber: blankToNull(v.whatsappNumber),
    addressLine1: blankToNull(v.addressLine1),
    addressLine2: blankToNull(v.addressLine2),
    city: blankToNull(v.city),
    country: blankToNull(v.country),
    postalCode: blankToNull(v.postalCode),
    mapUrl: blankToNull(v.mapUrl),
    workingHours: safeJsonObject(v.workingHoursJson),
    primary: v.primary,
  };
}

function blankToNull(v: string | null | undefined): string | null {
  if (v === null || v === undefined) return null;
  const s = v.trim();
  return s.length === 0 ? null : s;
}

function isValidJson(s: string): boolean {
  if (!s || !s.trim()) return true;
  try {
    JSON.parse(s);
    return true;
  } catch {
    return false;
  }
}

function safeJsonObject(s: string): Record<string, string> | null {
  if (!s || !s.trim()) return null;
  try {
    const v = JSON.parse(s);
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      return Object.fromEntries(
        Object.entries(v as Record<string, unknown>).map(([k, val]) => [k, String(val)]),
      );
    }
  } catch {
    /* fall through */
  }
  return null;
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
          label: 'label',
          locale: 'locale',
          phone: 'phone',
          email: 'email',
          whatsappNumber: 'whatsappNumber',
          addressLine1: 'addressLine1',
          addressLine2: 'addressLine2',
          city: 'city',
          country: 'country',
          postalCode: 'postalCode',
          mapUrl: 'mapUrl',
          workingHours: 'workingHoursJson',
          primary: 'primary',
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
