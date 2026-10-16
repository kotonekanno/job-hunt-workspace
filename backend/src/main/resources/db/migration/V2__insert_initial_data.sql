-- ローカル開発・画面確認用の架空データ。FlywayでV1の後に一度だけ実行する。
-- IDは採番結果を使用し、既存のシーケンスや他ユーザーのデータに依存しない。
-- 日付はマイグレーション実行日の日本時間を基準とする（再起動では更新されない）。
DO $seed$
DECLARE
  sample_user_id INTEGER;
  sample_company_id INTEGER;
  sample_selection_id INTEGER;
  sample_group_id INTEGER;
  first_company_id INTEGER;
  company_no INTEGER;
  group_no INTEGER;
  sample_date DATE := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Tokyo')::DATE;
  company_row RECORD;
BEGIN
  INSERT INTO users (email, password_hash, is_verified)
  VALUES ('test1@example.com', '$2a$10$T9w8pICHN56uBuc7amcAru7NsLCgRmMHk8GQei9JfWilDep2wErh.', TRUE)
  RETURNING id INTO sample_user_id;

  -- 第1〜3志望は各3社、未分類5社、アーカイブ3社。positionはアプリと同じ1000刻み。
  FOR company_row IN
    SELECT * FROM (VALUES
      (1, 1, 1000, '株式会社アオゾラテクノロジーズ', '教育向けクラウドサービス'),
      (2, 1, 2000, '株式会社ミライノート', 'チーム向け業務支援ソフトウェア'),
      (3, 1, 3000, '株式会社コモレビデータ', '地域のデータ分析支援'),
      (4, 2, 1000, '株式会社ナナイロシステムズ', '自治体向けシステム開発'),
      (5, 2, 2000, '株式会社ツバメデザイン', 'デジタルサービスの体験設計'),
      (6, 2, 3000, '株式会社ホシゾラロボティクス', '物流ロボットの開発'),
      (7, 3, 1000, '株式会社ミナモネットワーク', 'ネットワーク運用支援'),
      (8, 3, 2000, '株式会社ワカバソリューションズ', '製造業の業務改善'),
      (9, 3, 3000, '株式会社ユキドケラボ', '研究開発支援'),
      (10, 6, 1000, '株式会社ソヨカゼクラウド', 'クラウド基盤構築'),
      (11, 6, 2000, '株式会社ハルカゼメディア', '地域情報サービス'),
      (12, 6, 3000, '株式会社アカツキマテリアル', '新素材開発'),
      (13, 6, 4000, '株式会社カナデワークス', '音楽制作支援'),
      (14, 6, 5000, '株式会社フタバエナジー', '再生可能エネルギー'),
      (15, 7, 1000, '株式会社トモシビリンク', '店舗向け予約サービス'),
      (16, 7, 2000, '株式会社シラナミソフト', '会計ソフトウェア'),
      (17, 7, 3000, '株式会社ヤマビコリサーチ', '市場調査')
    ) AS seed(no, priority, position, name, business)
  LOOP
    company_no := company_row.no;
    INSERT INTO companies (
      user_id, priority, position, name,
      show_basic_info_widget, show_selection_widget, document
    ) VALUES (
      sample_user_id, company_row.priority, company_row.position, company_row.name,
      company_no <= 8 OR company_no IN (10, 15),
      company_no <= 7 OR company_no IN (9, 11, 15, 16),
      CASE WHEN company_no <= 6 THEN
        format(E'# %s 企業研究\n\n## 事業\n%s。\n\n## 志望理由\n利用者の課題を聞き、開発から改善まで関われる点に魅力を感じる。\n\n## 面接で確認したいこと\n- 新人の配属と研修\n- チーム内のレビュー体制\n- 入社後半年の期待役割\n\n[採用ページ（サンプル）](https://example.com/recruit)', company_row.name, company_row.business)
      WHEN company_no = 8 THEN E'# 説明会メモ\n\n研修制度と配属先について次回確認する。'
      ELSE NULL END
    ) RETURNING id INTO sample_company_id;

    IF company_no = 1 THEN
      first_company_id := sample_company_id;
    END IF;

    IF company_no <= 6 THEN
      INSERT INTO company_basic_infos (company_id, position, title, text) VALUES
        (sample_company_id, 1000, '事業内容', company_row.business),
        (sample_company_id, 2000, '募集職種', CASE WHEN company_no = 5 THEN 'プロダクトデザイナー' ELSE 'ソフトウェアエンジニア' END),
        (sample_company_id, 3000, '勤務地', CASE WHEN company_no % 2 = 0 THEN '東京都・リモート併用' ELSE '大阪府・週2日出社' END),
        (sample_company_id, 4000, '採用ページ', 'https://example.com/recruit'),
        (sample_company_id, 5000, '選考で重視されること', E'チームでの協働経験\n課題を整理して改善した経験');
    ELSIF company_no IN (7, 10, 15) THEN
      INSERT INTO company_basic_infos (company_id, position, title, text) VALUES
        (sample_company_id, 1000, '事業内容', company_row.business),
        (sample_company_id, 2000, '勤務地', NULL);
    END IF;
    -- 8番は基本情報ウィジェット表示・項目未登録、9番は選考ウィジェット表示・選考未登録。

    IF company_no <= 7 OR company_no IN (11, 15, 16) THEN
      INSERT INTO selections (company_id, title, is_active)
      VALUES (sample_company_id, '本選考', company_no IN (1, 2, 3, 4, 7, 11))
      RETURNING id INTO sample_selection_id;

      -- 11番は進行中だがステップ未登録。ほかは全ステータスと選考結果を網羅する。
      IF company_no <> 11 THEN
        INSERT INTO selection_steps (selection_id, position, name, status, note) VALUES
          (sample_selection_id, 1000, '書類選考',
            CASE WHEN company_no = 7 THEN 'NOT_STARTED' ELSE 'PASSED' END,
            CASE WHEN company_no = 7 THEN NULL ELSE 'ESとポートフォリオを提出済み。' END),
          (sample_selection_id, 2000, '一次面接',
            CASE WHEN company_no IN (1, 4) THEN 'PENDING'
                 WHEN company_no IN (3, 7) THEN 'NOT_STARTED'
                 WHEN company_no IN (6, 16) THEN 'FAILED' ELSE 'PASSED' END,
            CASE WHEN company_no IN (1, 4) THEN E'チーム開発経験について質問された。\n結果連絡は1週間以内の予定。' ELSE NULL END),
          (sample_selection_id, 3000, '最終面接',
            CASE WHEN company_no IN (5, 15) THEN 'PASSED'
                 WHEN company_no = 2 THEN 'PENDING' ELSE 'NOT_STARTED' END,
            CASE WHEN company_no = 5 THEN '内定獲得。条件面を確認中。'
                 WHEN company_no = 15 THEN '内定辞退の連絡済み。' ELSE NULL END);
      END IF;
    END IF;

    -- 同一企業に進行中・過去の選考を共存させる。進行中は必ず1件以下。
    IF company_no IN (1, 2, 6) THEN
      INSERT INTO selections (company_id, title, is_active)
      VALUES (sample_company_id, '夏季インターン選考', FALSE)
      RETURNING id INTO sample_selection_id;
      INSERT INTO selection_steps (selection_id, position, name, status, note) VALUES
        (sample_selection_id, 1000, 'エントリーシート', 'PASSED', NULL),
        (sample_selection_id, 2000, '面談', 'PASSED', 'インターン参加済み。振り返りを企業研究に反映する。');
    END IF;

    -- 履歴25件・3件・1件・0件。送信／受信、同一日時、本文なしを含む。
    IF company_no <= 6 THEN
      INSERT INTO company_activities (company_id, occurred_at, by_user, text)
      SELECT sample_company_id,
        ((sample_date - 30 + ((n - 1) / 2)) + TIME '10:00') AT TIME ZONE 'Asia/Tokyo',
        n % 2 = 1,
        format('%s（%s回目）', CASE n % 4
          WHEN 1 THEN '応募書類を送付しました。'
          WHEN 2 THEN '採用担当者から書類受領の連絡が届きました。'
          WHEN 3 THEN '面談の希望日程と事前質問を送りました。'
          ELSE '面談日程と当日の案内が届きました。' END, n)
      FROM generate_series(1, CASE WHEN company_no = 1 THEN 25 ELSE 3 END) AS series(n);
    ELSIF company_no IN (7, 15) THEN
      INSERT INTO company_activities (company_id, occurred_at, by_user, text)
      VALUES (sample_company_id, (sample_date - 10 + TIME '15:00') AT TIME ZONE 'Asia/Tokyo',
        company_no = 15, CASE WHEN company_no = 15 THEN '応募辞退のメールを送付。' ELSE NULL END);
    END IF;

    IF company_no <= 6 THEN
      INSERT INTO events (
        user_id, company_id, category, title, note, is_all_day,
        start_date, end_date, start_time, end_time, is_online, is_attending
      ) VALUES
        (sample_user_id, sample_company_id, 'SESSION', '事業・職種説明会', '事業内容と研修制度を確認。', FALSE,
          NULL, NULL, (sample_date - 14 + TIME '14:00') AT TIME ZONE 'Asia/Tokyo',
          (sample_date - 14 + TIME '15:00') AT TIME ZONE 'Asia/Tokyo', TRUE, TRUE),
        (sample_user_id, sample_company_id, 'INTERVIEW', '採用面接', '自己紹介と逆質問を準備する。', FALSE,
          NULL, NULL, (sample_date + company_no + TIME '10:00') AT TIME ZONE 'Asia/Tokyo',
          (sample_date + company_no + TIME '11:00') AT TIME ZONE 'Asia/Tokyo', company_no % 2 = 0, NULL),
        (sample_user_id, sample_company_id, 'INTERNSHIP', '仕事体験プログラム', NULL, TRUE,
          sample_date + 14, sample_date + 16, NULL, NULL, FALSE,
          CASE WHEN company_no = 6 THEN FALSE WHEN company_no = 3 THEN NULL ELSE TRUE END);

      INSERT INTO tasks (user_id, company_id, title, note, deadline, done) VALUES
        (sample_user_id, sample_company_id, 'エントリーシートを提出する', '提出フォームの控えを保存する。', sample_date - 7, TRUE),
        (sample_user_id, sample_company_id, '面接の逆質問を整理する', E'配属・研修・評価制度について\n優先度の高い質問を3つ準備する。', sample_date + company_no - 1, FALSE),
        (sample_user_id, sample_company_id, '競合サービスを調べる', NULL, NULL, FALSE);
    ELSIF company_no IN (7, 10) THEN
      INSERT INTO events (
        user_id, company_id, category, title, is_all_day, start_time, end_time, is_online, is_attending
      ) VALUES (
        sample_user_id, sample_company_id, 'CHAT', 'カジュアル面談', FALSE,
        (sample_date + 3 + TIME '16:00') AT TIME ZONE 'Asia/Tokyo',
        (sample_date + 3 + TIME '16:30') AT TIME ZONE 'Asia/Tokyo', TRUE, NULL
      );
    ELSIF company_no = 12 THEN
      INSERT INTO tasks (user_id, company_id, title, deadline, done)
      VALUES (sample_user_id, sample_company_id, '募集要項を確認する', sample_date - 2, FALSE);
    END IF;
    -- 13・14・17番は企業情報のみ。ウィジェット未登録状態を確認できる。
  END LOOP;

  -- 企業に紐づかないイベント：今日の時刻指定、単日終日、複数日終日、不参加、参加未定。
  INSERT INTO events (
    user_id, company_id, category, title, note, is_all_day,
    start_date, end_date, start_time, end_time, is_online, is_attending
  ) VALUES
    (sample_user_id, NULL, 'OTHER', 'キャリアセンターでES添削', '履歴書とESを持参する。', FALSE,
      NULL, NULL, (sample_date + TIME '13:00') AT TIME ZONE 'Asia/Tokyo',
      (sample_date + TIME '14:00') AT TIME ZONE 'Asia/Tokyo', FALSE, TRUE),
    (sample_user_id, NULL, 'SESSION', '合同企業説明会', NULL, TRUE,
      sample_date + 5, sample_date + 5, NULL, NULL, FALSE, NULL),
    (sample_user_id, NULL, 'OTHER', '就活準備合宿', '友人と模擬面接と企業研究を行う。', TRUE,
      sample_date + 20, sample_date + 22, NULL, NULL, FALSE, TRUE),
    (sample_user_id, NULL, 'OTHER', 'オンライン業界研究会', '授業と重なったため欠席。', FALSE,
      NULL, NULL, (sample_date - 3 + TIME '18:00') AT TIME ZONE 'Asia/Tokyo',
      (sample_date - 3 + TIME '19:30') AT TIME ZONE 'Asia/Tokyo', TRUE, FALSE);

  INSERT INTO tasks (user_id, company_id, title, note, deadline, done) VALUES
    (sample_user_id, NULL, '証明写真を撮影する', 'データ付きのプランを予約する。', sample_date - 2, FALSE),
    (sample_user_id, NULL, '履歴書の学歴欄を確認する', NULL, sample_date, FALSE),
    (sample_user_id, NULL, '模擬面接を予約する', '大学のキャリアセンターに申し込む。', sample_date + 7, FALSE),
    (sample_user_id, NULL, '自己分析を追記する', NULL, NULL, FALSE),
    (sample_user_id, NULL, '就活用メールアドレスを用意する', NULL, sample_date - 10, TRUE),
    (sample_user_id, NULL, 'ポートフォリオのリンクを整理する', '公開範囲を確認済み。', NULL, TRUE);

  -- ESは3グループ×3回答。企業あり／なし、グループなし、未回答の下書きも用意。
  FOR group_no IN 1..3 LOOP
    INSERT INTO essay_groups (user_id, position, name)
    VALUES (sample_user_id, group_no * 1000,
      CASE group_no WHEN 1 THEN '自己PR' WHEN 2 THEN '学生時代に力を入れたこと' ELSE '志望動機' END)
    RETURNING id INTO sample_group_id;

    IF group_no = 1 THEN
      INSERT INTO essays (user_id, company_id, essay_group_id, question, answer) VALUES
        (sample_user_id, first_company_id, sample_group_id, 'あなたの強みを教えてください。',
          '私の強みは、利用者の困りごとを整理して改善につなげる力です。大学の履修支援アプリでは学生10人に聞き取りを行い、検索条件の分かりにくさを発見しました。画面を改善し、再度操作してもらうことで使いやすさを確認しました。この経験を教育向けサービスの開発に生かしたいです。'),
        (sample_user_id, NULL, sample_group_id, '自己PRを200字程度で記載してください。',
          '私は周囲と協力しながら課題を解決できます。学園祭の運営では担当間の連絡漏れに気づき、共有チェックリストと週次確認の場を提案しました。担当と期限を明確にしたことで、準備の遅れを早期に把握できるようになりました。'),
        (sample_user_id, NULL, sample_group_id, 'あなたの弱みと改善のための取り組みを教えてください。',
          '細部に時間をかけすぎることが弱みです。現在は作業開始時に完了条件と制限時間を決め、途中段階で周囲に確認してもらうようにしています。品質と期限の両立を意識しています。');
    ELSIF group_no = 2 THEN
      INSERT INTO essays (user_id, company_id, essay_group_id, question, answer) VALUES
        (sample_user_id, NULL, sample_group_id, '学生時代に最も力を入れたことは何ですか。',
          '4人でのWebアプリ開発に力を入れました。当初は機能の優先順位が定まらず開発が停滞していました。私は利用場面を整理し、必須機能と追加機能を分けることを提案しました。毎週動くものを共有し、期限内に公開できました。'),
        (sample_user_id, NULL, sample_group_id, 'チームで困難を乗り越えた経験を教えてください。',
          'サークルの新入生向けイベントで会場変更が発生しました。参加人数と必要設備を整理し、会場調整、参加者連絡、備品準備を分担しました。進捗を共有しながら対応した結果、予定日に開催できました。'),
        (sample_user_id, NULL, sample_group_id, '失敗から学んだことを教えてください。',
          '研究発表の資料作成で、前提の説明を省きすぎて内容が伝わらなかった経験があります。その後は専門外の友人に説明し、疑問点をもとに資料を直しています。相手の知識を想定して伝える大切さを学びました。');
    ELSE
      INSERT INTO essays (user_id, company_id, essay_group_id, question, answer) VALUES
        (sample_user_id, first_company_id, sample_group_id, '当社を志望する理由を教えてください。',
          '教育現場の負担を減らし、学ぶ時間を増やしたいと考えています。貴社の教育向けクラウドサービスに関心があり、利用者の声をもとに改善を続ける開発に携わりたいです。履修支援アプリで培った聞き取りと実装の経験を生かします。'),
        (sample_user_id, NULL, sample_group_id, 'IT業界を志望する理由を教えてください。',
          '仕組みを改善することで多くの人の作業を支えられる点に魅力を感じています。アルバイト先の集計作業を自動化した経験から、現場の課題を理解し技術で解決する仕事を志望しています。'),
        (sample_user_id, NULL, sample_group_id, '入社後に挑戦したいことを教えてください。',
          'まずは設計、実装、テストの基礎を身につけ、安心して使える機能を届けたいです。将来は利用者への聞き取りにも参加し、課題の発見から改善まで担当できるエンジニアを目指します。');
    END IF;
  END LOOP;

  INSERT INTO essays (user_id, company_id, essay_group_id, question, answer) VALUES
    (sample_user_id, NULL, NULL, '就職活動で大切にしている軸を教えてください。',
      '利用者の声を聞けること、チームで学び合えること、改善を継続できることの3点です。'),
    (sample_user_id, first_company_id, NULL, '最近関心を持った技術とその理由を教えてください。', NULL);

  INSERT INTO documents (user_id, position, title, text) VALUES
    (sample_user_id, 1000, '面接対策ノート',
      E'# 面接対策\n\n## 1分間の自己紹介\n大学では情報科学を学び、チームで履修支援アプリを開発しました。利用者の話を聞き、改善につなげることが得意です。\n\n## よく聞かれる質問\n- なぜこの業界か\n- チームでの役割と工夫\n- 失敗した経験と学び\n\n## 回答の組み立て\n結論 → 背景 → 自分の行動 → 結果 → 学びの順で伝える。\n\n## 逆質問\n1. 新人に期待される役割は何ですか。\n2. レビューや学習支援の仕組みを教えてください。\n\n## 当日の確認\n- [x] 自己紹介を録音する\n- [ ] 接続環境と会場を確認する'),
    (sample_user_id, 2000, '自己分析・就活の軸',
      E'# 自己分析\n\n## 大切にしたいこと\n- 利用者の課題に向き合える仕事\n- チームで相談しながら成長できる環境\n- 作って終わりではなく改善を続けられること\n\n## 経験の整理\n| 経験 | 工夫 | 学び |\n| --- | --- | --- |\n| チーム開発 | 必須機能を絞り毎週共有 | 小さく試すことの大切さ |\n| 学園祭運営 | 担当と期限を可視化 | 認識をそろえることの大切さ |\n\n## 企業比較で確認する項目\n事業への関心、配属、研修、働き方、評価制度を説明会や面談で確認する。');
END;
$seed$;
