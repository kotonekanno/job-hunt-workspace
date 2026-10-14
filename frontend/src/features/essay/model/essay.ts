export type {
  Essay,
  EssayGroupListItem as EssayGroup,
} from '@/api/generated/models';
export const unclassifiedEssayGroupId = 'unclassified';
export function essayGroupPath(id: number | null): string {
  return id === null ? unclassifiedEssayGroupId : String(id);
}
