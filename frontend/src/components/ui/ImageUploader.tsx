import { DragEvent, useRef, useState } from 'react';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './Button';

interface ImageUploaderProps {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  onFiles: (files: File[]) => void;
  hint?: string;
  className?: string;
}

/**
 * Drop-zone + click-to-browse. Caller is responsible for the actual upload
 * (typically via a TanStack Query mutation that hits /admin/media/...).
 */
export function ImageUploader({
  accept = 'image/jpeg,image/png,image/webp',
  multiple = true,
  disabled,
  onFiles,
  hint = 'JPG, PNG, or WebP up to 8MB.',
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const emit = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    onFiles(Array.from(fileList));
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled) emit(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center',
        'border-border bg-bg-alt/40 transition-colors',
        dragging && 'border-accent bg-accent/5',
        disabled && 'opacity-60',
        className,
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
        <ImageIcon className="h-5 w-5 text-muted" />
      </div>
      <div>
        <p className="text-sm font-medium text-fg">
          Drop images here, or click to browse
        </p>
        {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
      >
        <Upload className="h-4 w-4" /> Browse
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => emit(e.target.files)}
      />
    </div>
  );
}
