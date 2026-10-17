# React + TypeScript + Vite

## 認証APIの開発設定

初回は `npm run api:generate` でOpenAPIクライアントを生成してください。生成先の `src/api/generated/` はGit管理対象外です。

`npm run dev` の開発サーバーは `/auth` を `http://localhost:8080` に転送します。変更する場合は `.env.example` を参考に `.env.local` に `API_PROXY_TARGET` を設定してください。本番ではフロントエンドと同一オリジンの `/auth` をAPIへ転送する設定が必要です。

ログイン成功時のアクセストークンは `sessionStorage` の `job-hunt-access-token` に保存します。登録成功時はログイン画面へ遷移します。既存のログイン後ルートでは `getCurrentUser` で認証を確認します。トークン未保持または401の場合はHttpOnly Cookieでリフレッシュを1回試み、新しいトークンで再確認します。認証できなかった場合のみtoastを表示してログイン画面へ遷移します。確認中は保護された画面を描画しません。

共通通知は `@/shared/toast` の `toast.error(message)` / `toast.success(message)` で表示します。通知は6秒後、または閉じるボタンで消えます。

バックエンドへの疎通を行わないローカルテスト: `node --test tests/auth.test.cjs`

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
