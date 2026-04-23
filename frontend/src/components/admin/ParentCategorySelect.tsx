import { useMemo } from 'react';
import type { CategoryTreeNode, UUID } from '@/types/api';
import { useCategoryTree } from '@/hooks/useCatalog';
import { cn } from '@/utils/cn';

interface Props {
  value: UUID | null;
  onChange: (id: UUID | null) => void;
  /** Category id being edited — used to hide self + descendants to prevent circular parents. */
  excludeId?: UUID | null;
  id?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

interface Option {
  id: UUID;
  label: string;
  depth: number;
}

/**
 * Parent category dropdown. Uses the public category tree (cached) and
 * flattens it into a depth-indented list so admins can pick any node.
 * Automatically excludes the currently-edited category and its subtree
 * so the UI never offers a move that the backend would reject.
 */
export function ParentCategorySelect({
  value,
  onChange,
  excludeId,
  id,
  disabled,
  className,
  placeholder = '— No parent (root category) —',
}: Props) {
  const { data: tree, isLoading } = useCategoryTree();

  const options = useMemo<Option[]>(
    () => (tree ? flatten(tree, excludeId ?? null) : []),
    [tree, excludeId],
  );

  return (
    <select
      id={id}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? (e.target.value as UUID) : null)}
      disabled={disabled || isLoading}
      className={cn(
        'h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg focus-ring',
        disabled && 'opacity-60',
        className,
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {indent(o.depth)}
          {o.label}
        </option>
      ))}
    </select>
  );
}

function flatten(
  nodes: CategoryTreeNode[],
  excludeId: UUID | null,
  out: Option[] = [],
): Option[] {
  for (const n of nodes) {
    if (n.id === excludeId) continue;
    out.push({ id: n.id, label: n.name, depth: n.depth });
    if (n.children.length) flatten(n.children, excludeId, out);
  }
  return out;
}

function indent(depth: number) {
  if (depth <= 0) return '';
  // Non-breaking spaces survive the <option> whitespace collapse.
  return '  '.repeat(depth) + '↳ ';
}
