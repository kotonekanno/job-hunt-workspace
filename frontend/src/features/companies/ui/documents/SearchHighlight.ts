import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import {
  Decoration,
  DecorationSet,
} from "@tiptap/pm/view";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    searchHighlight: {
      setSearchHighlight: (query: string) => ReturnType;
    };
  }
}

type SearchHighlightStorage = {
  query: string;
};

const searchHighlightPluginKey = new PluginKey("searchHighlight");

export const SearchHighlight = Extension.create<
  Record<string, never>,
  SearchHighlightStorage
>({
  name: "searchHighlight",

  addStorage() {
    return {
      query: "",
    };
  },

  addCommands() {
    return {
      setSearchHighlight: (query) => ({ dispatch, tr }) => {
        this.storage.query = query.trim().toLocaleLowerCase();

        if (dispatch) {
          dispatch(tr.setMeta(searchHighlightPluginKey, query));
        }

        return true;
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: searchHighlightPluginKey,
        props: {
          decorations: (state) => {
            const query = this.storage.query;

            if (!query) {
              return DecorationSet.empty;
            }

            const decorations: Decoration[] = [];

            state.doc.descendants((node, position) => {
              if (!node.isText || !node.text) {
                return;
              }

              const text = node.text.toLocaleLowerCase();
              let matchIndex = text.indexOf(query);

              while (matchIndex !== -1) {
                decorations.push(Decoration.inline(
                  position + matchIndex,
                  position + matchIndex + query.length,
                  {
                    class: "document-search-highlight",
                  },
                ));

                matchIndex = text.indexOf(
                  query,
                  matchIndex + query.length,
                );
              }
            });

            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});
