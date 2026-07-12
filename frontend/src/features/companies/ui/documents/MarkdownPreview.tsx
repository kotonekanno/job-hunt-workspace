type MarkdownPreviewProps = {
  content: string;
};

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const lines = content.split("\n");

  return (
    <div className="space-y-2 text-sm leading-7 text-[var(--text)]">
      {lines.map((line, index) => {
        if (line.startsWith("# ")) {
          return (
            <h1 key={index} className="border-b border-[var(--line)] pb-3 text-2xl font-black text-[var(--text-strong)]">
              {line.slice(2)}
            </h1>
          );
        }

        if (line.startsWith("## ")) {
          return (
            <h2 key={index} className="pt-4 text-base font-bold text-[var(--accent)]">
              {line.slice(3)}
            </h2>
          );
        }

        if (line.startsWith("- ")) {
          return (
            <p key={index} className="border-l-2 border-[var(--accent)] pl-3">
              {line.slice(2)}
            </p>
          );
        }

        return line ? <p key={index}>{line}</p> : <div key={index} className="h-2" />;
      })}
    </div>
  );
}
