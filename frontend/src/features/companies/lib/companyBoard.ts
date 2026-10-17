import type { CompanyListItem } from '@/api/generated/models/companyListItem';
import type { CompanyPriority } from '@/api/generated/models/companyPriority';
import type { SelectionStatus } from '@/api/generated/models/selectionStatus';
import type { SelectionStatus as BadgeStatus } from '@/features/companies/model/selection';

export const listPriorities: CompanyPriority[] = [1, 2, 3, 4, 5, 6, 7];
export const listPriorityLabels: Record<number, string> = {
  1: '第1志望',
  2: '第2志望',
  3: '第3志望',
  4: '第4志望',
  5: '第5志望',
  6: '未分類',
  7: 'アーカイブ',
};
export const badgeStatus: Record<SelectionStatus, BadgeStatus> = {
  NOT_STARTED: 'not_started',
  PENDING: 'pending',
  PASSED: 'passed',
  FAILED: 'failed',
};
export const apiStatus: Record<BadgeStatus, SelectionStatus> = {
  not_started: 'NOT_STARTED',
  pending: 'PENDING',
  passed: 'PASSED',
  failed: 'FAILED',
};

export function companyBoardIds(companies: CompanyListItem[]) {
  return listPriorities.flatMap((priority) => [
    `priority-${priority}`,
    ...companies
      .filter((company) => company.priority === priority)
      .map((company) => `company-${company.id}`),
  ]);
}
export function companiesFromBoard(
  ids: string[],
  companies: CompanyListItem[],
) {
  const byId = new Map(
    companies.map((company) => [`company-${company.id}`, company]),
  );
  let priority = listPriorities[0];
  return ids.flatMap((id) => {
    const heading = listPriorities.find((value) => id === `priority-${value}`);
    if (heading !== undefined) {
      priority = heading;
      return [];
    }
    const company = byId.get(id);
    return company ? [{ ...company, priority }] : [];
  });
}

// Search results occupy their existing slots; hidden companies retain their order.
export function mergeVisibleCompanyOrder(
  all: CompanyListItem[],
  visible: CompanyListItem[],
) {
  const ids = new Set(visible.map((item) => item.id));
  let index = 0;
  return all.map((item) =>
    ids.has(item.id) ? (visible[index++] ?? item) : item,
  );
}
