import { InnerHeader } from "@/shared/header";
import { Bell, Eye, LayoutDashboard, SlidersHorizontal } from "lucide-react";

const settingGroups = [
  {
    title: "表示設定",
    description: "一覧画面に表示する情報量を調整します。",
    icon: Eye,
    options: ["コンパクト表示を使用する", "完了済み項目を薄く表示する"],
  },
  {
    title: "ホーム画面",
    description: "ダッシュボードに表示する内容を選択します。",
    icon: LayoutDashboard,
    options: ["直近の予定を表示する", "優先タスクを表示する"],
  },
  {
    title: "通知設定",
    description: "期限や予定に関する通知を管理します。",
    icon: Bell,
    options: ["予定の前日に通知する", "タスク期限の当日に通知する"],
  },
];

export function AppSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <InnerHeader
        title="アプリ内設定"
        subTitle="APPLICATION_CONFIG"
        description="画面表示や通知など、アプリ内の動作を設定します。"
        icon={<SlidersHorizontal className="size-5 text-[var(--accent)]" />}
      />

      <div className="mt-8 space-y-3">
        {settingGroups.map(({ title, description, icon: Icon, options }) => (
          <section
            key={title}
            className="cyber-cut border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[0_5px_18px_var(--shadow)] sm:p-6"
          >
            <div className="flex items-start gap-3 border-b border-[var(--line)] pb-4">
              <span className="flex size-9 shrink-0 items-center justify-center bg-[var(--accent-soft)] text-[var(--accent)]">
                <Icon className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-black text-[var(--text-strong)]">
                  {title}
                </h2>
                <p className="mt-1 text-[10px] text-[var(--muted)]">
                  {description}
                </p>
              </div>
            </div>

            <div className="mt-2 divide-y divide-[var(--line)]">
              {options.map((option, index) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center justify-between gap-4 py-3 text-xs font-semibold text-[var(--text)]"
                >
                  {option}
                  <input
                    type="checkbox"
                    defaultChecked={index === 0}
                    className="size-4 cursor-pointer accent-[var(--accent)]"
                  />
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
