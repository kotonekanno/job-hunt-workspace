import { Building2, CalendarDays, FilePenLine, ListTodo } from 'lucide-react';
import { useCalendar } from '@/features/calendar/hooks/useCalendar';
import { toDateKey } from '@/features/calendar/lib/calendar';
import {
  getEventEndDate,
  getEventStartDate,
} from '@/features/calendar/lib/eventTime';
import { RequestStatus } from '@/shared/RequestStatus';
import { getEventSortKey } from '@/features/calendar/lib/eventTime';
import { EventListItem } from '@/features/calendar/ui/EventListItem';
import { useCompanyList } from '@/features/companies/hooks/useCompanyList';
import { CompanyListCard } from '@/features/companies/ui/list/CompanyListCard';
import { useEssayArchive } from '@/features/essay/hooks/useEssayArchive';
import { DashboardCard } from '@/features/home/ui/DashboardCard';
import { HomeOverviewHeader } from '@/features/home/ui/HomeOverviewHeader';
import { HomeResourceLinks } from '@/features/home/ui/HomeResourceLinks';
import { useTasks } from '@/features/task/hooks/useTasks';
import { TaskList } from '@/features/task/ui/TaskList';

const summaryItems = (
  activeCompanyCount: number,
  pendingTaskCount: number,
  eventCount: number,
  essayCount: number,
) => [
  {
    label: '管理中の企業',
    value: activeCompanyCount,
    unit: '社',
    icon: Building2,
    to: '/companies',
  },
  {
    label: '未完了タスク',
    value: pendingTaskCount,
    unit: '件',
    icon: ListTodo,
    to: '/tasks',
  },
  {
    label: '今月の残りの予定',
    value: eventCount,
    unit: '件',
    icon: CalendarDays,
    to: '/calendar',
  },
  {
    label: 'ESストック',
    value: essayCount,
    unit: '件',
    icon: FilePenLine,
    to: '/essays',
  },
];

export function HomeDashboard() {
  const companyList = useCompanyList();
  const calendar = useCalendar();
  const archive = useEssayArchive();
  const today = toDateKey(new Date());
  const upcomingEvents = calendar.upcomingEvents
    .filter(
      (event) =>
        getEventEndDate(event) >= today &&
        getEventStartDate(event).slice(0, 7) <= today.slice(0, 7),
    )
    .sort((a, b) => getEventSortKey(a).localeCompare(getEventSortKey(b)));
  const taskArchive = useTasks();
  const pendingTasks = taskArchive.tasks
    .filter((task) => !task.done)
    .sort((first, second) =>
      (first.deadline ?? '\uffff').localeCompare(second.deadline ?? '\uffff'),
    )
    .slice(0, 4);

  return (
    <div className="space-y-5">
      <HomeOverviewHeader
        date={today}
        items={summaryItems(
          companyList.allCompanies.filter((company) => company.priority !== 7)
            .length,
          taskArchive.tasks.filter((task) => !task.done).length,
          upcomingEvents.length,
          archive.groups.reduce((sum, group) => sum + group.quantity, 0),
        )}
      />

      <RequestStatus
        isLoading={
          companyList.isLoading ||
          taskArchive.isLoading ||
          calendar.isLoading ||
          archive.isLoading
        }
        error={
          companyList.error ||
          taskArchive.error ||
          calendar.error ||
          archive.error
        }
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
            {companyList.companies
              .filter((company) => company.priority === 1)
              .map((company) => (
                <CompanyListCard
                  key={company.id}
                  company={company}
                  onSelectionResultChange={companyList.updateSelectionResult}
                />
              ))}
          </div>
        </DashboardCard>

        <DashboardCard
          title="直近の予定（今月）"
          label="UPCOMING EVENTS"
          to="/calendar"
          linkText="カレンダー"
        >
          <div className="space-y-2">
            {upcomingEvents.slice(0, 3).map((event) => (
              <EventListItem key={event.id} event={event} />
            ))}
          </div>
        </DashboardCard>

        <HomeResourceLinks />
      </div>
    </div>
  );
}
