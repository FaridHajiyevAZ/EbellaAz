import { useEffect, useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { FormSection } from '@/components/ui/FormSection';
import { Field, Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/components/ui/Toast';
import {
  useAdminSiteSettings,
  useUpsertSiteSetting,
} from '@/hooks/useAdminCms';
import { AppApiError } from '@/api/client';
import { SiteSettingKeys } from '@/utils/SiteSettingKeys';
import type { SiteSettingAdminDto } from '@/types/api';

/** Curated rows to edit via a friendly UI. Unknown keys stay manageable below. */
interface FieldDef {
  key: string;
  label: string;
  hint?: string;
  kind?: 'text' | 'textarea' | 'url';
  publicByDefault?: boolean;
}

const BRANDING: FieldDef[] = [
  { key: SiteSettingKeys.SITE_NAME,       label: 'Site name',                publicByDefault: true },
  { key: SiteSettingKeys.SITE_LOGO_KEY,   label: 'Logo (storage key or URL)', hint: 'Example: "site-assets/logo.svg" or a full URL.', kind: 'url', publicByDefault: true },
  { key: SiteSettingKeys.SITE_META_TITLE, label: 'Default meta title',       publicByDefault: true },
  { key: SiteSettingKeys.SITE_META_DESC,  label: 'Default meta description', kind: 'textarea', publicByDefault: true },
  { key: SiteSettingKeys.SITE_PUBLIC_BASE_URL, label: 'Public site base URL', hint: 'Used when building absolute links in emails and WhatsApp messages.', kind: 'url', publicByDefault: true },
];

const WHATSAPP: FieldDef[] = [
  { key: SiteSettingKeys.WHATSAPP_NUMBER,   label: 'WhatsApp number', hint: 'Digits only, no + or spaces.', publicByDefault: true },
  {
    key: SiteSettingKeys.WHATSAPP_TEMPLATE,
    label: 'Message template',
    hint: 'Placeholders: {product_name} {color} {sku} {product_url}. Use { literal {placeholder} literal } for optional blocks.',
    kind: 'textarea',
    publicByDefault: true,
  },
];

const SOCIAL: FieldDef[] = [
  { key: SiteSettingKeys.SOCIAL_INSTAGRAM, label: 'Instagram URL', kind: 'url', publicByDefault: true },
  { key: SiteSettingKeys.SOCIAL_FACEBOOK,  label: 'Facebook URL',  kind: 'url', publicByDefault: true },
  { key: SiteSettingKeys.SOCIAL_TIKTOK,    label: 'TikTok URL',    kind: 'url', publicByDefault: true },
  { key: SiteSettingKeys.SOCIAL_YOUTUBE,   label: 'YouTube URL',   kind: 'url', publicByDefault: true },
];

export function SiteSettingsForm() {
  const list = useAdminSiteSettings();

  if (list.isLoading) return <Skeleton className="h-96 w-full" />;
  if (list.isError)   return <ErrorState onRetry={() => list.refetch()} />;

  const byKey = new Map((list.data ?? []).map((s) => [s.key, s]));
  const KNOWN_KEYS = new Set<string>([...BRANDING, ...WHATSAPP, ...SOCIAL].map((f) => f.key));
  const custom = (list.data ?? []).filter((s) => !KNOWN_KEYS.has(s.key));

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="divide-y divide-border">
          <FormSection title="Brand" description="The values shown on the public site header and SEO tags.">
            <SettingRows fields={BRANDING} byKey={byKey} />
          </FormSection>

          <FormSection
            title="WhatsApp inquiry"
            description="Number and template used on the product page CTA."
          >
            <SettingRows fields={WHATSAPP} byKey={byKey} />
          </FormSection>

          <FormSection title="Social links">
            <SettingRows fields={SOCIAL} byKey={byKey} />
          </FormSection>
        </CardBody>
      </Card>

      {custom.length > 0 && (
        <Card>
          <CardBody className="divide-y divide-border">
            <FormSection
              title="Other settings"
              description="Keys added outside the curated groups. Edit values in place."
            >
              <div className="space-y-3">
                {custom.map((s) => (
                  <CustomSettingRow key={s.key} setting={s} />
                ))}
              </div>
            </FormSection>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function SettingRows({
  fields,
  byKey,
}: {
  fields: FieldDef[];
  byKey: Map<string, SiteSettingAdminDto>;
}) {
  return (
    <div className="space-y-4">
      {fields.map((f) => (
        <SettingRow key={f.key} field={f} setting={byKey.get(f.key)} />
      ))}
    </div>
  );
}

function SettingRow({
  field,
  setting,
}: {
  field: FieldDef;
  setting?: SiteSettingAdminDto;
}) {
  const toast = useToast();
  const upsert = useUpsertSiteSetting();

  const initial = toDraft(setting?.value);
  const [value, setValue] = useState<string>(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => setValue(initial), [initial]);

  const dirty = value !== initial;

  const save = async () => {
    setSaving(true);
    try {
      await upsert.mutateAsync({
        key: field.key,
        body: {
          value,
          description: setting?.description ?? null,
          publicSetting: setting?.publicSetting ?? field.publicByDefault ?? true,
        },
      });
      toast.success(`${field.label} saved`);
    } catch (err) {
      toast.error(err instanceof AppApiError ? err.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Field
      label={field.label}
      hint={field.hint}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1">
          {field.kind === 'textarea' ? (
            <Textarea rows={3} value={value} onChange={(e) => setValue(e.target.value)} />
          ) : (
            <Input
              type={field.kind === 'url' ? 'url' : 'text'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          )}
          <p className="mt-1 text-[11px] text-subtle">
            Key: <code className="text-fg">{field.key}</code>
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant={dirty ? 'primary' : 'outline'}
          onClick={save}
          disabled={!dirty}
          loading={saving}
        >
          Save
        </Button>
      </div>
    </Field>
  );
}

function CustomSettingRow({ setting }: { setting: SiteSettingAdminDto }) {
  const toast = useToast();
  const upsert = useUpsertSiteSetting();

  const initial = toDraft(setting.value);
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const dirty = value !== initial;

  const save = async () => {
    setSaving(true);
    try {
      await upsert.mutateAsync({
        key: setting.key,
        body: { value, description: setting.description, publicSetting: setting.publicSetting },
      });
      toast.success(`${setting.key} saved`);
    } catch (err) {
      toast.error(err instanceof AppApiError ? err.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-[1fr_auto]">
      <div>
        <div className="text-[11px] uppercase tracking-[0.14em] text-subtle">{setting.key}</div>
        {setting.description && (
          <p className="mt-0.5 text-xs text-muted">{setting.description}</p>
        )}
        <Textarea
          rows={2}
          className="mt-2 font-mono text-xs"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <div className="flex sm:items-end">
        <Button
          type="button"
          size="sm"
          variant={dirty ? 'primary' : 'outline'}
          onClick={save}
          disabled={!dirty}
          loading={saving}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

/**
 * Stored values are JSON-parsed by the backend. For typical scalar settings
 * (site name, logo URL, etc.) the wire value is a plain string — we render
 * it directly. For objects (working hours, maps) we show the pretty JSON.
 */
function toDraft(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
