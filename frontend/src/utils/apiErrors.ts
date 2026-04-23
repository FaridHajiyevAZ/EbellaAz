import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { AppApiError } from '@/api/client';

/**
 * Returns a user-facing message for an unknown error. Defaults to a quiet
 * fallback so callers don't have to write the ternary every time.
 */
export function apiErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (err instanceof AppApiError) return err.message;
  if (err instanceof Error)       return err.message;
  return fallback;
}

/**
 * Maps the backend's ApiError.fieldErrors onto react-hook-form fields.
 *
 *   applyBackendFieldErrors(err, form, {
 *     name: 'name',
 *     slug: 'slug',
 *     parentId: 'parentId',
 *   });
 *
 * Errors with no entry in {@code fieldMap} (or non-AppApiErrors) land on the
 * RHF root error so the form can display a banner.
 */
export function applyBackendFieldErrors<T extends FieldValues>(
  err: unknown,
  form: UseFormReturn<T>,
  fieldMap: Partial<Record<string, Path<T>>>,
  fallback = 'Something went wrong. Please try again.',
): void {
  if (!(err instanceof AppApiError)) {
    form.setError('root', { message: apiErrorMessage(err, fallback) });
    return;
  }
  if (!err.fieldErrors || err.fieldErrors.length === 0) {
    form.setError('root', { message: err.message });
    return;
  }
  let mapped = false;
  for (const fe of err.fieldErrors) {
    const target = fieldMap[fe.field];
    if (target) {
      form.setError(target, { message: fe.message });
      mapped = true;
    }
  }
  if (!mapped) form.setError('root', { message: err.message });
}
