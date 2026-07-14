import { useState, type MouseEvent } from "react";
import type { CalendarEvent } from "@/features/calendar/model/calendar";
import { DeleteIconButton } from "@/shared/button";
import { DeleteDialog } from "@/shared/dialog";
import type { Size } from "@/shared/shared-type";

type EventDeleteButtonProps = {
  event: CalendarEvent;
  size: Size;
  onDelete: (eventId: number) => void;
  stopPropagation?: boolean;
};

export function EventDeleteButton({
  event,
  size,
  onDelete,
  stopPropagation = false,
}: EventDeleteButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function openDialog(clickEvent: MouseEvent<HTMLButtonElement>) {
    if (stopPropagation) {
      clickEvent.preventDefault();
      clickEvent.stopPropagation();
    }

    setIsDialogOpen(true);
  }

  return (
    <>
      <DeleteIconButton
        size={size}
        transparent={false}
        ariaLabel={`${event.title}を削除`}
        onClick={openDialog}
      />

      {isDialogOpen && (
        <DeleteDialog
          title="予定を削除しますか？"
          text={`「${event.title}」を削除します。この操作は取り消せません。`}
          onClose={() => setIsDialogOpen(false)}
          onConfirm={() => {
            onDelete(event.id);
            setIsDialogOpen(false);
          }}
        />
      )}
    </>
  );
}
