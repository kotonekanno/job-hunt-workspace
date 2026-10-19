<!-- omit in toc -->
# 就活管理アプリ「極・就活管理」

<!-- omit in toc -->
### 目次

- [概要](#概要)
- [デモ](#デモ)
- [使用技術](#使用技術)
- [各種ドキュメント](#各種ドキュメント)

## 概要

本アプリは、就活に関する企業情報・選考状況・スケジュール・タスク等を一元管理できるWebアプリケーションです。  
複数企業の選考を並行して進める中で、情報が分散することによる管理の煩雑さを解消し、効率的に就職活動を進められるようにすることを目的としています。

<!-- omit in toc -->
### ターゲット

- 複数企業の選考を並行して進めている就活生
- 企業情報や選考状況、スケジュール等をまとめて管理したい就活生

<!-- omit in toc -->
### 解決したい課題

- 企業情報や選考履歴、メモ等が複数のツールに分散しており、確認や管理に手間がかかる
- 複数企業の選考を並行して進める中で、各企業の選考状況や今後の予定を把握しづらい
- ESの回答や面接対策の内容を蓄積・整理し、別の企業の選考でも再利用したい

## デモ

- 🌐 https://movie-log-frontend.vercel.app/login
- [スクリーンショット](docs/screenshots.md)
- テストアカウント
    | メールアドレス | パスワード |
    | -------------- | ---------- |
    | test1@example.com | password123   |

※ テスト用アカウントでのみ利用可能です  
※ 初回アクセス時に数秒かかる場合があります（Render無料プラン）


## 使用技術

<!-- omit in toc -->
### フロントエンド

- React / TypeScript
- Tailwind CSS

<!-- omit in toc -->
### バックエンド

- Spring Boot / Java

<!-- omit in toc -->
### データベース

- PostgreSQL

<!-- omit in toc -->
### インフラ

- Cloudflare（フロントエンド）
- Render（バックエンド）
- Neon（PostgreSQLデータベース）

<!-- omit in toc -->
### その他

- Flyway
- Docker
- OpenAPI


## 各種ドキュメント

- [機能一覧](docs/features.md)
- [データベース設計](docs/db-design.md)
- [API設計](https://kotonekanno.github.io/job-hunt-workspace)