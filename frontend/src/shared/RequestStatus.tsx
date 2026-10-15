export function RequestStatus({
  isLoading,
  error,
}: {
  isLoading?: boolean;
  error?: string;
}) {
  return (
    <>
      {isLoading && (
        <p role="status" className="my-3 text-sm text-[var(--muted)]">
          読み込み中…
        </p>
      )}
      {error && (
        <p role="alert" className="my-3 text-sm text-rose-500">
          {error}
        </p>
      )}
    </>
  );
}
