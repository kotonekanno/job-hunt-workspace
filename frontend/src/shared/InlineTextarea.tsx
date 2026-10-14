import type { TextareaHTMLAttributes } from 'react';

type InlineTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  initialHeight: number;
};

export function InlineTextarea({
  initialHeight,
  onChange,
  style,
  ...props
}: InlineTextareaProps) {
  return (
    <textarea
      {...props}
      style={{ ...style, height: initialHeight }}
      onChange={(event) => {
        const input = event.currentTarget;
        input.style.height = '0px';
        const border = input.offsetHeight - input.clientHeight;
        input.style.height = `${Math.max(initialHeight, input.scrollHeight + border)}px`;
        onChange?.(event);
      }}
    />
  );
}
