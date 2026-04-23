import { PageHeader } from '@/components/ui/PageHeader';
import { ContactInfoForm } from '@/features/admin/cms/ContactInfoForm';
import { SiteSettingsForm } from '@/features/admin/cms/SiteSettingsForm';

export function SettingsPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Configuration"
        title="Contact & Site Settings"
        description="Reach-out channels for customers and global values used across the public site."
      />

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-heading text-fg">Contact info</h2>
          <span className="text-xs text-subtle">Shown on /contact and in the footer.</span>
        </div>
        <ContactInfoForm />
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-heading text-fg">Site settings</h2>
          <span className="text-xs text-subtle">Branding, WhatsApp, social links.</span>
        </div>
        <SiteSettingsForm />
      </section>
    </div>
  );
}
