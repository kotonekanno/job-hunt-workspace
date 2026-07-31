import { Fragment } from "react";

type HighlightedEssayTextProps = {
  text: string;
  query: string;
};

export function HighlightedEssayText({
  text,
  query,
}: HighlightedEssayTextProps) {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (!normalizedQuery) {
    return text;
  }

  const normalizedText = text.toLocaleLowerCase();
  const parts: Array<{
    text: string;
    highlighted: boolean;
    offset: number;
  }> = [];
  let cursor = 0;
  let matchIndex = normalizedText.indexOf(normalizedQuery);

  while (matchIndex !== -1) {
    if (matchIndex > cursor) {
      parts.push({
        text: text.slice(cursor, matchIndex),
        highlighted: false,
        offset: cursor,
      });
    }

    const matchEnd = matchIndex + normalizedQuery.length;
    parts.push({
      text: text.slice(matchIndex, matchEnd),
      highlighted: true,
      offset: matchIndex,
    });
    cursor = matchEnd;
    matchIndex = normalizedText.indexOf(normalizedQuery, cursor);
  }

  if (cursor < text.length) {
    parts.push({
      text: text.slice(cursor),
      highlighted: false,
      offset: cursor,
    });
  }

  return parts.map((part) => (
    <Fragment key={`${part.offset}-${part.highlighted}`}>
      {part.highlighted ? (
        <mark className="bg-yellow-300/70 text-stone-900 shadow-[inset_0_-1px_0_rgb(202_138_4_/_80%)]">
          {part.text}
        </mark>
      ) : part.text}
    </Fragment>
  ));
}
