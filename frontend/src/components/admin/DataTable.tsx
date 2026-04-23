import { ReactNode } from 'react';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { cn } from '@/utils/cn';

export interface Column<T> {
  header: ReactNode;
  cell: (row: T, index: number) => ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: string;
  className?: string;
}

interface Props<T> {
  data: T[] | undefined;
  columns: Column<T>[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onRowClick?: (row: T) => void;
  /** Custom empty state, overrides the built-in one. */
  empty?: ReactNode;
  skeletonRows?: number;
  className?: string;
}

/**
 * Typed admin table with loading, empty, and error states in one place.
 * Keeps column definitions colocated with the page — no nested render props.
 */
export function DataTable<T>({
  data,
  columns,
  rowKey,
  isLoading,
  isError,
  onRetry,
  onRowClick,
  empty,
  skeletonRows = 6,
  className,
}: Props<T>) {
  if (isError) return <ErrorState onRetry={onRetry} />;

  if (isLoading) {
    return (
      <Table className={className}>
        <THead>
          <TR>
            {columns.map((c, i) => (
              <TH key={i} style={{ width: c.width }} className={alignClass(c.align)}>
                {c.header}
              </TH>
            ))}
          </TR>
        </THead>
        <TBody>
          {Array.from({ length: skeletonRows }).map((_, i) => (
            <TR key={i}>
              {columns.map((c, j) => (
                <TD key={j} className={alignClass(c.align)}>
                  <Skeleton className="h-4 w-full max-w-[10rem]" />
                </TD>
              ))}
            </TR>
          ))}
        </TBody>
      </Table>
    );
  }

  if (!data || data.length === 0) {
    return <>{empty ?? <EmptyState title="No results" />}</>;
  }

  return (
    <Table className={className}>
      <THead>
        <TR>
          {columns.map((c, i) => (
            <TH key={i} style={{ width: c.width }} className={alignClass(c.align)}>
              {c.header}
            </TH>
          ))}
        </TR>
      </THead>
      <TBody>
        {data.map((row, rowIdx) => (
          <TR
            key={rowKey(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={cn(onRowClick && 'cursor-pointer')}
          >
            {columns.map((c, i) => (
              <TD key={i} className={cn(alignClass(c.align), c.className)}>
                {c.cell(row, rowIdx)}
              </TD>
            ))}
          </TR>
        ))}
      </TBody>
    </Table>
  );
}

function alignClass(a?: 'left' | 'right' | 'center') {
  if (a === 'right') return 'text-right';
  if (a === 'center') return 'text-center';
  return 'text-left';
}
