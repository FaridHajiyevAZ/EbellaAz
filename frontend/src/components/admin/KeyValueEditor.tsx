import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface Props {
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  keyLabel?: string;
  valueLabel?: string;
  className?: string;
  addLabel?: string;
  disabled?: boolean;
}

/**
 * Simple key/value list editor used for product dimensions and specs.
 * Values are stored as strings in the editor for a friendly input UX;
 * the backend's JSONB columns accept strings without issue. If real
 * typed values are needed later, add a type dropdown per row.
 */
export function KeyValueEditor({
  value,
  onChange,
  keyPlaceholder = 'e.g. width_cm',
  valuePlaceholder = 'e.g. 180',
  keyLabel = 'Key',
  valueLabel = 'Value',
  className,
  addLabel = 'Add row',
  disabled,
}: Props) {
  const entries = Object.entries(value ?? {});

  const updateAt = (i: number, nextKey: string, nextValue: string) => {
    const out: Record<string, unknown> = {};
    entries.forEach(([k, v], idx) => {
      if (idx === i) out[nextKey] = nextValue;
      else out[k] = v;
    });
    onChange(out);
  };

  const removeAt = (i: number) => {
    const out: Record<string, unknown> = {};
    entries.forEach(([k, v], idx) => {
      if (idx !== i) out[k] = v;
    });
    onChange(out);
  };

  const add = () => {
    const base = 'key';
    let candidate = base;
    let n = 1;
    while (candidate in (value ?? {})) {
      candidate = `${base}${n++}`;
    }
    onChange({ ...(value ?? {}), [candidate]: '' });
  };

  return (
    <div className={cn('space-y-2', className)}>
      {entries.length > 0 && (
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-[11px] uppercase tracking-wider text-subtle">
          <span>{keyLabel}</span>
          <span>{valueLabel}</span>
          <span />
        </div>
      )}

      {entries.map(([k, v], i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <Input
            value={k}
            placeholder={keyPlaceholder}
            onChange={(e) => updateAt(i, e.target.value, String(v ?? ''))}
            disabled={disabled}
          />
          <Input
            value={String(v ?? '')}
            placeholder={valuePlaceholder}
            onChange={(e) => updateAt(i, k, e.target.value)}
            disabled={disabled}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remove row"
            onClick={() => removeAt(i)}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={add} disabled={disabled}>
        <Plus className="h-3.5 w-3.5" /> {addLabel}
      </Button>
    </div>
  );
}
