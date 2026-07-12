import { useState } from "react";
import { useCompanyList } from "@/features/companies/hooks/useCompanyList";
import { CompanyCreateDialog } from "@/features/companies/ui/list/CompanyCreateDialog";
import { CompanyListToolbar } from "@/features/companies/ui/list/CompanyListToolbar";
import { CompanyPriorityBoard } from "@/features/companies/ui/list/CompanyPriorityBoard";
import { InnerHeader } from "@/shared/header";
import { Building2 } from "lucide-react";

export function CompanyListPage() {
  const companyList = useCompanyList();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <InnerHeader
        title="企業管理"
        subTitle="COMPANY LIST"
        icon={<Building2 className="size-5 text-[var(--accent)]" />}
      />

      <div className="mt-4">
        <CompanyListToolbar
          query={companyList.query}
          progress={companyList.progress}
          onQueryChange={companyList.setQuery}
          onProgressChange={companyList.setProgress}
          onAdd={() => setIsDialogOpen(true)}
        />
      </div>

      <div className="mt-5">
        <CompanyPriorityBoard
          companies={companyList.companies}
          onEventChange={companyList.updateNextEvent}
        />
      </div>

      {isDialogOpen && (
        <CompanyCreateDialog
          onClose={() => setIsDialogOpen(false)}
          onSave={companyList.addCompany}
        />
      )}
    </div>
  );
}
