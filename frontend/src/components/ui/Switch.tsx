import { cn } from '@/utils/cn';

interface Props {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
  id?: string;
}

/**
 * Minimal, accessible on/off switch. Button-based so it's focusable,
 * keyboard-operable, and announces state via aria-checked.
 */
export function Switch({
  checked,
  onChange,
  disabled,
  label,
  description,
  className,
  id,
}: Props) {
  return (
    <label
      htmlFor={id}
      className={cn('flex cursor-pointer items-start gap-3', disabled && 'cursor-not-allowed opacity-60', className)}
    >
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'focus-ring relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
          checked ? 'bg-fg' : 'bg-border',
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-bg shadow transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0.5',
          )}
        />
      </button>
      {(label || description) && (
        <span className="select-none">
          {label && <span className="block text-sm font-medium text-fg">{label}</span>}
          {description && <span className="mt-0.5 block text-xs text-muted">{description}</span>}
        </span>
      )}
    </label>
  );
}
