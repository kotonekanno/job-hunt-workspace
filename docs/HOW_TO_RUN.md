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
