import { Card, CardBody, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { ImageUploader } from '@/components/ui/ImageUploader';

export function MediaPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-heading text-fg">Media</h1>
        <p className="text-sm text-muted">Upload and manage assets used across the site.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Upload</CardTitle>
          <CardSubtitle>JPG, PNG, or WebP up to 8MB.</CardSubtitle>
        </CardHeader>
        <CardBody>
          <ImageUploader onFiles={(files) => console.log(files)} />
        </CardBody>
      </Card>
    </div>
  );
}
