import { useParams } from 'react-router-dom';
import { Card, CardBody } from '@/components/ui/Card';
import { FormSection } from '@/components/ui/FormSection';
import { Field, Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ImageUploader } from '@/components/ui/ImageUploader';

export function ProductEditPage() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-heading text-fg">
          {id === 'new' ? 'New product' : 'Edit product'}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline">Save draft</Button>
          <Button>Publish</Button>
        </div>
      </header>

      <Card>
        <CardBody className="divide-y divide-border">
          <FormSection title="Basics" description="Name, slug, and the category it lives in.">
            <Field label="Name" required><Input placeholder="Oak Dining Table 180" /></Field>
            <Field label="Slug" hint="Used in the public URL." required><Input placeholder="oak-dining-table" /></Field>
            <Field label="SKU" required><Input placeholder="DT-OAK-180" /></Field>
            <Field label="Short description"><Input placeholder="Solid oak table for six." /></Field>
            <Field label="Long description"><Textarea rows={6} /></Field>
          </FormSection>

          <FormSection title="Variations" description="Each color option is a variation with its own gallery.">
            <p className="text-sm text-muted">Variation editor lands in the next milestone.</p>
          </FormSection>

          <FormSection title="Cover images" description="Upload source images; the backend generates renditions automatically.">
            <ImageUploader onFiles={(files) => console.log('upload', files)} />
          </FormSection>
        </CardBody>
      </Card>
    </div>
  );
}
