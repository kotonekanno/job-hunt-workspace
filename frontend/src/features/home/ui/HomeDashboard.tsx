import { PageLoading, PageLoadError } from '@/shared/LoadingState';
import { Building2, CalendarDays, FilePenLine, ListTodo } from 'lucide-react';
import { toCalendarEvent } from '@/features/calendar/lib/calendarApi';
import { toDateKey } from '@/features/calendar/lib/calendar';
import { EventListItem } from '@/features/calendar/ui/EventListItem';
import { HomeCompanyListCard } from './HomeCompanyListCard';
import { DashboardCard } from '@/features/home/ui/DashboardCard';
import { HomeOverviewHeader } from '@/features/home/ui/HomeOverviewHeader';
import { HomeResourceLinks } from '@/features/home/ui/HomeResourceLinks';
import { useDashboard } from '@/features/home/hooks/useDashboard';
import { TaskList } from '@/features/task/ui/TaskList';

export function HomeDashboard() {
  const { dashboard, loading, loadError, toggleTask, updateSelectionResult } =
    useDashboard();
  const today = toDateKey(new Date());
  const upcomingEvents = (dashboard?.events ?? []).map(toCalendarEvent);
  const pendingTasks = (dashboard?.tasks ?? []).filter((task) => !task.done);
  const summaryItems = [
    {
      label: '管理中の企業',
      value: dashboard?.counts.companies ?? 0,
      unit: '社',
      icon: Building2,
      to: '/companies',
    },
    {
      label: '未完了タスク',
      value: dashboard?.counts.undoneTasks ?? 0,
      unit: '件',
      icon: ListTodo,
      to: '/tasks',
    },
    {
      label: '今後の予定',
      value: dashboard?.counts.upcomingEvents ?? 0,
      unit: '件',
      icon: CalendarDays,
      to: '/calendar',
    },
    {
      label: 'ESストック',
      value: dashboard?.counts.essays ?? 0,
      unit: '件',
      icon: FilePenLine,
      to: '/essays',
    },
  ];

  if (loading) return <PageLoading />;
  if (loadError) return <PageLoadError />;

  return (
    <div className="space-y-5">
      <HomeOverviewHeader date={today} items={summaryItems} />

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
            onToggle={toggleTask}
          />
        </DashboardCard>

        <DashboardCard
          title="注目している企業"
          label="TOP PRIORITY"
          to="/companies"
          linkText="企業一覧"
        >
          <div className="grid gap-2">
            {(dashboard?.companies ?? []).map((company) => (
              <HomeCompanyListCard
                key={company.id}
                company={company}
                onSelectionResultChange={updateSelectionResult}
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
              <EventListItem key={event.id} event={event} />
            ))}
          </div>
        </DashboardCard>

        <HomeResourceLinks />
      </div>
    </div>
  );
}
