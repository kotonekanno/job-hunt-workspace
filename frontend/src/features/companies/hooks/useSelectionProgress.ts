import { useState } from 'react';
import { initialSelectionTracks } from '@/features/companies/model/companyDetail';
import type {
  Selection,
  SelectionStatus,
} from '@/features/companies/model/selection';
import {
  changeCurrentStep,
  normalizeSelection,
} from '@/features/companies/lib/selectionProgress';

export function useSelectionProgress() {
  const [tracks, setTracks] = useState(() =>
    initialSelectionTracks.map(normalizeSelection),
  );
  const [pendingChange, setPendingChange] = useState<{
    before: Selection;
    after: Selection;
  }>();
  function updateStepResult(
    trackId: number,
    stepId: number,
    result: SelectionStatus,
  ) {
    const track = tracks.find((item) => item.id === trackId);
    if (!track) return;
    const next = changeCurrentStep(track, stepId, result);
    if (track.currentStep !== stepId) {
      setPendingChange({ before: track, after: next });
    } else {
      setTracks((current) =>
        current.map((item) => (item.id === trackId ? next : item)),
      );
    }
  }
  function saveTrack(track: Selection) {
    const next = normalizeSelection(track);
    setTracks((current) => {
      const exists = current.some((item) => item.id === next.id);
      const updated = exists
        ? current.map((item) => (item.id === next.id ? next : item))
        : [...current, next];
      return updated.map((item) =>
        next.isActive && item.id !== next.id
          ? { ...item, isActive: false }
          : item,
      );
    });
  }
  return {
    tracks,
    pendingChange,
    updateStepResult,
    saveTrack,
    cancelChange: () => setPendingChange(undefined),
    confirmChange: () => {
      if (pendingChange) saveTrack(pendingChange.after);
      setPendingChange(undefined);
    },
    setActive: (id: number) =>
      setTracks((current) =>
        current.map((item) => ({
          ...item,
          isActive: item.id === id ? !item.isActive : false,
        })),
      ),
    removeTrack: (id: number) =>
      setTracks((current) => current.filter((item) => item.id !== id)),
  };
}
