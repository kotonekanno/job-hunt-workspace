type CompanyBadgeProps = {
  company: string;
  className?: string;
};

export function CompanyBadge({
  company,
  className = "",
}: CompanyBadgeProps) {
  return (
    <span
      className={`truncate border border-[var(--line)] bg-[var(--panel-raised)] px-1.5 py-1 text-center text-[9px] text-[var(--muted)] ${className}`}
    >
      {company}
    </span>
  );
}
