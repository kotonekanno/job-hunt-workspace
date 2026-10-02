import {
  Building2,
  CalendarDays,
  FilePenLine,
  ListTodo,
} from "lucide-react";
import { calendarEvents } from "@/features/calendar/model/calendar";
import { getEventSortKey } from "@/features/calendar/lib/eventTime";
import { EventListItem } from "@/features/calendar/ui/EventListItem";
import { initialCompanyList } from "@/features/companies/model/companyList";
import { CompanyListCard } from "@/features/companies/ui/list/CompanyListCard";
import { initialEssays } from "@/features/essay/model/essay";
import { DashboardCard } from "@/features/home/ui/DashboardCard";
import { HomeOverviewHeader } from "@/features/home/ui/HomeOverviewHeader";
import { HomeResourceLinks } from "@/features/home/ui/HomeResourceLinks";
import { useTasks } from "@/features/task/hooks/useTasks";
import { initialTasks } from "@/features/task/model/task";
import { TaskList } from "@/features/task/ui/TaskList";

const today = "2026-07-12";

const upcomingEvents = calendarEvents
  .filter((event) => event.startDate >= today)
  .sort((first, second) => (
    getEventSortKey(first).localeCompare(getEventSortKey(second))
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
    value: calendarEvents.filter((event) => event.startDate >= today).length,
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
    .sort((first, second) => (first.dueDate ?? "\uffff").localeCompare(
      second.dueDate ?? "\uffff",
    ))
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

        <HomeResourceLinks />
      </div>
    </div>
  );
}
