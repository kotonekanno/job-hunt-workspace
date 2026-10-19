import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCheck,
  ClipboardCheck,
  ExternalLink,
  FilePenLine,
  Info,
  NotebookTabs,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Building2,
    title: '企業・選考を整理',
    description:
      '企業情報や選考の進捗、活動履歴をひとつに。企業ごとの情報をまとめて振り返れます。',
  },
  {
    icon: CalendarDays,
    title: '予定を見渡す',
    description:
      '面接や説明会などの予定をカレンダーで確認。次の予定を把握して、準備につなげられます。',
  },
  {
    icon: ClipboardCheck,
    title: 'やることを明確に',
    description:
      '応募準備や提出物をタスクとして管理。期限と優先度を整理して、ひとつずつ進められます。',
  },
  {
    icon: FilePenLine,
    title: 'ES・作文を蓄積',
    description:
      '志望動機や自己PRをグループごとに整理。これまでに書いた内容を、次の応募にも活かせます。',
  },
  {
    icon: NotebookTabs,
    title: 'メモ・資料を残す',
    description:
      '企業研究や面接の振り返りをドキュメントに。就活で得た情報を、自分の記録として残せます。',
  },
];

const primaryLink =
  'ui-control cyber-cut-sm inline-flex min-h-11 items-center justify-center gap-2 border border-[var(--accent)] bg-[var(--accent)] px-6 py-3 text-sm font-bold text-[var(--accent-contrast)] shadow-[0_4px_16px_var(--accent-glow)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]';
const secondaryLink =
  'ui-control inline-flex min-h-11 items-center justify-center gap-2 border border-[var(--line)] bg-[var(--panel-raised)] px-6 py-3 text-sm font-bold text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)]';

export function LandingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-14 px-5 py-10 sm:px-8 sm:py-16">
      <section
        className="ui-panel grid overflow-hidden border border-[var(--line-strong)] md:grid-cols-[1.25fr_0.75fr]"
        aria-labelledby="landing-title"
      >
        <div className="p-6 sm:p-10 lg:p-12">
          <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-[var(--accent)]">
            JOB HUNT WORKSPACE
          </p>
          <h1
            id="landing-title"
            className="mt-5 text-3xl leading-relaxed font-black tracking-tight text-[var(--text-strong)] sm:text-4xl"
          >
            就活の情報を、ひとつに。
            <br />
            次の一歩を、明確に。
          </h1>
          <p className="mt-5 text-sm leading-7 text-[var(--muted)]">
            極・就活管理は、企業・選考・予定・タスク・ESをまとめて管理するワークスペースです。散らばりがちな情報を整理して、日々の準備を進めましょう。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/login" className={primaryLink}>
              ログイン
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link to="/register" className={secondaryLink}>
              新規登録
            </Link>
          </div>
          <p className="mt-4 text-xs leading-6 text-[var(--muted)]">
            デモ用サービスです。ご利用前に
            <a
              href="#demo-notice"
              className="font-bold text-[var(--accent)] underline underline-offset-4"
            >
              注意書き
            </a>
            をご確認ください。
          </p>
        </div>
        <aside
          className="flex flex-col justify-center border-t border-[var(--line)] bg-[var(--accent-soft)] p-6 sm:p-10 md:border-t-0 md:border-l"
          aria-label="使い方の流れ"
        >
          <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-[var(--accent)]">
            PLAN / TRACK / REVIEW
          </p>
          <ol className="mt-7 space-y-7">
            {[
              [
                '01',
                '気になる企業を集める',
                '企業情報と選考状況をひと目で確認。',
              ],
              ['02', '予定とタスクを整える', '次にやることを、日々の行動へ。'],
              ['03', '経験を次に活かす', 'ESや面接の記録を残して振り返る。'],
            ].map(([number, title, description]) => (
              <li key={number} className="flex gap-4">
                <span className="font-mono text-xl font-bold text-[var(--accent)]">
                  {number}
                </span>
                <div>
                  <p className="text-sm font-bold text-[var(--text-strong)]">
                    {title}
                  </p>
                  <p className="mt-2 text-xs leading-6 text-[var(--muted)]">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </section>

      <section aria-labelledby="features-title">
        <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-[var(--accent)]">
          // FEATURES
        </p>
        <h2
          id="features-title"
          className="mt-2 text-2xl font-black text-[var(--text-strong)]"
        >
          就活の流れに沿った、管理機能。
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="ui-panel border border-[var(--line)] p-6"
            >
              <Icon
                aria-hidden="true"
                className="size-6 text-[var(--accent)]"
              />
              <h3 className="mt-4 text-base font-bold text-[var(--text-strong)]">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                {description}
              </p>
            </article>
          ))}
          <div className="flex flex-col justify-center border border-[var(--line)] bg-[var(--accent-soft)] p-6">
            <CheckCheck
              aria-hidden="true"
              className="size-6 text-[var(--accent)]"
            />
            <p className="mt-4 text-base font-bold text-[var(--text-strong)]">
              まずは、使い心地を体験。
            </p>
            <a
              href="#demo-notice"
              className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[var(--accent)] underline underline-offset-4"
            >
              テスト用アカウントを確認
              <ArrowRight aria-hidden="true" className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <section
        id="demo-notice"
        aria-labelledby="demo-title"
        className="ui-panel scroll-mt-24 border border-[var(--line-strong)] p-6 sm:p-8"
      >
        <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-[var(--accent)]">
          // DEMO INFORMATION
        </p>
        <h2
          id="demo-title"
          className="mt-3 flex items-center gap-2 text-xl font-black text-[var(--text-strong)]"
        >
          <Info
            aria-hidden="true"
            className="size-5 shrink-0 text-[var(--accent)]"
          />
          ご利用にあたっての注意
        </h2>
        <p className="mt-4 text-sm leading-7 text-[var(--text)]">
          本サービスはデモ用サービスです。
          <strong>
            新規にアカウントを登録しても、サービスをご利用いただけません。
          </strong>
          動作をお試しいただく際は、以下のテスト用アカウントでログインしてください。
        </p>
        <dl className="mt-6 grid gap-5 border border-[var(--line)] bg-[var(--panel-raised)] p-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold text-[var(--muted)]">
              メールアドレス
            </dt>
            <dd className="mt-2 break-all font-mono text-sm text-[var(--text-strong)]">
              test1@example.com
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-[var(--muted)]">
              パスワード
            </dt>
            <dd className="mt-2 font-mono text-sm text-[var(--text-strong)]">
              password123
            </dd>
          </div>
        </dl>
        <Link to="/login" className={`${primaryLink} mt-6`}>
          テスト用アカウントで試す
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </section>

      <section
        aria-labelledby="creator-title"
        className="border-t border-[var(--line)] pt-8"
      >
        <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-[var(--accent)]">
          // CREATOR
        </p>
        <div className="mt-3 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2
              id="creator-title"
              className="text-xl font-black text-[var(--text-strong)]"
            >
              開発者情報
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">kotonekanno</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://github.com/kotonekanno"
              target="_blank"
              rel="noopener noreferrer"
              className={secondaryLink}
            >
              GitHub
              <ExternalLink aria-label="新しいタブで開く" className="size-4" />
            </a>
            <a
              href="https://github.com/kotonekanno/job-hunt-workspace"
              target="_blank"
              rel="noopener noreferrer"
              className={secondaryLink}
            >
              ソースコード
              <ExternalLink aria-label="新しいタブで開く" className="size-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
