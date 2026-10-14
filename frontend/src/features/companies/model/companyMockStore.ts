import { useSyncExternalStore, type SetStateAction } from 'react';
import type { Selection } from '@/features/companies/model/selection';
import { initialSelectionTracks } from '@/features/companies/model/companyDetail';
import {
  initialCompanyList,
  type CompanyListItem,
} from '@/features/companies/model/companyList';
import {
  initialActivities,
  type CompanyActivity,
} from '@/features/companies/model/activity';

let companies = initialCompanyList;
const activities = new Map<number, CompanyActivity[]>([[1, initialActivities]]);
const emptyActivities: CompanyActivity[] = [];
const selections = new Map<number, Selection[]>(
  initialCompanyList.map((company) => [
    company.id,
    company.id === 1
      ? initialSelectionTracks
      : company.selection
        ? [
            {
              id: 1,
              title: company.selection.title,
              isActive: true,
              currentStep: 1,
              steps: [
                {
                  id: 1,
                  stepNo: 1,
                  title: company.selection.step,
                  status: company.selection.status,
                  heldAt: '',
                  note: '',
                },
              ],
            },
          ]
        : [],
  ]),
);
const emptySelections: Selection[] = [];
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const emit = () => listeners.forEach((listener) => listener());
export function useMockCompanies() {
  return useSyncExternalStore(subscribe, () => companies);
}
export function setMockCompanies(update: SetStateAction<CompanyListItem[]>) {
  companies = typeof update === 'function' ? update(companies) : update;
  emit();
}
export function deleteMockCompany(id: number) {
  selections.delete(id);
  activities.delete(id);
  setMockCompanies((current) => current.filter((company) => company.id !== id));
}

export function useMockSelections(id: number) {
  const value = useSyncExternalStore(
    subscribe,
    () => selections.get(id) ?? emptySelections,
  );
  function setValue(update: SetStateAction<Selection[]>) {
    const current = selections.get(id) ?? emptySelections;
    const next = typeof update === 'function' ? update(current) : update;
    selections.set(id, next);
    const active = next.find((track) => track.isActive);
    const step = active?.steps.find((item) => item.id === active.currentStep);
    setMockCompanies((items) =>
      items.map((company) =>
        company.id === id
          ? {
              ...company,
              selection:
                active && step
                  ? {
                      title: active.title,
                      step: step.title,
                      status: step.status,
                    }
                  : null,
            }
          : company,
      ),
    );
  }
  return [value, setValue] as const;
}
export function useMockActivities(id: number) {
  const value = useSyncExternalStore(
    subscribe,
    () => activities.get(id) ?? emptyActivities,
  );
  function setValue(update: SetStateAction<CompanyActivity[]>) {
    const current = activities.get(id) ?? emptyActivities;
    activities.set(id, typeof update === 'function' ? update(current) : update);
    emit();
  }
  return [value, setValue] as const;
}
