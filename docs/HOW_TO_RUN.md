### 環境構築

```bash
cd frontend/
npm run api:generate
cd ../backend/
./gradlew openApiGenerate
```

### Dockerでバックエンドをビルド

OpenAPI定義も使用するため、リポジトリのルートで実行する。

```bash
docker compose build backend
# Dockerを直接使用する場合
docker build -f backend/Dockerfile -t job-hunt-workspace-backend .
```

Docker内ではGradle Wrapperを使ってOpenAPIのコード生成と`bootJar`を実行する。
ビルド対象は`backend/Dockerfile.dockerignore`で制限し、環境変数ファイルや
ローカルのビルド成果物は送信しない。


### OpenAPI変更後

以下を`frontend/` で実行

1. OpenAPIの検証
   ```bash
   npm run openapi:lint
   ```

2. 分割定義から `openapi/dist/openapi.yaml` を生成
   ```bash
   npm run openapi:bundle
   ```

3. [API定義書](openapi/dist/api-docs.html)を生成
   ```bash
   npm run openapi:docs
   ```

4. フロントエンドにAPIクライアントを生成
   ```bash
   npm run api:generate
   ```

5. バックエンドで型を生成

   ```bash
   cd ../backend/
   ./gradlew openApiGenerate
   ```
