import {
  Building2,
  CalendarDays,
  CheckCircle2,
  FilePenLine,
  ListTodo,
} from "lucide-react";
import { calendarEvents } from "@/features/calendar/model/calendar";
import { EventListItem } from "@/features/calendar/ui/EventListItem";
import { initialCompanyList } from "@/features/companies/model/companyList";
import { CompanyListCard } from "@/features/companies/ui/list/CompanyListCard";
import { initialEssays } from "@/features/essay/model/essay";
import { DashboardCard } from "@/features/home/ui/DashboardCard";
import { HomeOverviewHeader } from "@/features/home/ui/HomeOverviewHeader";
import { useTasks } from "@/features/task/hooks/useTasks";
import { initialTasks } from "@/features/task/model/task";
import { TaskList } from "@/features/task/ui/TaskList";

const today = "2026-07-12";

const upcomingEvents = calendarEvents
  .filter((event) => event.date >= today)
  .sort((first, second) => (
    `${first.date}${first.time}`.localeCompare(`${second.date}${second.time}`)
  ))
  .slice(0, 3);

const activeCompanies = initialCompanyList.filter(
  (company) => company.priority !== 6,
);

const summaryItems = [
  {
    label: "管理中の企業",
    value: activeCompanies.length,
    unit: "社",
    icon: Building2,
    to: "/companies",
  },
  {
    label: "未完了タスク",
    value: initialTasks.filter((task) => !task.completed).length,
    unit: "件",
    icon: ListTodo,
    to: "/tasks",
  },
  {
    label: "今後の予定",
    value: calendarEvents.filter((event) => event.date >= today).length,
    unit: "件",
    icon: CalendarDays,
    to: "/calendar",
  },
  {
    label: "ESストック",
    value: initialEssays.length,
    unit: "件",
    icon: FilePenLine,
    to: "/essays",
  },
];

export function HomeDashboard() {
  const taskArchive = useTasks();
  const pendingTasks = taskArchive.tasks
    .filter((task) => !task.completed)
    .sort((first, second) => first.dueDate.localeCompare(second.dueDate))
    .slice(0, 4);

  return (
    <div className="space-y-5">
      <HomeOverviewHeader
        date={today}
        items={summaryItems}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <DashboardCard
          title="優先タスク"
          label="NEXT TASKS"
          to="/tasks"
          linkText="タスク一覧"
        >
          <TaskList
            tasks={pendingTasks}
            canReorder={false}
            showReorder={false}
            showActions={false}
            onToggle={taskArchive.toggleTask}
          />
        </DashboardCard>

        <DashboardCard
          title="注目している企業"
          label="TOP PRIORITY"
          to="/companies"
          linkText="企業一覧"
        >
          <div className="grid gap-2">
            {initialCompanyList
              .filter((company) => company.priority === 1)
              .map((company) => (
                <CompanyListCard
                  key={company.id}
                  company={company}
                  showDelete={false}
                />
              ))}
          </div>
        </DashboardCard>

        <DashboardCard
          title="直近の予定"
          label="UPCOMING EVENTS"
          to="/calendar"
          linkText="カレンダー"
        >
          <div className="space-y-2">
            {upcomingEvents.map((event) => (
              <EventListItem
                key={event.id}
                event={event}
              />
            ))}
          </div>
        </DashboardCard>

        <DashboardCard
          title="ES文章ストック"
          label="ESSAY ARCHIVE"
          to="/essays"
          linkText="文章を探す"
        >
          <div className="flex items-center gap-5">
            <div className="flex size-20 shrink-0 flex-col items-center justify-center border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]">
              <FilePenLine className="size-5" />
              <span className="mt-1 text-xl font-black">
                {initialEssays.length}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[var(--text-strong)]">
                蓄積した文章を再利用
              </p>
              <p className="mt-1.5 text-[10px] leading-5 text-[var(--muted)]">
                設問や本文、質問の性質から過去の回答を横断検索できます。
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[9px] font-bold text-emerald-600">
                <CheckCircle2 className="size-3.5" />
                {new Set(initialEssays.flatMap((essay) => essay.traits)).size}カテゴリを登録済み
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
