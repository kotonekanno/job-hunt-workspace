import type { Editor } from "@tiptap/core";
import {
  ArrowLeft,
  Bold,
  Check,
  ChevronDown,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  ListTree,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  SquareCode,
  Strikethrough,
  Trash2,
  Underline,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { useEditorState } from "@tiptap/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Tooltip } from "@/shared/tooltip";

type SimpleEditorToolbarProps = {
  editor: Editor;
  isLinkEditing: boolean;
  linkValue: string;
  onLinkValueChange: (value: string) => void;
  onOpenLink: () => void;
  onApplyLink: () => void;
  onRemoveLink: () => void;
  onCloseLink: () => void;
};

type ToolbarButtonProps = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

type DropdownOption = {
  label: string;
  icon: LucideIcon;
  active: boolean;
  onSelect: () => void;
};

type ToolbarDropdownProps = {
  label: string;
  icon: LucideIcon;
  active: boolean;
  options: DropdownOption[];
};

const dropdownWidth = 184;
const viewportPadding = 8;

function ToolbarButton({
  label,
  icon: Icon,
  active = false,
  disabled = false,
  onClick,
}: ToolbarButtonProps) {
  return (
    <Tooltip content={label} side="bottom">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        aria-pressed={active}
        className={`
          simple-editor-toolbar-button inline-flex size-8 shrink-0
          cursor-pointer items-center justify-center
          border border-transparent transition-colors
          focus-visible:outline-2 focus-visible:outline-offset-1
          focus-visible:outline-[var(--accent)]
          disabled:cursor-not-allowed disabled:opacity-35
          ${
            active
              ? "bg-[var(--accent-soft)] text-[var(--accent)]"
              : "text-[var(--muted)] hover:bg-[var(--panel)] hover:text-[var(--text-strong)]"
          }
        `}
      >
        <Icon className="size-4" aria-hidden="true" />
      </button>
    </Tooltip>
  );
}

function ToolbarDropdown({
  label,
  icon: Icon,
  active,
  options,
}: ToolbarDropdownProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;

    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const maximumLeft =
      window.innerWidth - dropdownWidth - viewportPadding;

    setPosition({
      left: Math.min(Math.max(rect.left, viewportPadding), maximumLeft),
      top: rect.bottom + 6,
    });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeOnOutsidePointer(event: PointerEvent) {
      const target = event.target as Node;

      if (
        !triggerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
    };
  }, [isOpen]);

  return (
    <>
      <Tooltip content={label} side="bottom">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-label={label}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          className={`
            inline-flex h-8 shrink-0 cursor-pointer items-center gap-1
            border border-transparent px-2 transition-colors
            focus-visible:outline-2 focus-visible:outline-offset-1
            focus-visible:outline-[var(--accent)]
            ${
              active || isOpen
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "text-[var(--muted)] hover:bg-[var(--panel)] hover:text-[var(--text-strong)]"
            }
          `}
        >
          <Icon className="size-4" aria-hidden="true" />
          <ChevronDown
            className={`size-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      </Tooltip>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              left: position.left,
              top: position.top,
              width: dropdownWidth,
            }}
            className="
              fixed z-[100] border border-[var(--line)]
              bg-[var(--panel)] p-1.5 shadow-[0_14px_36px_var(--shadow)]
            "
          >
            {options.map((option) => {
              const OptionIcon = option.icon;

              return (
                <button
                  key={option.label}
                  type="button"
                  role="menuitemradio"
                  aria-checked={option.active}
                  onClick={() => {
                    option.onSelect();
                    setIsOpen(false);
                  }}
                  className={`
                    flex w-full cursor-pointer items-center gap-2.5
                    px-2.5 py-2 text-left text-xs transition-colors
                    ${
                      option.active
                        ? "bg-[var(--accent-soft)] font-semibold text-[var(--accent)]"
                        : "text-[var(--text)] hover:bg-[var(--panel-raised)]"
                    }
                  `}
                >
                  <OptionIcon className="size-4 shrink-0" aria-hidden="true" />
                  {option.label}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}

function ToolbarSeparator() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-[var(--line)]" />;
}

function LinkToolbar({
  editor,
  linkValue,
  onLinkValueChange,
  onApplyLink,
  onRemoveLink,
  onCloseLink,
}: Omit<
  SimpleEditorToolbarProps,
  "isLinkEditing" | "onOpenLink"
>) {
  return (
    <div className="flex min-w-full items-center gap-2 px-2 py-1.5">
      <ToolbarButton
        label="通常のツールバーへ戻る"
        icon={ArrowLeft}
        onClick={onCloseLink}
      />

      <ToolbarSeparator />
      <Link2 className="ml-1 size-4 shrink-0 text-[var(--accent)]" />

      <input
        type="url"
        value={linkValue}
        onChange={(event) => onLinkValueChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onApplyLink();
          }

          if (event.key === "Escape") {
            onCloseLink();
          }
        }}
        placeholder="https://example.com"
        aria-label="リンク先URL"
        autoFocus
        className="
          h-8 min-w-44 flex-1 border border-[var(--line)]
          bg-[var(--panel)] px-3 text-xs text-[var(--text-strong)]
          outline-none placeholder:text-[var(--faint)]
          focus:border-[var(--accent)]
        "
      />

      <ToolbarButton
        label="リンクを適用"
        icon={Check}
        onClick={onApplyLink}
      />

      {editor.isActive("link") && (
        <ToolbarButton
          label="リンクを解除"
          icon={Trash2}
          onClick={onRemoveLink}
        />
      )}
    </div>
  );
}

export function SimpleEditorToolbar({
  editor,
  isLinkEditing,
  linkValue,
  onLinkValueChange,
  onOpenLink,
  onApplyLink,
  onRemoveLink,
  onCloseLink,
}: SimpleEditorToolbarProps) {
  const state = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      paragraph: currentEditor.isActive("paragraph"),
      heading1: currentEditor.isActive("heading", { level: 1 }),
      heading2: currentEditor.isActive("heading", { level: 2 }),
      heading3: currentEditor.isActive("heading", { level: 3 }),
      bulletList: currentEditor.isActive("bulletList"),
      orderedList: currentEditor.isActive("orderedList"),
      taskList: currentEditor.isActive("taskList"),
      blockquote: currentEditor.isActive("blockquote"),
      codeBlock: currentEditor.isActive("codeBlock"),
      bold: currentEditor.isActive("bold"),
      italic: currentEditor.isActive("italic"),
      underline: currentEditor.isActive("underline"),
      strike: currentEditor.isActive("strike"),
      code: currentEditor.isActive("code"),
      link: currentEditor.isActive("link"),
      canUndo: currentEditor.can().chain().focus().undo().run(),
      canRedo: currentEditor.can().chain().focus().redo().run(),
    }),
  });

  if (isLinkEditing) {
    return (
      <LinkToolbar
        editor={editor}
        linkValue={linkValue}
        onLinkValueChange={onLinkValueChange}
        onApplyLink={onApplyLink}
        onRemoveLink={onRemoveLink}
        onCloseLink={onCloseLink}
      />
    );
  }

  const headingOptions: DropdownOption[] = [
    {
      label: "段落",
      icon: Pilcrow,
      active: state.paragraph,
      onSelect: () => editor.chain().focus().setParagraph().run(),
    },
    {
      label: "見出し1",
      icon: Heading1,
      active: state.heading1,
      onSelect: () =>
        editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: "見出し2",
      icon: Heading2,
      active: state.heading2,
      onSelect: () =>
        editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "見出し3",
      icon: Heading3,
      active: state.heading3,
      onSelect: () =>
        editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
  ];

  const listOptions: DropdownOption[] = [
    {
      label: "箇条書き",
      icon: List,
      active: state.bulletList,
      onSelect: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "番号付きリスト",
      icon: ListOrdered,
      active: state.orderedList,
      onSelect: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "チェックリスト",
      icon: ListChecks,
      active: state.taskList,
      onSelect: () => editor.chain().focus().toggleTaskList().run(),
    },
  ];

  return (
    <div className="rich-text-toolbar-scroll overflow-x-auto">
      <div className="flex min-w-max items-center px-2 py-1.5">
        <ToolbarButton
          label="元に戻す"
          icon={Undo2}
          disabled={!state.canUndo}
          onClick={() => editor.chain().focus().undo().run()}
        />
        <ToolbarButton
          label="やり直す"
          icon={Redo2}
          disabled={!state.canRedo}
          onClick={() => editor.chain().focus().redo().run()}
        />

        <ToolbarSeparator />

        <ToolbarDropdown
          label="段落スタイル"
          icon={Heading2}
          active={
            state.heading1 ||
            state.heading2 ||
            state.heading3
          }
          options={headingOptions}
        />
        <ToolbarDropdown
          label="リスト"
          icon={ListTree}
          active={
            state.bulletList ||
            state.orderedList ||
            state.taskList
          }
          options={listOptions}
        />
        <ToolbarButton
          label="引用"
          icon={Quote}
          active={state.blockquote}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          label="コードブロック"
          icon={SquareCode}
          active={state.codeBlock}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        />

        <ToolbarSeparator />

        <ToolbarButton
          label="太字（Ctrl/Cmd+B）"
          icon={Bold}
          active={state.bold}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="斜体（Ctrl/Cmd+I）"
          icon={Italic}
          active={state.italic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="下線（Ctrl/Cmd+U）"
          icon={Underline}
          active={state.underline}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          label="取り消し線（Ctrl/Cmd+Shift+S）"
          icon={Strikethrough}
          active={state.strike}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />
        <ToolbarButton
          label="インラインコード（Ctrl/Cmd+E）"
          icon={Code}
          active={state.code}
          onClick={() => editor.chain().focus().toggleCode().run()}
        />
        <ToolbarButton
          label="リンク（Ctrl/Cmd+K）"
          icon={Link2}
          active={state.link}
          onClick={onOpenLink}
        />

        <ToolbarSeparator />

        <ToolbarButton
          label="水平線"
          icon={Minus}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        />
      </div>
    </div>
  );
}
