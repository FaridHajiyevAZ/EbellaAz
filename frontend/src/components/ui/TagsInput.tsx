import { KeyboardEvent, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  id?: string;
  maxTags?: number;
}

/**
 * Chip-based tags input. Enter or comma commits the current draft; Backspace
 * on an empty draft removes the last tag. Duplicates are silently ignored.
 */
export function TagsInput({
  value,
  onChange,
  placeholder,
  disabled,
  invalid,
  className,
  id,
  maxTags,
}: Props) {
  const [draft, setDraft] = useState('');

  const commit = () => {
    const next = draft.trim();
    if (!next) return;
    if (maxTags !== undefined && value.length >= maxTags) return;
    if (value.includes(next)) {
      setDraft('');
      return;
    }
    onChange([...value, next]);
    setDraft('');
  };

  const removeAt = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      e.preventDefault();
      removeAt(value.length - 1);
    }
  };

  return (
    <div
      className={cn(
        'flex min-h-[2.5rem] flex-wrap items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1.5 text-sm focus-within:ring-2 focus-within:ring-accent/40',
        invalid && 'border-danger focus-within:ring-danger/30',
        disabled && 'opacity-60',
        className,
      )}
    >
      {value.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="inline-flex items-center gap-1 rounded-full bg-bg-alt px-2.5 py-0.5 text-xs font-medium text-fg"
        >
          {tag}
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            onClick={() => removeAt(i)}
            className="-mr-1 rounded-full p-0.5 text-muted hover:text-fg"
            disabled={disabled}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : undefined}
        disabled={disabled}
        className="flex-1 min-w-[8rem] bg-transparent px-1 py-0.5 text-fg placeholder:text-subtle focus:outline-none"
      />
    </div>
  );
}
