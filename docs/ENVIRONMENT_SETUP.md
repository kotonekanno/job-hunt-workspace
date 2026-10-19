# 環境構築

## バックエンドの設定

初回は `backend/.env.example` を `backend/.env` にコピーして値を設定します。
Springの設定は `backend/src/main/resources/application.yaml` に統一しています。
`local` / `prod` プロファイルの切り替えは不要です。

- PC上で起動すると、ルートまたは `backend/` を作業ディレクトリとして `.env` を読み込みます。
  ルートからは `backend/.env`、`backend/` からは `.env` を読み込みます。
  ルートの `.env` にも設定を書いた場合は、その値が後から優先されます。
- Dockerではルートの `compose.yaml` が `backend/.env` をバックエンドに渡します。
  DB接続設定はComposeの `environment` が優先され、接続先は `db:5432` になります。
- OSや起動環境で指定した環境変数は、ファイル内の値より優先されます。

`.env` はSpringがProperties形式としても読むため、`KEY=value` 形式で記述します。
値を引用符で囲んだり、`export` を付けたりせず、コメントは独立した行に書いてください。
バックスラッシュはPropertiesのエスケープ規則に従います。
DB認証情報はURL内、または `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD` で指定できます。

本番では環境変数を設定するか、`backend/` から起動する場合は
`SPRING_CONFIG_IMPORT=file:./.env.production[.properties]` を指定します。
この指定は標準の `.env` 読み込み先を置き換えます。パスは作業ディレクトリ基準です。
`COOKIE_SECURE=true`、`COOKIE_SAME_SITE=None` などを配備先に合わせて設定してください。
既存の `.env.production` には未入力の値があるため、使用前に埋めてください。
`.env` ファイルはDockerイメージには含めません。

## OpenAPIから生成

   ```bash
   cd frontend/
   npm run api:generate
   cd ../backend/
   ./gradlew openApiGenerate
   ```

# Docker

## DB

```bash
psql -U postgres -W job_hunt_workspace
```
