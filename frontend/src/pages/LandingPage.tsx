import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCheck,
  ClipboardCheck,
  CodeXml,
  ExternalLink,
  FilePenLine,
  Globe,
  Info,
  Mail,
  NotebookTabs,
} from 'lucide-react';
import type { SVGProps } from 'react';
import { Link } from 'react-router-dom';

function GitHubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 .297C5.37.297 0 5.67 0 12.297c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.043-1.61-4.043-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.838 1.237 1.838 1.237 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 0 1 3.003-.404c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.655 1.652.243 2.873.12 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.595 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

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

const creatorLinks = [
  {
    icon: Mail,
    label: 'メールアドレス',
    url: 'kotonekanno.jp@gmail.com',
    href: 'mailto:kotonekanno.jp@gmail.com',
    external: false,
  },
  {
    icon: GitHubIcon,
    label: 'GitHub',
    url: 'https://github.com/kotonekanno',
    href: 'https://github.com/kotonekanno',
    external: true,
  },
  {
    icon: Globe,
    label: 'ポートフォリオ',
    url: 'https://kotonekanno.github.io/',
    href: 'https://kotonekanno.github.io/',
    external: true,
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

      <footer
        aria-labelledby="creator-title"
        className="relative border-t border-[var(--line)] pt-8 text-sm text-[var(--muted)] before:absolute before:-top-px before:left-0 before:h-px before:w-12 before:bg-[var(--accent)]"
      >
        <h2
          id="creator-title"
          className="text-xs font-bold tracking-wider text-[var(--accent)]"
        >
          開発者情報
        </h2>
        <p className="mt-3 text-xl font-semibold tracking-tight text-[var(--text-strong)]">
          Kotone Kanno
        </p>
        <ul className="mt-5 flex max-w-lg flex-col gap-3">
          {creatorLinks.map(({ icon: Icon, label, url, href, external }) => (
            <li key={label}>
              <a
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="ui-control group inline-flex max-w-full items-center gap-3 py-1 leading-5 hover:text-[var(--accent)]"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[var(--accent-soft)] text-[var(--accent)] transition-colors group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-contrast)]">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-medium">{label}</span>
                  <span className="mt-0.5 block break-all text-[var(--text)] group-hover:text-[var(--accent)] group-hover:underline group-hover:underline-offset-4">
                    {url}
                  </span>
                </span>
                {external && (
                  <span className="sr-only">（新しいタブで開く）</span>
                )}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-6 max-w-lg border-t border-[var(--line)] pt-4">
          <a
            href="https://github.com/kotonekanno/job-hunt-workspace"
            target="_blank"
            rel="noopener noreferrer"
            className="ui-control inline-flex items-center gap-2 py-1 text-xs font-medium hover:text-[var(--accent)] hover:underline hover:underline-offset-4"
          >
            <CodeXml aria-hidden="true" className="size-3.5 shrink-0" />
            ソースコード
            <ExternalLink aria-label="新しいタブで開く" className="size-3" />
          </a>
        </div>
      </footer>
    </div>
  );
}
