import type { EssayGroupListItem } from '@/api/generated/models/essayGroupListItem';

export function essayGroupUrl(id: EssayGroupListItem['id']) {
  return `/essays/${id === null ? 'unclassidied' : id}`;
}

export function essayGroupApiId(
  routeId: string | undefined,
): string | undefined {
  if (routeId === 'unclassidied') return 'unclassified';
  if (!routeId || !/^[1-9]\d*$/.test(routeId)) return undefined;
  const id = Number(routeId);
  return Number.isInteger(id) && id <= 2147483647 ? String(id) : undefined;
}
