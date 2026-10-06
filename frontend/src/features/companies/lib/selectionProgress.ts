import type {
  Selection,
  SelectionStatus,
} from '@/features/companies/model/selection';

export function changeCurrentStep(
  track: Selection,
  stepId: number,
  status: SelectionStatus,
): Selection {
  const steps = [...track.steps].sort((a, b) => a.stepNo - b.stepNo);
  const index = steps.findIndex((step) => step.id === stepId);
  if (index < 0) return track;
  return {
    ...track,
    currentStep: stepId,
    steps: steps.map((step, position) => ({
      ...step,
      status:
        position < index ? 'passed' : position > index ? 'not_started' : status,
    })),
  };
}

export function normalizeSelection(track: Selection): Selection {
  const steps = [...track.steps].sort((a, b) => a.stepNo - b.stepNo);
  const current =
    steps.find((step) => step.id === track.currentStep) ??
    steps.find((step) => step.status !== 'passed') ??
    steps.at(-1);
  return current
    ? changeCurrentStep(track, current.id, current.status)
    : { ...track, currentStep: 0, isActive: false };
}
