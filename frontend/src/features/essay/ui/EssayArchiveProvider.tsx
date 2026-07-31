import {
  useState,
  type ReactNode,
} from "react";
import { EssayArchiveContext } from "@/features/essay/model/EssayArchiveContext";
import {
  initialEssayGroups,
  initialEssays,
  type Essay,
  type EssayGroup,
  unclassifiedEssayGroupId,
} from "@/features/essay/model/essay";

type EssayArchiveProviderProps = {
  children: ReactNode;
};

export function EssayArchiveProvider({
  children,
}: EssayArchiveProviderProps) {
  const [essays, setEssays] = useState(initialEssays);
  const [groups, setGroups] = useState(initialEssayGroups);

  function addEssay(essay: Omit<Essay, "id">) {
    setEssays((current) => [
      { ...essay, id: Date.now() },
      ...current,
    ]);
  }

  function updateEssay(
    essayId: number,
    essay: Omit<Essay, "id">,
  ) {
    setEssays((current) => current.map((currentEssay) => (
      currentEssay.id === essayId
        ? { ...essay, id: essayId }
        : currentEssay
    )));
  }

  function deleteEssay(essayId: number) {
    setEssays((current) => current.filter(
      (essay) => essay.id !== essayId,
    ));
  }

  function addGroup(name: string) {
    const group: EssayGroup = {
      id: `group-${Date.now()}`,
      name,
    };

    setGroups((current) => {
      const unclassifiedIndex = current.findIndex(
        (item) => item.id === unclassifiedEssayGroupId,
      );

      if (unclassifiedIndex === -1) {
        return [...current, group];
      }

      return [
        ...current.slice(0, unclassifiedIndex),
        group,
        ...current.slice(unclassifiedIndex),
      ];
    });
    return group;
  }

  function updateGroup(groupId: string, name: string) {
    setGroups((current) => current.map((group) => (
      group.id === groupId
        ? { ...group, name }
        : group
    )));
  }

  function deleteGroup(groupId: string) {
    if (groupId === unclassifiedEssayGroupId) {
      return;
    }

    setGroups((current) => current.filter((group) => group.id !== groupId));
    setEssays((current) => current.map((essay) => (
      essay.groupId === groupId
        ? { ...essay, groupId: unclassifiedEssayGroupId }
        : essay
    )));
  }

  function reorderGroups(orderedGroupIds: string[]) {
    setGroups((current) => {
      const groupsById = new Map(current.map((group) => [group.id, group]));
      const requestedIds = new Set(orderedGroupIds);
      const orderedGroups = orderedGroupIds
        .filter((groupId) => groupId !== unclassifiedEssayGroupId)
        .map((groupId) => groupsById.get(groupId))
        .filter((group): group is EssayGroup => Boolean(group));
      const remainingGroups = current.filter((group) => (
        group.id !== unclassifiedEssayGroupId
        && !requestedIds.has(group.id)
      ));
      const unclassifiedGroup = groupsById.get(unclassifiedEssayGroupId);

      return [
        ...orderedGroups,
        ...remainingGroups,
        ...(unclassifiedGroup ? [unclassifiedGroup] : []),
      ];
    });
  }

  return (
    <EssayArchiveContext.Provider
      value={{
        essays,
        groups,
        addEssay,
        updateEssay,
        deleteEssay,
        addGroup,
        updateGroup,
        deleteGroup,
        reorderGroups,
      }}
    >
      {children}
    </EssayArchiveContext.Provider>
  );
}
