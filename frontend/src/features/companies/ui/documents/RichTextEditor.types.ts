import type { JSONContent } from "@tiptap/core";

export type RichTextEditorProps = {
  value: JSONContent | null;
  onChange: (value: JSONContent) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  minHeight?: number;
  className?: string;
};
