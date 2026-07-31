
export type SelectionStatus =
  | "not_started" // 未受験
  | "pending"     // 結果待ち
  | "passed"      // 合格
  | "failed";     // 不合格

export type SelectionStep = {
  id: number;
  stepNo: number;
  title: string;
  heldAt: string;
  note: string;
  status: SelectionStatus;
};

export type Selection = {
  id: number;
  title: string;
  isActive: boolean;
  steps: SelectionStep[];
};

export type currentSelection = {
  title: string;
  step: string;
  status: SelectionStatus;
}