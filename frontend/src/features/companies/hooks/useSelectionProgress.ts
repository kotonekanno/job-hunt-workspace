import { useState } from 'react';
import type { GetCompanyResponse } from '@/api/generated/models/getCompanyResponse';
import type {
  Selection,
  SelectionStatus,
} from '@/features/companies/model/selection';
import type { useCompanyDetail } from './useCompanyDetail';
import {
  changeCurrentStep,
  normalizeSelection,
} from '@/features/companies/lib/selectionProgress';
import {
  activateSelection,
  removeSelection,
  saveSelection,
  saveSelectionStatus,
  selectionViews,
} from '@/features/companies/lib/companyDetailApi';
import { apiStatus } from '@/features/companies/lib/companyBoard';

type Mutate = ReturnType<typeof useCompanyDetail>['mutate'];
function withTrack(
  detail: GetCompanyResponse | undefined,
  track: Selection,
  replaceId = track.id,
) {
  if (!detail) return detail;
  const selection = {
    id: track.id,
    title: track.title,
    currentStepId: track.currentStep || undefined,
    steps: [...track.steps]
      .sort((a, b) => a.stepNo - b.stepNo)
      .map((step) => ({
        id: step.id,
        name: step.title,
        note: step.note,
        status: apiStatus[step.status],
      })),
  };
  const exists = detail.selections?.some((item) => item.id === replaceId);
  return {
    ...detail,
    selections: exists
      ? detail.selections?.map((item) =>
          item.id === replaceId ? selection : item,
        )
      : [...(detail.selections ?? []), selection],
  };
}
export function useSelectionProgress(
  companyId: number,
  detail: GetCompanyResponse,
  mutate: Mutate,
) {
  const tracks = selectionViews(detail);
  const [pendingChange, setPendingChange] = useState<{
    before: Selection;
    after: Selection;
  }>();
  function persistStatus(
    track: Selection,
    stepId: number,
    result: SelectionStatus,
  ) {
    return mutate(
      (current) => withTrack(current, changeCurrentStep(track, stepId, result)),
      () => saveSelectionStatus(companyId, track.id, stepId, result),
    );
  }
  return {
    tracks,
    pendingChange,
    updateStepResult: (
      trackId: number,
      stepId: number,
      result: SelectionStatus,
    ) => {
      const track = tracks.find((item) => item.id === trackId);
      if (!track) return;
      if (track.currentStep !== stepId)
        setPendingChange({
          before: track,
          after: changeCurrentStep(track, stepId, result),
        });
      else void persistStatus(track, stepId, result);
    },
    saveTrack: (track: Selection, movedId?: number) => {
      const previous = tracks.find((item) => item.id === track.id);
      const next = normalizeSelection(track);
      let confirmed = previous;
      return mutate(
        (current) => withTrack(current, next),
        () =>
          saveSelection(
            companyId,
            next,
            previous,
            (saved) => {
              confirmed = saved;
            },
            movedId,
          ),
        (current, saved) => withTrack(current, saved, track.id),
        (before) =>
          confirmed ? withTrack(before, confirmed, track.id) : before,
      );
    },
    removeTrack: (id: number) =>
      mutate(
        (current) =>
          current
            ? {
                ...current,
                selections: current.selections?.filter(
                  (item) => item.id !== id,
                ),
                activeSelectionId:
                  current.activeSelectionId === id
                    ? null
                    : current.activeSelectionId,
              }
            : current,
        () => removeSelection(companyId, id),
      ),
    setActive: (id: number) => {
      const active = detail.activeSelectionId !== id;
      return mutate(
        (current) =>
          current
            ? { ...current, activeSelectionId: active ? id : null }
            : current,
        () => activateSelection(companyId, id, active),
      );
    },
    cancelChange: () => setPendingChange(undefined),
    confirmChange: async () => {
      if (!pendingChange) return;
      const { before, after } = pendingChange;
      const step = after.steps.find((item) => item.id === after.currentStep);
      if (step && (await persistStatus(before, step.id, step.status)))
        setPendingChange(undefined);
    },
  };
}
