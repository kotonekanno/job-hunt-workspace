import { EditDeleteMenu } from '@/shared/EditDeleteMenu';

import { useState, type KeyboardEvent, type ReactNode } from 'react';
import { InlineEditActions } from '@/shared/InlineEditActions';

type InlineRecordRowProps = {
  label: string;
  value: string;
  isNew?: boolean;
  labelName: string;
  valueName: string;
  renderValue?: (value: string) => ReactNode;
  onSave: (label: string, value: string) => void;
  onCancelNew: () => void;
  onDelete: () => void;
};

function renderLinkedValue(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' || url.protocol === 'http:') {
      return (
        <a
          href={url.href}
          target="_blank"
          rel="noopener noreferrer"
          className="block cursor-pointer truncate text-[var(--accent)] hover:underline"
          title={value}
        >
          {value}
        </a>
      );
    }
  } catch {
    /* Plain text remains plain text. */
  }
  return value;
}

export function InlineRecordRow(props: InlineRecordRowProps) {
  const [isEditing, setIsEditing] = useState(Boolean(props.isNew));
  const [label, setLabel] = useState(props.label);
  const [value, setValue] = useState(props.value);
  const canSave = Boolean(label.trim() && value.trim());

  function startEditing() {
    setLabel(props.label);
    setValue(props.value);
    setIsEditing(true);
  }

  function save() {
    if (!canSave) return;
    props.onSave(label.trim(), value.trim());
    setIsEditing(false);
  }

  function cancel() {
    if (props.isNew) props.onCancelNew();
    setIsEditing(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      save();
    }
  }

  const fieldClassName =
    'block h-8 w-full min-w-0 rounded-none border border-transparent px-1 py-0 leading-[30px]';
  return (
    <tr className="h-12 border-b border-[var(--line)]">
      <th
        scope="row"
        className="overflow-hidden py-2 pr-2 text-left align-middle text-xs font-normal text-[var(--faint)]"
      >
        {isEditing ? (
          <input
            autoFocus
            aria-label={props.labelName}
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            onKeyDown={onKeyDown}
            className={`${fieldClassName} border-b-[var(--accent)] bg-[var(--panel-raised)] outline-none`}
          />
        ) : (
          <span title={props.label} className={`${fieldClassName} truncate`}>
            {props.label}
          </span>
        )}
      </th>
      <td className="overflow-hidden py-2 pr-2 align-middle text-sm font-medium text-[var(--text-strong)]">
        {isEditing ? (
          <input
            aria-label={props.valueName}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            className={`${fieldClassName} border-b-[var(--accent)] bg-[var(--panel-raised)] outline-none`}
          />
        ) : (
          <div title={props.value} className={`${fieldClassName} truncate`}>
            {props.renderValue
              ? props.renderValue(props.value)
              : renderLinkedValue(props.value)}
          </div>
        )}
      </td>
      <td className="py-2 align-middle">
        <div className="flex h-8 w-[72px] items-center justify-end gap-2">
          {isEditing ? (
            <InlineEditActions
              saveLabel="レコードを保存"
              cancelLabel="レコードの編集をキャンセル"
              disabled={!canSave}
              onSave={save}
              onCancel={cancel}
            />
          ) : (
            <EditDeleteMenu
              label={props.label}
              onEdit={startEditing}
              onDelete={props.onDelete}
            />
          )}
        </div>
      </td>
    </tr>
  );
}
