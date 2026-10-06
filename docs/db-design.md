<!-- omit in toc -->
# データベース設計

<!-- omit in toc -->
### テーブル一覧

- [users](#users)
- [verification\_tokens](#verification_tokens)
- [companies](#companies)
- [company\_basic\_infos](#company_basic_infos)
- [company\_activities](#company_activities)
- [selections](#selections)
- [selection\_steps](#selection_steps)
- [events](#events)
- [tasks](#tasks)
- [essays](#essays)
- [essay\_groups](#essay_groups)
- [documents](#documents)

```mermaid
erDiagram
  users ||--o{ verification_tokens : has
  users ||--o{ companies : has
  users ||--o{ events : has
  users ||--o{ tasks : has
  users ||--o{ essays : has
  users ||--o{ essay_groups : has
  users ||--o{ documents : has
  companies ||--o{ company_basic_infos : has
  companies ||--o{ company_activities : has
  companies ||--o{ selections : has
  selections ||--o{ selection_steps : has
  companies ||--o{ events : has
  companies ||--o{ tasks : has
  companies ||--o{ essays : has
  essay_groups ||--o{ essays : belongs_to

  users {
    SERIAL id
    TEXT email
    TEXT password_hash
    BOOLEAN is_verified
    TIMESTAMPTZ deleted_at
  }

  verification_tokens {
    SERIAL id
    TEXT token
    INT user_id
    TIMESTAMPTZ expires_at
  }

  companies {
    SERIAL id
    INT user_id
    INT position
    TEXT name
    SMALLINT priority
    BOOLEAN show_basic_info_widget
    BOOLEAN show_selection_widget
    TEXT document
  }

  company_basic_infos {
    SERIAL id
    INT company_id
    INT position
    TEXT title
    TEXT text
  }

  company_activities {
    SERIAL id
    INT company_id
    TIMESTAMPTZ occurred_at
    BOOLEAN by_user
    TEXT text
  }

  selections {
    SERIAL id
    INT company_id
    TEXT title
    BOOLEAN is_active
  }

  selection_steps {
    SERIAL id
    INT selection_id
    INT position
    TEXT name
    TEXT status
    TEXT note
  }

  events {
    SERIAL id
    INT user_id
    INT company_id
    TEXT category
    TEXT title
    TEXT note
    BOOLEAN is_all_day
    DATE start_date
    DATE end_date
    TIMESTAMPTZ start_time
    TIMESTAMPTZ end_time
    BOOLEAN is_online
    BOOLEAN is_attending
  }

  tasks {
    SERIAL id
    INT user_id
    INT company_id
    TEXT title
    TEXT note
    DATE deadline
    BOOLEAN done
  }

  essays {
    SERIAL id
    INT user_id
    INT company_id
    INT essay_group_id
    TEXT question
    TEXT answer
  }

  essay_groups {
    SERIAL id
    INT user_id
    INT position
    TEXT name
  }

  documents {
    SERIAL id
    INT user_id
    INT position
    TEXT title
    TEXT text
  }
```

## users

ユーザー情報

| column         | type         | NULL | description        |
| -------------- | ------------ | ---- | ------------------ |
| id             | SERIAL       | NO   | ユーザーID         |
| email          | TEXT         | NO   | メールアドレス     |
| password_hash  | TEXT         | NO   | パスワードのハッシュ値 |
| is_verified    | BOOLEAN      | NO   | メールアドレス認証の可否 |
| deleted_at     | TIMESTAMPTZ  | YES  | アカウント削除日時 |

- is_verified
  - DEFAULT FALSE
  - TRUEの場合のみログイン可能
  - メールアドレス認証を完了するとTRUEになる
- deleted_at
  - NULLでない場合は論理削除扱い

<!-- omit in toc -->
#### 制約

- UNIQUE
  - email
- INDEX
  - id

## verification_tokens

メールアドレスの認証トークン

| column         | type         | NULL | description        |
| -------------- | ------------ | ---- | ------------------ |
| id             | SERIAL       | NO   | ID                 |
| user_id        | INT          | NO   | ユーザーID         |
| token          | TEXT         | NO   | トークン           |
| expires_at     | TIMESTAMPTZ  | NO   | 有効期限           |

- expires_at
  - トークンの有効期限

<!-- omit in toc -->
#### 制約

- FOREIGN
  - user_id: users.id(ON DELETE CASCADE)
- UNIQUE
  - token
- INDEX
  - user_id

## companies

企業情報

| column         | type         | NULL | description        |
| -------------- | ------------ | ---- | ------------------ |
| id             | SERIAL       | NO   | 企業ID             |
| user_id        | INT          | NO   | ユーザーID         |
| priority       | SMALLINT     | NO   | 志望度             |
| position       | INT          | NO   | 表示順             |
| name           | TEXT         | NO   | 企業名             |
| show_basic_info_widget | BOOLEAN   | NO   | 基本情報ウィジェットの表示／非表示 |
| show_selection_widget | BOOLEAN    | NO   | 選考状況ウィジェットの表示／非表示 |
| document       | TEXT         | YES  | Markdown形式の文書 |

- priority
  - BETWEEN 0 AND 6
  - 0: 未分類, 1-5: 第n志望, 6: アーカイブ
- show_*_widget
  - trueならばウィジェットを表示する
  - DEFAULT FALSE
  - 参照：実装時にはトランザクションを利用

<!-- omit in toc -->
#### 制約

- FOREIGN
  - user_id: users.id(ON DELETE CASCADE)
- UNIQUE
  - user_id, priority, position
- INDEX
  - user_id, priority, position

## company_basic_infos

企業の基本情報

| column         | type         | NULL | description        |
| -------------- | ------------ | ---- | ------------------ |
| id             | SERIAL       | NO   | 基本情報ID         |
| company_id     | INT          | NO   | 企業ID             |
| position       | INT          | NO   | 表示順             |
| title          | TEXT         | NO   | 項目名             |
| text           | TEXT         | YES  | 内容               |

<!-- omit in toc -->
#### 制約

- FOREIGN
  - company_id: companies.id(ON DELETE CASCADE)
- UNIQUE
  - company_id, position
- INDEX
  - company_id, position

## company_activities

企業とのやり取り履歴

| column         | type         | NULL | description        |
| -------------- | ------------ | ---- | ------------------ |
| id             | SERIAL       | NO   | 活動履歴ID         |
| company_id     | INT          | NO   | 企業ID             |
| occurred_at    | TIMESTAMPTZ  | NO   | 日付               |
| by_user        | BOOLEAN      | NO   | trueならばユーザー側からのやり取り |
| text           | TEXT         | YES   | 内容               |

<!-- omit in toc -->
#### 制約

- FOREIGN
  - company_id: companies.id(ON DELETE CASCADE)
- INDEX
  - company_id, occurred_at

## selections

選考情報

| column         | type         | NULL | description        |
| -------------- | ------------ | ---- | ------------------ |
| id             | SERIAL       | NO   | 選考ID             |
| company_id     | INT          | NO   | 企業ID             |
| title          | TEXT         | NO   | 選考種別(本選考、インターンなど) |
| is_active      | BOOLEAN      | NO   | trueならば進行中の選考 |

- is_active
  - DEFAULT FALSE

<!-- omit in toc -->
#### 制約

- FOREIGN
  - company_id: companies.id(ON DELETE CASCADE)
- INDEX
  - company_id
- UNIQUE INDEX
  - selections(company_id) WHERE is_active = TRUE

## selection_steps

選考ステップ情報

| column         | type         | NULL | description        |
| -------------- | ------------ | ---- | ------------------ |
| id             | SERIAL       | NO   | 選考ステップID     |
| selection_id   | INT          | NO   | 選考ID             |
| position       | INT          | NO   | 選考ステップの順序 |
| status         | TEXT         | NO   | 選考状況           |
| name           | TEXT         | NO   | 選考ステップ名(一次面接、書類選考など)|
| note           | TEXT         | YES  | 詳細情報メモ       |

- status
  - NOT_STARTED(未受験) | PENDING(結果待ち) | PASSED(合格) | FAILED(不合格)
  - DEFAULT 'NOT_STARTED'

<!-- omit in toc -->
#### 制約

- FOREIGN
  - selection_id: selections.id(ON DELETE CASCADE)
- UNIQUE
  - selection_id, position
- INDEX
  - selection_id, position

## events

説明会等のイベント情報

| column         | type         | NULL | description        |
| -------------- | ------------ | ---- | ------------------ |
| id             | SERIAL       | NO   | イベントID         |
| user_id        | INT          | NO   | ユーザーID         |
| company_id     | INT          | YES  | 企業ID             |
| category       | TEXT         | NO   | イベントの種類     |
| title          | TEXT         | NO   | イベント名         |
| note           | TEXT         | YES  | 詳細情報メモ       |
| is_all_day     | BOOLEAN      | NO   | trueならば終日予定 |
| start_date     | DATE         | YES  | 開始日(終日予定)   |
| end_date       | DATE         | YES  | 終了日(終日予定)   |
| start_time     | TIMESTAMPTZ  | YES  | 開始日時           |
| end_time       | TIMESTAMPTZ  | YES  | 終了日時           |
| is_online      | BOOLEAN      | NO   | オンライン／オフライン開催 |
| is_attending   | BOOLEAN      | YES  | 参加／不参加       |

- category
  - SESSION(説明会) | CHAT(カジュアル面談) | INTERVIEW(面接) | INTERNSHIP(インターン) | OTHER(その他)
- is_all_day
  - trueならばstart_date, end_dateを使用し、start_time, end_timeはNULLとする
  - falseならばstart_time, end_timeを使用し、start_date, end_dateはNULLとする
  - DEFAULT FALSE
- is_online
  - DEFAULT TRUE
- is_attending
  - categoryがSESSION(説明会)、INTERNSHIP(インターン)、OTHER(その他)の場合のみ使用
  - DEFAULT TRUE

<!-- omit in toc -->
#### 制約

- FOREIGN
  - user_id: users.id(ON DELETE CASCADE)
  - company_id, user_id: companies(id, user_id)(ON DELETE CASCADE)
- CHECK
  - end_date >= start_date
  - end_time > start_time
- INDEX
  - user_id, start_time
  - user_id, start_date
  - company_id, start_time
  - company_id, start_date

## tasks

タスクリスト

| column         | type         | NULL | description        |
| -------------- | ------------ | ---- | ------------------ |
| id             | SERIAL       | NO   | タスクID           |
| user_id        | INT          | NO   | ユーザーID         |
| company_id     | INT          | YES  | 企業ID             |
| title          | TEXT         | NO   | タスク概要         |
| note           | TEXT         | YES  | タスク詳細         |
| deadline       | DATE  | YES  | 期限               |
| done           | BOOLEAN      | NO   | 完了／未完了       |

<!-- omit in toc -->
#### 制約

- FOREIGN
  - user_id: users.id(ON DELETE CASCADE)
  - company_id, user_id: companies(id, user_id)(ON DELETE CASCADE)
- INDEX
  - user_id, deadline
  - company_id, deadline

## essays

エントリーシート回答集

| column            | type         | NULL | description        |
| ----------------- | ------------ | ---- | ------------------ |
| id                | SERIAL       | NO   | エントリーシートID |
| user_id           | INT          | NO   | ユーザーID         |
| company_id        | INT          | YES  | 企業ID             |
| essay_group_id    | INT          | NO   | 設問グループID     |
| question          | TEXT         | NO   | 設問               |
| answer            | TEXT         | YES  | 回答               |

<!-- omit in toc -->
#### 制約

- FOREIGN
  - user_id: users.id(ON DELETE CASCADE)
  - company_id, user_id: companies(id, user_id)(ON DELETE CASCADE)
  - essay_group_id, user_id: essay_groups(id, user_id)(ON DELETE RESTRICT)
- INDEX
  - essay_group_id

## essay_groups

エントリーシートの設問種別のグループ分け

| column            | type         | NULL | description        |
| ----------------- | ------------ | ---- | ------------------ |
| id                | SERIAL       | NO   | 設問グループID     |
| user_id           | INT          | NO   | ユーザーID         |
| position          | INT          | NO   | 表示順             |
| name              | TEXT         | NO   | グループ名         |

<!-- omit in toc -->
#### 制約

- FOREIGN
  - user_id: users.id(ON DELETE CASCADE)
- UNIQUE
  - user_id, name
  - user_id, position
- INDEX
  - user_id, position

## documents

| column            | type         | NULL | description        |
| ----------------- | ------------ | ---- | ------------------ |
| id                | SERIAL       | NO   | 文書ID             |
| user_id           | INT          | NO   | ユーザーID         |
| position          | INT          | NO   | 表示順             |
| title             | TEXT         | NO   | タイトル           |
| text              | TEXT         | NO   | 本文               |

<!-- omit in toc -->
#### 制約

- FOREIGN
  - user_id: users.id(ON DELETE CASCADE)
- UNIQUE
  - user_id, position
- INDEX
  - user_id, position
