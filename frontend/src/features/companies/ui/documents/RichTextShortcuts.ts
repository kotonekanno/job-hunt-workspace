import { Extension, type Editor } from "@tiptap/core";

type RichTextShortcutsOptions = {
  onOpenLink: (editor: Editor) => void;
};

function isMacPlatform() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
}

export const RichTextShortcuts = Extension.create<RichTextShortcutsOptions>({
  name: "richTextShortcuts",

  addOptions() {
    return {
      onOpenLink: () => undefined,
    };
  },

  addKeyboardShortcuts() {
    const blockShortcut = isMacPlatform() ? "Mod-Alt" : "Ctrl-Shift";

    return {
      "Mod-k": () => {
        this.options.onOpenLink(this.editor);
        return true;
      },
      [`${blockShortcut}-0`]: () =>
        this.editor.chain().focus().setParagraph().run(),
      [`${blockShortcut}-1`]: () =>
        this.editor.chain().focus().toggleHeading({ level: 1 }).run(),
      [`${blockShortcut}-2`]: () =>
        this.editor.chain().focus().toggleHeading({ level: 2 }).run(),
      [`${blockShortcut}-3`]: () =>
        this.editor.chain().focus().toggleHeading({ level: 3 }).run(),
      [`${blockShortcut}-4`]: () =>
        this.editor.chain().focus().toggleTaskList().run(),
      [`${blockShortcut}-5`]: () =>
        this.editor.chain().focus().toggleBulletList().run(),
      [`${blockShortcut}-6`]: () =>
        this.editor.chain().focus().toggleOrderedList().run(),
      [`${blockShortcut}-8`]: () =>
        this.editor.chain().focus().toggleCodeBlock().run(),
    };
  },
});
