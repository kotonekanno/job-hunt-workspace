import type { Editor, JSONContent } from "@tiptap/core";
import Placeholder from "@tiptap/extension-placeholder";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { RichTextEditorProps } from "@/features/companies/ui/documents/RichTextEditor.types";
import { RichTextShortcuts } from "@/features/companies/ui/documents/RichTextShortcuts";
import { SimpleEditorToolbar } from "@/features/companies/ui/documents/SimpleEditorToolbar";

const emptyDocument: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
};

export function SimpleRichTextEditor({
  value,
  onChange,
  placeholder = "本文を入力してください",
  disabled = false,
  readOnly = false,
  minHeight = 480,
  className = "",
}: RichTextEditorProps) {
  const [isLinkEditing, setIsLinkEditing] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const lastEmittedValue = useRef<JSONContent | null>(null);

  const openLinkEditor = useCallback((currentEditor: Editor) => {
    if (disabled || readOnly) {
      return;
    }

    setLinkValue(currentEditor.getAttributes("link").href ?? "");
    setIsLinkEditing(true);
  }, [disabled, readOnly]);

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        link: {
          openOnClick: readOnly,
          enableClickSelection: true,
          autolink: true,
          linkOnPaste: true,
          defaultProtocol: "https",
          HTMLAttributes: {
            rel: "noopener noreferrer",
            target: "_blank",
          },
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
        a11y: {
          checkboxLabel: (node, checked) =>
            `${node.textContent || "チェック項目"}を${checked ? "未完了" : "完了"}にする`,
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      RichTextShortcuts.configure({
        onOpenLink: openLinkEditor,
      }),
    ],
    [openLinkEditor, placeholder, readOnly],
  );

  const editor = useEditor(
    {
      extensions,
      content: value ?? emptyDocument,
      editable: !disabled && !readOnly,
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      editorProps: {
        attributes: {
          autocomplete: "off",
          autocorrect: "off",
          autocapitalize: "off",
          class: "tiptap-editor-content simple-tiptap-content",
          role: "textbox",
          "aria-label": readOnly ? "文書本文" : "文書本文を編集",
          "aria-multiline": "true",
        },
      },
      onUpdate: ({ editor: currentEditor }) => {
        const nextValue = currentEditor.getJSON();
        lastEmittedValue.current = nextValue;
        onChange(nextValue);
      },
    },
    [extensions],
  );

  useEffect(() => {
    editor?.setEditable(!disabled && !readOnly);
  }, [disabled, editor, readOnly]);

  useEffect(() => {
    if (!editor || value === lastEmittedValue.current) {
      return;
    }

    editor.commands.setContent(value ?? emptyDocument, {
      emitUpdate: false,
    });
  }, [editor, value]);

  function applyLink() {
    if (!editor) {
      return;
    }

    const href = linkValue.trim();

    if (href) {
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }

    setIsLinkEditing(false);
  }

  function removeLink() {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkValue("");
    setIsLinkEditing(false);
  }

  if (!editor) {
    return (
      <div
        className={`
          border border-[var(--line)] bg-[var(--panel)]
          ${className}
        `}
        style={{ minHeight }}
        aria-busy="true"
      />
    );
  }

  const editorStyle = {
    "--editor-min-height": `${minHeight}px`,
  } as CSSProperties;

  return (
    <div
      className={`
        simple-rich-text-editor overflow-visible
        border border-[var(--line)] bg-[var(--panel)]
        text-[var(--text)] shadow-[0_10px_30px_var(--shadow)]
        transition-[border-color,box-shadow]
        focus-within:border-[var(--line-strong)]
        focus-within:shadow-[0_12px_36px_var(--shadow)]
        ${disabled ? "opacity-55" : ""}
        ${readOnly ? "tiptap-editor-readonly shadow-none focus-within:border-[var(--line)] focus-within:shadow-none" : ""}
        ${className}
      `}
      style={editorStyle}
    >
      {!readOnly && !disabled && (
        <div
          className="
            sticky top-16 z-20 border-b border-[var(--line)]
            bg-[var(--panel-raised)]/95 backdrop-blur
          "
        >
          <SimpleEditorToolbar
            editor={editor}
            isLinkEditing={isLinkEditing}
            linkValue={linkValue}
            onLinkValueChange={setLinkValue}
            onOpenLink={() => openLinkEditor(editor)}
            onApplyLink={applyLink}
            onRemoveLink={removeLink}
            onCloseLink={() => setIsLinkEditing(false)}
          />
        </div>
      )}

      <div className="simple-editor-content-shell mx-auto w-full max-w-3xl">
        <EditorContent editor={editor} role="presentation" />
      </div>
    </div>
  );
}
