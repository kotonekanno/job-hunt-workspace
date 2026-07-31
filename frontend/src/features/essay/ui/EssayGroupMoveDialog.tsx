import { ArrowRight } from "lucide-react";
import { useId } from "react";
import {
  DialogActions,
  DialogBase,
  DialogHeader,
} from "@/shared/dialog";

type EssayGroupMoveDialogProps = {
  currentGroupName: string;
  nextGroupName: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function EssayGroupMoveDialog({
  currentGroupName,
  nextGroupName,
  onClose,
  onConfirm,
}: EssayGroupMoveDialogProps) {
  const titleId = useId();

  return (
    <DialogBase onClose={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="cyber-cut w-full max-w-md border border-[var(--line-strong)] bg-[var(--panel)] p-6 shadow-[0_20px_60px_var(--shadow)]"
      >
        <DialogHeader
          title="ジャンルを移動しますか？"
          titleId={titleId}
          onClose={onClose}
          subTitle="MOVE ESSAY"
        />

        <div className="mt-5 flex items-center gap-3 border border-[var(--line)] bg-[var(--panel-raised)] p-4">
          <span className="min-w-0 flex-1 truncate text-center text-xs font-bold text-[var(--muted)]">
            {currentGroupName}
          </span>
          <ArrowRight className="size-4 shrink-0 text-[var(--accent)]" />
          <span className="min-w-0 flex-1 truncate text-center text-xs font-bold text-[var(--text-strong)]">
            {nextGroupName}
          </span>
        </div>

        <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
          このESは現在の一覧から移動し、選択したジャンルに表示されます。
        </p>

        <DialogActions
          onClose={onClose}
          onConfirm={onConfirm}
          confirmText="移動する"
        />
      </div>
    </DialogBase>
  );
}
