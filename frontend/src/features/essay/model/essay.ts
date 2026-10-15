import type { EssayGroupListItem } from '@/api/generated/models';

// Route parameters use "unclassified", while the list response uses null.
export const unclassifiedEssayGroupId = 'unclassified';
export function essayGroupKey(id: EssayGroupListItem['id']) {
  return id === null ? unclassifiedEssayGroupId : String(id);
}
