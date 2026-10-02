# OpenAPI

`openapi.yaml` が現行仕様の入口です。`paths/`、`components/schemas/`、`components/parameters/`、`components/responses/` に定義を分割しています。`dist/openapi.yaml` はそれらをまとめた生成物です。

`stale_openapi.yaml` は過去の草案として残しており、現行仕様や生成処理からは参照しません。

`frontend/` で以下を実行します。

```bash
npm run openapi:lint
npm run openapi:bundle
```

対象の全APIはBearerアクセストークンを必須とします。PATCHは省略した項目を変更せず、nullableな項目にnullを指定した場合は値を解除します。選考の`selectionSteps`は、指定された場合に配列全体を置き換えます。配列内の各要素には作成時の必須項目が必要で、statusの省略時は`NOT_STARTED`になります。

イベントの登録では、終日予定と時間指定の予定の必要項目を`oneOf`で表現しています。PATCH後のイベント全体の整合性、日時の前後関係、同じ選考内のstepNoの一意性はサーバーでも検証する必要があります。

志望度更新の前後の企業IDは、先頭・末尾でnullを指定します。両項目を省略した場合は指定した志望度の末尾に追加します。

既存の成功レスポンス以外にエラーコードは追加していません。Redoclyの推奨ルールでは、4xxレスポンス未定義、ライセンス未指定、localhostのサーバーURLに関する警告が出ます。
