import type { RichTextEditorProps } from "@/features/companies/ui/documents/RichTextEditor.types";
import { SimpleRichTextEditor } from "@/features/companies/ui/documents/SimpleRichTextEditor";

export function RichTextEditor(props: RichTextEditorProps) {
  return <SimpleRichTextEditor {...props} />;
}

export type { RichTextEditorProps };
