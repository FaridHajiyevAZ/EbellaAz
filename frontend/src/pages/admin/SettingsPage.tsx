import { Card, CardBody } from '@/components/ui/Card';
import { FormSection } from '@/components/ui/FormSection';
import { Field, Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-heading text-fg">Settings</h1>
        <p className="text-sm text-muted">Global site configuration.</p>
      </header>

      <Card>
        <CardBody className="divide-y divide-border">
          <FormSection
            title="Brand"
            description="The values shown on the public site header and SEO tags."
            actions={<Button>Save</Button>}
          >
            <Field label="Site name"><Input placeholder="Ebella" /></Field>
            <Field label="Default meta description"><Textarea rows={3} /></Field>
          </FormSection>

          <FormSection title="WhatsApp inquiry" description="Number and template used on the product page CTA.">
            <Field label="WhatsApp number" hint="Digits only, no + or spaces">
              <Input placeholder="994550000000" />
            </Field>
            <Field label="Message template" hint="Placeholders: {product_name} {color} {product_url}">
              <Textarea rows={3} />
            </Field>
          </FormSection>

          <FormSection title="Social links" actions={<Button>Save</Button>}>
            <Field label="Instagram"><Input placeholder="https://instagram.com/…" /></Field>
            <Field label="Facebook"><Input placeholder="https://facebook.com/…" /></Field>
          </FormSection>
        </CardBody>
      </Card>
    </div>
  );
}
