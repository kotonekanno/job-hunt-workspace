import type { SelectionStatus as ApiStatus } from '@/api/generated/models';
import type { SelectionStatus as DisplayStatus } from '@/features/companies/model/selection';
export const selectionStatusForDisplay: Record<ApiStatus, DisplayStatus> = {
  NOT_STARTED: 'not_started',
  PENDING: 'pending',
  PASSED: 'passed',
  FAILED: 'failed',
};
export const selectionStatusForApi: Record<DisplayStatus, ApiStatus> = {
  not_started: 'NOT_STARTED',
  pending: 'PENDING',
  passed: 'PASSED',
  failed: 'FAILED',
};
