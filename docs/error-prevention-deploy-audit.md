# 🛡️ Studio344 エラー防止 & デプロイ監査提案書

> **作成日:** 2026-02-14  
> **対象:** Studio344 ポートフォリオサイト（静的HTML/CSS/JS、GitHub Pages ホスティング）  
> **目的:** サイトの信頼性・品質向上のためのエラー防止策とデプロイ自動化の包括的提案

---

## 📋 目次

1. [CI/CD パイプライン構築](#1-cicd-パイプライン構築)
2. [自動テスト（HTML検証・リンクチェック・アクセシビリティ）](#2-自動テスト)
3. [ビルド／デプロイ セーフガード](#3-ビルドデプロイ-セーフガード)
4. [JavaScript エラーハンドリング改善](#4-javascript-エラーハンドリング改善)
5. [モニタリング & アラート](#5-モニタリング--アラート)
6. [コンテンツ整合性チェック](#6-コンテンツ整合性チェック)
7. [依存関係管理 & アップデート戦略](#7-依存関係管理--アップデート戦略)
8. [プリデプロイ チェックリスト自動化](#8-プリデプロイ-チェックリスト自動化)
9. [ロールバック戦略](#9-ロールバック戦略)
10. [Sitemap／SEO 自動化](#10-sitemapseo-自動化)

---

## 1. CI/CD パイプライン構築

### 1-1. 🔴 GitHub Actions CI パイプラインの導入

| 項目 | 内容 |
|------|------|
| **問題/リスク** | 現在 CI/CD パイプラインが存在しない。コード変更が未検証のまま `main` ブランチにマージされ、本番環境に即反映される。HTML 構文エラー、壊れたリンク、JSON スキーマ不整合、JS ランタイムエラーなど、あらゆる問題が無チェックで公開されるリスクがある。 |
| **提案** | GitHub Actions で PR トリガーの CI ワークフローを構築する |
| **信頼性への影響** | ⭐⭐⭐⭐⭐ — 全自動チェックの基盤となり、ヒューマンエラーの大部分を防止 |
| **工数** | **M**（2〜3時間） |

**実装詳細:**

```yaml
# .github/workflows/ci.yml
name: 🔍 CI - Validation & Quality Checks

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: 📄 HTML Validation (html-validate)
        uses: nickersoft/html-validate-action@v1
        with:
          root: '.'

      - name: 🔗 Link Checking (lychee)
        uses: lycheeverse/lychee-action@v2
        with:
          args: >
            --exclude-path node_modules
            --exclude 'pagead2.googlesyndication.com'
            --accept 200,301,302,403
            '*.html' 'projects/*.html'

      - name: 📋 JSON Schema Validation
        run: |
          npm install -g ajv-cli
          ajv validate -s .schemas/list.schema.json -d assets/posts/list.json
          ajv validate -s .schemas/projects.schema.json -d projects.json

      - name: 🗺️ Sitemap Consistency Check
        run: node scripts/check-sitemap.js

      - name: ♿ Accessibility (axe-core)
        uses: dequelabs/axe-linter-action@v3
```

---

### 1-2. 🔴 デプロイ自動化（GitHub Pages Actions）

| 項目 | 内容 |
|------|------|
| **問題/リスク** | GitHub Pages は `main` ブランチへの push で自動デプロイされるが、CI チェックとの連携がない。壊れたコードがそのままデプロイされる可能性がある。 |
| **提案** | GitHub Actions の `pages` deploy アクションを使い、CI 通過後にのみデプロイする構成にする |
| **信頼性への影響** | ⭐⭐⭐⭐⭐ — デプロイゲートとして機能し、不良コードの本番反映を阻止 |
| **工数** | **S**（1時間） |

**実装詳細:**

```yaml
# .github/workflows/deploy.yml
name: 🚀 Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  validate:
    uses: ./.github/workflows/ci.yml

  deploy:
    needs: validate
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      - id: deployment
        uses: actions/deploy-pages@v4
```

> **設定変更:** GitHub リポジトリの Settings > Pages で Source を「GitHub Actions」に変更する。

---

## 2. 自動テスト

### 2-1. 🔴 HTML バリデーション

| 項目 | 内容 |
|------|------|
| **問題/リスク** | 現在 HTML バリデーションが一切行われていない。不正な HTML はブラウザのフォールバック動作に依存し、ブラウザ間で挙動が異なる可能性がある。`data-i18n` 属性の誤記、閉じタグ不足、不正なネストなどが検出されない。 |
| **提案** | `html-validate` を導入し、全 HTML ファイルをローカル＆CI で検証 |
| **信頼性への影響** | ⭐⭐⭐⭐ — 構造的なHTMLエラーを全て事前に検出 |
| **工数** | **S**（30分） |

**実装詳細:**

```bash
# ローカル実行
npx html-validate "*.html" "projects/*.html"
```

```json
// .htmlvalidate.json（設定ファイル）
{
  "extends": ["html-validate:recommended"],
  "rules": {
    "no-trailing-whitespace": "off",
    "attribute-boolean-style": "off",
    "element-permitted-content": "warn"
  },
  "elements": [
    "html5",
    {
      "ins": { "attributes": { "class": {}, "data-ad-client": {}, "data-ad-slot": {} } }
    }
  ]
}
```

---

### 2-2. 🔴 リンクチェック（内部 + 外部）

| 項目 | 内容 |
|------|------|
| **問題/リスク** | 壊れたリンクが放置される可能性がある。特にブログ記事内のリンク、`projects.json` の `link` フィールド、ナビゲーションリンクなどが対象。リンク切れは SEO にも悪影響（404→クロールバジェット無駄消費）。 |
| **提案** | `lychee`（Rust製高速リンクチェッカー）を CI に導入 |
| **信頼性への影響** | ⭐⭐⭐⭐ — 壊れたリンクを自動検出し、ユーザー体験の劣化を防止 |
| **工数** | **S**（30分） |

**実装詳細:**

```yaml
# CI ワークフロー内
- name: 🔗 Link Check
  uses: lycheeverse/lychee-action@v2
  with:
    args: >
      --exclude 'pagead2.googlesyndication.com'
      --exclude 'cdnjs.cloudflare.com'
      --timeout 30
      --max-retries 3
      --accept 200,301,302
      '*.html' 'projects/*.html' 'assets/posts/*.md'
    fail: true
```

```toml
# lychee.toml（ローカル設定）
[config]
exclude = [
  "pagead2.googlesyndication.com",
  "localhost",
  "127.0.0.1"
]
timeout = 30
max_retries = 3
accept = [200, 301, 302]
```

---

### 2-3. 🟡 アクセシビリティテスト（axe-core）

| 項目 | 内容 |
|------|------|
| **問題/リスク** | アクセシビリティ違反が検証されていない。`aria-label`、色コントラスト、キーボードナビゲーション、スクリーンリーダー互換性の問題が潜在していると思われる。 |
| **提案** | `axe-core` ベースの CI テスト + Lighthouse CI による定期スコア監視 |
| **信頼性への影響** | ⭐⭐⭐ — WCAG違反を検出し、アクセシブルなサイトを維持 |
| **工数** | **M**（2時間） |

**実装詳細:**

```yaml
# CI内 Lighthouse CI
- name: 🏠 Start local server
  run: npx serve . -p 8080 &

- name: 🔦 Lighthouse CI
  uses: treosh/lighthouse-ci-action@v12
  with:
    urls: |
      http://localhost:8080/
      http://localhost:8080/blog.html
      http://localhost:8080/projects.html
      http://localhost:8080/about.html
    configPath: .lighthouserc.json
```

```json
// .lighthouserc.json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["warn", { "minScore": 0.9 }],
        "categories:seo": ["warn", { "minScore": 0.9 }]
      }
    }
  }
}
```

---

### 2-4. 🟡 JSON スキーマバリデーション

| 項目 | 内容 |
|------|------|
| **問題/リスク** | `list.json` と `projects.json` にスキーマ検証がない。必須フィールドの欠落（例: `baseFilename` の入力ミス）や型の不整合があっても、ランタイムまで検出できない。`blog.js` は `post.baseFilename` を直接ファイルパス構築に使用しており、誤字があると 404 エラーとなる。 |
| **提案** | JSON Schema を定義し、CI/ローカルで検証する |
| **信頼性への影響** | ⭐⭐⭐⭐ — データ起因のランタイムエラーを事前に完全排除 |
| **工数** | **S**（1時間） |

**実装詳細:**

```json
// .schemas/list.schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "array",
  "items": {
    "type": "object",
    "required": ["id", "date", "baseFilename"],
    "properties": {
      "id": {
        "type": "string",
        "pattern": "^[a-z0-9-]+$",
        "description": "URL セーフな記事ID"
      },
      "date": {
        "type": "string",
        "pattern": "^\\d{4}\\.\\d{2}\\.\\d{2}$",
        "description": "日付（YYYY.MM.DD 形式）"
      },
      "baseFilename": {
        "type": "string",
        "pattern": "^\\d{4}-\\d{2}-\\d{2}-[a-z0-9-]+$",
        "description": "マークダウンファイルのベース名"
      },
      "emoji": { "type": "string" },
      "tags": {
        "type": "array",
        "items": { "type": "string" }
      }
    },
    "additionalProperties": false
  }
}
```

```json
// .schemas/projects.schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "array",
  "items": {
    "type": "object",
    "required": ["title", "title_ja", "description", "description_ja", "link"],
    "properties": {
      "title": { "type": "string" },
      "title_ja": { "type": "string" },
      "description": { "type": "string" },
      "description_ja": { "type": "string" },
      "link": { "type": "string" },
      "visualClass": { "type": "string" },
      "icon": { "type": "string", "enum": ["code", "pulse"] },
      "comingSoon": { "type": "boolean" }
    },
    "additionalProperties": false
  }
}
```

---

## 3. ビルド／デプロイ セーフガード

### 3-1. 🔴 ブランチ保護ルールの設定

| 項目 | 内容 |
|------|------|
| **問題/リスク** | `main` ブランチに直接 push が可能。意図しない変更やレビューなしの変更が本番環境に反映される。 |
| **提案** | GitHub の Branch Protection Rules を設定する |
| **信頼性への影響** | ⭐⭐⭐⭐⭐ — 全変更に対してレビュー＋CI通過を強制 |
| **工数** | **S**（15分） |

**設定内容:**

```
Settings > Branches > Add rule (main):
✅ Require a pull request before merging
  ✅ Require approvals: 1（個人プロジェクトなら0でも可）
✅ Require status checks to pass before merging
  ✅ Require branches to be up to date before merging
  ステータスチェック: "validate" (CI ジョブ名)
✅ Require linear history（オプション: クリーンな履歴のため）
✅ Do not allow bypassing the above settings
```

---

### 3-2. 🟡 プリコミットフック（Husky + lint-staged）

| 項目 | 内容 |
|------|------|
| **問題/リスク** | ローカルでのコミット時に品質チェックが行われない。CI にたどり着く前の段階で問題を検出できない。 |
| **提案** | `husky` + `lint-staged` でコミット前に自動チェックを実行 |
| **信頼性への影響** | ⭐⭐⭐ — 開発者フィードバックループの短縮 |
| **工数** | **S**（30分） |

**実装詳細:**

```bash
npm init -y
npm install --save-dev husky lint-staged
npx husky init
```

```json
// package.json に追加
{
  "lint-staged": {
    "*.html": ["npx html-validate"],
    "*.json": ["node -e \"JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))\""],
    "*.js": ["npx eslint --fix"]
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

---

### 3-3. 🟡 ファイルサイズ監視

| 項目 | 内容 |
|------|------|
| **問題/リスク** | 画像やCSSの肥大化がパフォーマンス劣化を招く。特に GitHub Pages はバンド幅に暗黙的な制限がある。 |
| **提案** | CI でファイルサイズの上限チェックを導入する |
| **信頼性への影響** | ⭐⭐ — パフォーマンス品質の維持 |
| **工数** | **S**（30分） |

**実装詳細:**

```yaml
# CI 内
- name: 📏 File Size Check
  run: |
    MAX_CSS_KB=200
    MAX_JS_KB=100
    MAX_HTML_KB=100

    for f in *.css; do
      size=$(stat -f%z "$f" 2>/dev/null || stat -c%s "$f")
      kb=$((size / 1024))
      if [ $kb -gt $MAX_CSS_KB ]; then
        echo "❌ $f is ${kb}KB (limit: ${MAX_CSS_KB}KB)"
        exit 1
      fi
    done

    echo "✅ All files within size limits"
```

---

## 4. JavaScript エラーハンドリング改善

### 4-1. 🔴 `fetch()` のレスポンスステータスチェック漏れ

| 項目 | 内容 |
|------|------|
| **問題/リスク** | `blog.js` の `loadBlogPosts()` において `fetch("assets/posts/list.json")` のレスポンスが `ok` かどうかを確認していない（L456付近）。404 や 500 レスポンスでも `.json()` を呼び出し、予測不能なエラーが発生する。`script.js` の `fetch("projects.json")` も同様。 |
| **提案** | 全 `fetch()` 呼び出しに `response.ok` チェックを追加し、共通のフェッチラッパーを作成する |
| **信頼性への影響** | ⭐⭐⭐⭐ — 予測不能なランタイムエラーを構造的に排除 |
| **工数** | **S**（1時間） |

**実装詳細:**

```javascript
// ユーティリティ関数（assets/js/utils.js として新規作成推奨）
async function safeFetch(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText} (${url})`);
    }
    return response;
  } catch (error) {
    console.error(`[safeFetch] Failed: ${url}`, error);
    throw error;
  }
}

async function safeFetchJSON(url) {
  const response = await safeFetch(url);
  return response.json();
}
```

**修正すべき箇所一覧:**

| ファイル | 行付近 | 現状 | 修正後 |
|---------|--------|------|--------|
| `blog.js` | `loadBlogPosts()` L456 | `fetch(listUrl)` → `.json()` | `safeFetchJSON(listUrl)` |
| `blog.js` | `showSinglePost()` L147 | `fetch("assets/posts/list.json")` | `safeFetchJSON(...)` |
| `blog.js` | `insertPrevNextNav()` L596 | `fetch('assets/posts/list.json')` | `safeFetchJSON(...)` |
| `script.js` | L17 | `fetch("assets/posts/list.json")` | `safeFetchJSON(...)` |
| `script.js` | L28 | `fetch("projects.json")` | `safeFetchJSON(...)` |

---

### 4-2. 🔴 CDN 障害時のフォールバック未実装

| 項目 | 内容 |
|------|------|
| **問題/リスク** | `i18next`、`i18next-http-backend`、`marked.js`、`DOMPurify`、`Prism.js` が全て外部 CDN（cdnjs）に依存。CDN 障害時にサイトのコア機能（多言語表示、ブログ描画）が完全に動作停止する。SRI ハッシュが設定されているものの、フォールバック機構がない。 |
| **提案** | CDN 読み込み失敗時のローカルフォールバック機構を導入する |
| **信頼性への影響** | ⭐⭐⭐⭐⭐ — CDN障害時のサイト完全停止を防止 |
| **工数** | **M**（2〜3時間） |

**実装詳細:**

```html
<!-- CDN with local fallback pattern -->
<script
  src="https://cdnjs.cloudflare.com/ajax/libs/i18next/23.16.8/i18next.min.js"
  integrity="sha384-..."
  crossorigin="anonymous"
  onerror="loadLocalFallback('assets/vendor/i18next.min.js')"
></script>

<script>
  // フォールバックローダー
  function loadLocalFallback(src) {
    console.warn(`CDN failed, loading local fallback: ${src}`);
    const s = document.createElement('script');
    s.src = src;
    document.head.appendChild(s);
  }

  // CDNロード確認（ライブラリのグローバル変数をチェック）
  window.addEventListener('DOMContentLoaded', () => {
    const checks = [
      { name: 'i18next', global: 'i18next', fallback: 'assets/vendor/i18next.min.js' },
      { name: 'marked', global: 'marked', fallback: 'assets/vendor/marked.min.js' },
      { name: 'DOMPurify', global: 'DOMPurify', fallback: 'assets/vendor/purify.min.js' },
    ];
    checks.forEach(({ name, global, fallback }) => {
      if (typeof window[global] === 'undefined') {
        console.error(`${name} not loaded, attempting fallback...`);
        loadLocalFallback(fallback);
      }
    });
  });
</script>
```

**ベンダーファイルの管理:**
```bash
# assets/vendor/ ディレクトリにローカルコピーを配置
mkdir -p assets/vendor
curl -o assets/vendor/i18next.min.js https://cdnjs.cloudflare.com/ajax/libs/i18next/23.16.8/i18next.min.js
curl -o assets/vendor/marked.min.js https://cdnjs.cloudflare.com/ajax/libs/marked/15.0.6/marked.min.js
curl -o assets/vendor/purify.min.js https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.2.4/purify.min.js
```

---

### 4-3. 🟡 `i18n.js` のパス解決ヒューリスティックの堅牢化

| 項目 | 内容 |
|------|------|
| **問題/リスク** | `i18n.js` L20-22 の `if (path.includes("/projects/"))` による相対パス解決は脆弱。新しいサブディレクトリが追加された場合（例: `/blog/`、`/docs/`）に破綻する。GitHub Pages のリポジトリプレフィックス（`/Info_Studio344/`）との組み合わせでも問題が発生し得る。 |
| **提案** | パス深度に基づくロジックを `<base>` タグまたは絶対パス方式に置き換える |
| **信頼性への影響** | ⭐⭐⭐⭐ — 多言語切替のサイトワイドな信頼性を確保 |
| **工数** | **S**（30分） |

**実装詳細:**

```javascript
// i18n.js — 改善案 A: スクリプトタグから自動検出
backend: {
  loadPath: (lng, namespace) => {
    // i18n.js の場所から locales/ のパスを自動算出
    const scripts = document.querySelectorAll('script[src*="i18n.js"]');
    if (scripts.length > 0) {
      const src = scripts[0].getAttribute('src');
      const base = src.substring(0, src.lastIndexOf('/') + 1);
      return `${base}locales/${lng}.json`;
    }
    // フォールバック: ルート直下を仮定
    return `/locales/${lng}.json`;
  }
}

// 改善案 B（推奨）: <meta> タグでベースパスを宣言
// 各HTMLの <head> に追加: <meta name="app-base" content="/" />
// projects/内: <meta name="app-base" content="../" />
backend: {
  loadPath: (lng, namespace) => {
    const baseMeta = document.querySelector('meta[name="app-base"]');
    const base = baseMeta ? baseMeta.content : '/';
    return `${base}locales/${lng}.json`;
  }
}
```

---

### 4-4. 🟡 `script.js` のテンプレートクローン前提条件チェック

| 項目 | 内容 |
|------|------|
| **問題/リスク** | `script.js` L73-85 で `template.content.cloneNode(true)` 後に `card.querySelector("h3")`、`card.querySelector("p")`、`card.querySelector("a")` を呼び出しているが、HTML テンプレート構造が変更された場合に `null` 参照エラーが発生する。現状 `if (titleEl)` で部分的にガードされているが、`card.querySelector(".project-card")` 自体が `null` になるケースがガードされていない。 |
| **提案** | Null チェックの一貫した適用と、テンプレート構造変更検出の仕組みを導入 |
| **信頼性への影響** | ⭐⭐⭐ — サイレントな描画失敗を防止 |
| **工数** | **S**（30分） |

**実装詳細:**

```javascript
// テンプレートの構造検証ヘルパー
function cloneAndValidateTemplate(template, requiredSelectors) {
  const clone = template.content.cloneNode(true);
  const missing = requiredSelectors.filter(sel => !clone.querySelector(sel));
  if (missing.length > 0) {
    console.error(`Template missing required elements: ${missing.join(', ')}`);
    return null;
  }
  return clone;
}

// 使用例
const clone = cloneAndValidateTemplate(template, [
  '.project-card',
  '.card-visual-header',
  '.card-visual-icon',
  'h3',
  'p',
  'a'
]);
if (!clone) return; // テンプレート不正の場合はスキップ
```

---

### 4-5. 🟡 グローバルエラーハンドラーの追加

| 項目 | 内容 |
|------|------|
| **問題/リスク** | キャッチされない例外やPromise rejectionがコンソールにのみ出力され、ユーザーは白い画面や壊れたUIを見ることになる。 |
| **提案** | `window.onerror` と `window.onunhandledrejection` を設定してユーザーフレンドリーなフォールバック表示を行う |
| **信頼性への影響** | ⭐⭐⭐ — ユーザー体験の最低保証 |
| **工数** | **S**（30分） |

**実装詳細:**

```javascript
// assets/js/error-handler.js（全HTMLの先頭で読み込む）
window.addEventListener('error', (event) => {
  console.error('[Global Error]', event.message, event.filename, event.lineno);
  // CDN読み込み失敗のスクリプトエラーを検出
  if (event.target?.tagName === 'SCRIPT') {
    console.warn('External script failed to load:', event.target.src);
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', event.reason);
});
```

---

## 5. モニタリング & アラート

### 5-1. 🟡 アップタイムモニタリング

| 項目 | 内容 |
|------|------|
| **問題/リスク** | サイトの稼働状況を監視する仕組みがない。GitHub Pages に障害が発生しても気づけない。 |
| **提案** | 無料のアップタイム監視サービスを導入する |
| **信頼性への影響** | ⭐⭐⭐ — ダウンタイムの早期検知 |
| **工数** | **S**（15分） |

**推奨サービス（無料枠で十分）:**

| サービス | 監視間隔 | 無料枠 |
|---------|---------|--------|
| **UptimeRobot** | 5分 | 50モニタ |
| **Freshping** | 1分 | 50モニタ |
| **GitHub Actions cron** | 5分 | 月2000分 |

**GitHub Actions による最小構成:**

```yaml
# .github/workflows/uptime.yml
name: ⏰ Uptime Check
on:
  schedule:
    - cron: '*/15 * * * *'  # 15分ごと

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Check site availability
        run: |
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://studio344.net/)
          if [ "$STATUS" != "200" ]; then
            echo "❌ Site returned $STATUS"
            exit 1
          fi
          echo "✅ Site is up (HTTP $STATUS)"
```

---

### 5-2. 🟢 Lighthouse CI によるパフォーマンスモニタリング

| 項目 | 内容 |
|------|------|
| **問題/リスク** | パフォーマンスのリグレッションが検出されない。新しい記事やコード変更によるレンダリング速度低下を把握できない。 |
| **提案** | Lighthouse CI を定期実行し、スコアの閾値下回りでアラートする |
| **信頼性への影響** | ⭐⭐ — パフォーマンス品質の長期的維持 |
| **工数** | **M**（1〜2時間） |

---

### 5-3. 🟢 Google Search Console 異常アラート

| 項目 | 内容 |
|------|------|
| **問題/リスク** | クロールエラー、インデックスの問題が見逃される。 |
| **提案** | Google Search Console のメール通知を有効にし、定期的に確認するプロセスを策定する |
| **信頼性への影響** | ⭐⭐ — SEO毀損の早期検知 |
| **工数** | **S**（15分） |

---

## 6. コンテンツ整合性チェック

### 6-1. 🔴 `list.json` とマークダウンファイルの整合性検証

| 項目 | 内容 |
|------|------|
| **問題/リスク** | `list.json` に記載された `baseFilename` に対応する `.ja.md` / `.en.md` ファイルが実際に存在するかチェックされていない。ファイル名の誤記やファイル追加忘れで、ブログ記事が表示されなくなる。逆に `list.json` に登録し忘れた記事は永久に表示されない。 |
| **提案** | CI で双方向の整合性チェックスクリプトを実行する |
| **信頼性への影響** | ⭐⭐⭐⭐⭐ — ブログシステムの根幹的な信頼性確保 |
| **工数** | **S**（1時間） |

**実装詳細:**

```javascript
// scripts/check-content-integrity.js
const fs = require('fs');
const path = require('path');

const postsDir = 'assets/posts';
const listJson = JSON.parse(fs.readFileSync(path.join(postsDir, 'list.json'), 'utf8'));

let errors = [];

// 1. list.json → ファイル存在チェック
listJson.forEach(post => {
  ['ja', 'en'].forEach(lang => {
    const filename = `${post.baseFilename}.${lang}.md`;
    const filepath = path.join(postsDir, filename);
    if (!fs.existsSync(filepath)) {
      errors.push(`❌ list.json に登録済みだがファイルが存在しない: ${filename}`);
    }
  });

  // ID の一意性チェック
  const duplicates = listJson.filter(p => p.id === post.id);
  if (duplicates.length > 1) {
    errors.push(`❌ 重複するID: ${post.id}`);
  }
});

// 2. ファイル → list.json 登録チェック（逆方向）
const mdFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
const registeredBases = new Set(listJson.map(p => p.baseFilename));

mdFiles.forEach(file => {
  const base = file.replace(/\.(ja|en)\.md$/, '');
  if (!registeredBases.has(base)) {
    errors.push(`⚠️ ファイルは存在するが list.json に未登録: ${file}`);
  }
});

// 3. 日付の降順チェック（最新が先頭であることを保証）
for (let i = 1; i < listJson.length; i++) {
  if (listJson[i].date > listJson[i - 1].date) {
    errors.push(`⚠️ 日付順序の不整合: ${listJson[i].id} (${listJson[i].date}) が ${listJson[i-1].id} (${listJson[i-1].date}) より新しい`);
  }
}

if (errors.length > 0) {
  console.error('\\nコンテンツ整合性チェック失敗:\\n');
  errors.forEach(e => console.error(e));
  process.exit(1);
} else {
  console.log('✅ コンテンツ整合性チェック通過');
}
```

---

### 6-2. 🟡 `sitemap.xml` と実際のページ/記事の整合性チェック

| 項目 | 内容 |
|------|------|
| **問題/リスク** | `sitemap.xml` は手動管理されており、新しいブログ記事を追加しても `sitemap.xml` の更新を忘れることがある。また、削除されたページが sitemap に残る可能性もある（ゴーストURL）。現在8記事が `list.json` に登録されているが、sitemapとの一致は手動で確認するしかない。 |
| **提案** | CI で sitemap と実際のファイル/記事の整合性を自動チェックする |
| **信頼性への影響** | ⭐⭐⭐ — SEO品質の維持 |
| **工数** | **S**（1時間） |

**実装詳細:**

```javascript
// scripts/check-sitemap.js
const fs = require('fs');

const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
const listJson = JSON.parse(fs.readFileSync('assets/posts/list.json', 'utf8'));

let errors = [];

// ブログ記事が sitemap に含まれているかチェック
listJson.forEach(post => {
  const expectedUrl = `https://studio344.net/blog.html#post/${post.id}`;
  if (!sitemap.includes(expectedUrl)) {
    errors.push(`❌ sitemap.xml に未登録のブログ記事: ${post.id} (${expectedUrl})`);
  }
});

// HTMLファイルの存在チェック
const htmlFiles = [
  'index.html', 'about.html', 'contact.html',
  'projects.html', 'blog.html', 'privacy-policy.html', 'terms.html'
];
htmlFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const expectedUrl = `https://studio344.net/${file === 'index.html' ? '' : file}`;
    if (!sitemap.includes(expectedUrl)) {
      errors.push(`⚠️ sitemap.xml に未登録の HTML ページ: ${file}`);
    }
  }
});

if (errors.length > 0) {
  console.error('\\nSitemap 整合性チェック失敗:\\n');
  errors.forEach(e => console.error(e));
  process.exit(1);
} else {
  console.log('✅ Sitemap 整合性チェック通過');
}
```

---

### 6-3. 🟡 著作権年のハードコード排除

| 項目 | 内容 |
|------|------|
| **問題/リスク** | `ui.js` で `copyright-year` を動的に設定しているが、HTML フッターにハードコードされた年が残っている可能性がある。万が一 JS の読み込みに失敗した場合、古い年が表示され続ける。 |
| **提案** | HTML フッター内のデフォルト値を動的年に一元化し、JS 失敗時のフォールバック表示を明確にする |
| **信頼性への影響** | ⭐⭐ — 小さいがプロフェッショナリズムに影響 |
| **工数** | **S**（15分） |

**実装詳細:**

```html
<!-- フッターのテンプレート -->
<span id="copyright-year">2026</span>
<!-- ↑ サーバーサイドレンダリングがないため、HTML内のデフォルト値を毎年手動更新が必要 -->
<!-- CI で年チェックを追加: -->
```

```yaml
# CI 内
- name: 📅 Copyright Year Check
  run: |
    CURRENT_YEAR=$(date +%Y)
    grep -r "copyright-year" *.html | grep -q "$CURRENT_YEAR" || {
      echo "⚠️ Copyright year may be outdated"
    }
```

---

## 7. 依存関係管理 & アップデート戦略

### 7-1. 🔴 外部 CDN 依存関係のバージョン固定 & SRI 管理

| 項目 | 内容 |
|------|------|
| **問題/リスク** | 外部ライブラリ（i18next, marked, DOMPurify, Prism.js）のバージョンが HTML 内にハードコードされている。SRI ハッシュも手動管理。バージョン更新時の SRI 再計算忘れでスクリプト読み込み失敗の可能性がある。また CDN の URL が分散しており（`blog.html` 内、`blog.js` 内など）、管理が困難。 |
| **提案** | 依存関係の一元管理ファイルを作成し、SRI 更新を自動化する |
| **信頼性への影響** | ⭐⭐⭐⭐ — CDN依存の管理コスト削減と更新安全性向上 |
| **工数** | **M**（2時間） |

**実装詳細:**

```json
// dependencies.json — 一元管理ファイル
{
  "cdn": {
    "i18next": {
      "version": "23.16.8",
      "url": "https://cdnjs.cloudflare.com/ajax/libs/i18next/23.16.8/i18next.min.js",
      "sri": "sha384-...",
      "global": "i18next"
    },
    "marked": {
      "version": "15.0.6",
      "url": "https://cdnjs.cloudflare.com/ajax/libs/marked/15.0.6/marked.min.js",
      "sri": "sha384-...",
      "global": "marked"
    },
    "dompurify": {
      "version": "3.2.4",
      "url": "https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.2.4/purify.min.js",
      "sri": "sha384-...",
      "global": "DOMPurify"
    }
  }
}
```

```yaml
# .github/workflows/dependency-check.yml
name: 🔄 Dependency Update Check
on:
  schedule:
    - cron: '0 9 * * 1'  # 毎週月曜 9:00 UTCe

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check for CDN updates
        run: |
          # cdnjs API で最新バージョンをチェック
          for lib in i18next marked dompurify; do
            LATEST=$(curl -s "https://api.cdnjs.com/libraries/$lib?fields=version" | jq -r '.version')
            echo "$lib: latest=$LATEST"
          done
```

---

### 7-2. 🟡 Dependabot / Renovate の設定（将来の npm 依存用）

| 項目 | 内容 |
|------|------|
| **問題/リスク** | 今後 `package.json` が導入された場合（husky, lint-staged, html-validate 等）、npm パッケージのセキュリティアップデートが放置される可能性がある。 |
| **提案** | Dependabot を設定し、自動PR作成を有効化する |
| **信頼性への影響** | ⭐⭐⭐ — セキュリティ脆弱性の自動検出 |
| **工数** | **S**（15分） |

**実装詳細:**

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    labels:
      - "dependencies"
      - "automated"

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "ci"
      - "automated"
```

---

## 8. プリデプロイ チェックリスト自動化

### 8-1. 🔴 自動化されたプリデプロイチェックリスト

| 項目 | 内容 |
|------|------|
| **問題/リスク** | 新しいブログ記事やプロジェクト追加時に複数のファイルを同時に更新する必要がある（`list.json`、`.ja.md`、`.en.md`、`sitemap.xml`）。1つでも忘れるとブログシステムが不整合状態になる。このヒューマンエラーのリスクが現在完全にガードされていない。 |
| **提案** | GitHub Actions CI でプリデプロイチェックを統合実行する |
| **信頼性への影響** | ⭐⭐⭐⭐⭐ — コンテンツ更新時のヒューマンエラーを体系的に防止 |
| **工数** | **M**（2時間） |

**統合チェックスクリプト:**

```javascript
// scripts/pre-deploy-check.js
const fs = require('fs');
const path = require('path');

console.log('🚀 プリデプロイチェック開始...\n');

let allPassed = true;
const results = [];

function check(name, fn) {
  try {
    const result = fn();
    if (result === true) {
      results.push(`✅ ${name}`);
    } else {
      results.push(`❌ ${name}: ${result}`);
      allPassed = false;
    }
  } catch (e) {
    results.push(`❌ ${name}: ${e.message}`);
    allPassed = false;
  }
}

// 1. JSON パース可能性チェック
check('list.json パース', () => {
  JSON.parse(fs.readFileSync('assets/posts/list.json', 'utf8'));
  return true;
});

check('projects.json パース', () => {
  JSON.parse(fs.readFileSync('projects.json', 'utf8'));
  return true;
});

check('locales/ja.json パース', () => {
  JSON.parse(fs.readFileSync('locales/ja.json', 'utf8'));
  return true;
});

check('locales/en.json パース', () => {
  JSON.parse(fs.readFileSync('locales/en.json', 'utf8'));
  return true;
});

// 2. ブログ記事整合性
check('ブログ記事ファイル整合性', () => {
  const posts = JSON.parse(fs.readFileSync('assets/posts/list.json', 'utf8'));
  const missing = [];
  posts.forEach(post => {
    ['ja', 'en'].forEach(lang => {
      const file = path.join('assets/posts', `${post.baseFilename}.${lang}.md`);
      if (!fs.existsSync(file)) missing.push(file);
    });
  });
  return missing.length === 0 ? true : `不足ファイル: ${missing.join(', ')}`;
});

// 3. locale キーの対称性
check('locale キー対称性', () => {
  const ja = Object.keys(flatten(JSON.parse(fs.readFileSync('locales/ja.json', 'utf8'))));
  const en = Object.keys(flatten(JSON.parse(fs.readFileSync('locales/en.json', 'utf8'))));
  const jaOnly = ja.filter(k => !en.includes(k));
  const enOnly = en.filter(k => !ja.includes(k));
  if (jaOnly.length === 0 && enOnly.length === 0) return true;
  let msg = '';
  if (jaOnly.length) msg += `ja のみ: ${jaOnly.join(', ')}. `;
  if (enOnly.length) msg += `en のみ: ${enOnly.join(', ')}`;
  return msg;
});

// 4. sitemap 整合性
check('sitemap ブログ記事整合性', () => {
  const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
  const posts = JSON.parse(fs.readFileSync('assets/posts/list.json', 'utf8'));
  const missing = posts.filter(p => !sitemap.includes(`#post/${p.id}`));
  return missing.length === 0 ? true : `sitemap 未登録: ${missing.map(p => p.id).join(', ')}`;
});

// ヘルパー: オブジェクトのフラット化
function flatten(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [key, val]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      return { ...acc, ...flatten(val, newKey) };
    }
    return { ...acc, [newKey]: val };
  }, {});
}

// 結果出力
console.log(results.join('\n'));
console.log(`\n${allPassed ? '🎉 全チェック通過！デプロイOK' : '🚨 チェック失敗あり。修正が必要です。'}`);

if (!allPassed) process.exit(1);
```

---

### 8-2. 🟡 新規ブログ記事追加スキャフォルドスクリプト

| 項目 | 内容 |
|------|------|
| **問題/リスク** | ブログ記事追加時に手動で `list.json` 編集、`.ja.md` / `.en.md` ファイル作成、sitemap 更新が必要。手順が多く、ミスの温床となる。 |
| **提案** | 対話型の記事作成スクリプトで全ファイルを一括生成する |
| **信頼性への影響** | ⭐⭐⭐ — ヒューマンエラーの根本的排除 |
| **工数** | **M**（1〜2時間） |

**実装詳細:**

```javascript
// scripts/new-post.js
// 使用法: node scripts/new-post.js <id> <emoji> <tags>
// 例:     node scripts/new-post.js "my-new-post" "🚀" "Next.js,React"

const fs = require('fs');
const path = require('path');

const [,, id, emoji = '📝', tagsStr = ''] = process.argv;
if (!id) { console.error('Usage: node scripts/new-post.js <id> [emoji] [tags]'); process.exit(1); }

const today = new Date();
const dateFormatted = `${today.getFullYear()}.${String(today.getMonth()+1).padStart(2,'0')}.${String(today.getDate()).padStart(2,'0')}`;
const fileDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
const baseFilename = `${fileDate}-${id}`;
const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()) : [];

// 1. Markdown テンプレート作成
const mdTemplate = (lang) => `# ${id}

${lang === 'ja' ? 'ここに記事本文を書いてください。' : 'Write your article here.'}
`;

['ja', 'en'].forEach(lang => {
  const filepath = path.join('assets/posts', `${baseFilename}.${lang}.md`);
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, mdTemplate(lang));
    console.log(`✅ 作成: ${filepath}`);
  }
});

// 2. list.json 更新
const listPath = 'assets/posts/list.json';
const list = JSON.parse(fs.readFileSync(listPath, 'utf8'));
const newEntry = { id, date: dateFormatted, baseFilename, emoji, tags };
list.unshift(newEntry);  // 先頭に追加（最新順）
fs.writeFileSync(listPath, JSON.stringify(list, null, 4) + '\n');
console.log(`✅ list.json 更新: ${id} を追加`);

// 3. sitemap.xml 更新
const sitemapPath = 'sitemap.xml';
let sitemap = fs.readFileSync(sitemapPath, 'utf8');
const sitemapEntry = `  <url>
    <loc>https://studio344.net/blog.html#post/${id}</loc>
    <lastmod>${fileDate}</lastmod>
    <priority>0.7</priority>
  </url>`;
sitemap = sitemap.replace('</urlset>', `${sitemapEntry}\n</urlset>`);
fs.writeFileSync(sitemapPath, sitemap);
console.log(`✅ sitemap.xml 更新: ${id} を追加`);

console.log(`\n🎉 新規記事 "${id}" のスキャフォルド完了！`);
console.log(`📝 以下のファイルを編集してください:`);
console.log(`   - assets/posts/${baseFilename}.ja.md`);
console.log(`   - assets/posts/${baseFilename}.en.md`);
```

---

## 9. ロールバック戦略

### 9-1. 🔴 GitHub Pages デプロイ即時ロールバック手順

| 項目 | 内容 |
|------|------|
| **問題/リスク** | デプロイ後に問題が発覚した場合、ロールバック手順が定義されていない。GitHub Pages は `main` ブランチの最新コミットを自動的にデプロイするため、`git revert` や `git reset` での対応が必要だが、パニック時に手順を覚えていないリスクがある。 |
| **提案** | ロールバック手順を文書化し、ワンコマンドのロールバックスクリプトを用意する |
| **信頼性への影響** | ⭐⭐⭐⭐ — MTTR（平均復旧時間）の大幅短縮 |
| **工数** | **S**（30分） |

**実装詳細:**

```bash
#!/bin/bash
# scripts/rollback.sh — 緊急ロールバックスクリプト
# 使用法: ./scripts/rollback.sh [コミット数]
#   デフォルト: 直前の1コミットを revert

set -e

COMMITS=${1:-1}
BRANCH=$(git branch --show-current)

if [ "$BRANCH" != "main" ]; then
  echo "❌ main ブランチにいません。現在: $BRANCH"
  exit 1
fi

echo "⚠️ 直近 $COMMITS コミットを revert します。"
echo "📋 対象コミット:"
git log --oneline -n "$COMMITS"
echo ""
read -p "続行しますか？ (y/N): " confirm
if [ "$confirm" != "y" ]; then
  echo "中断しました。"
  exit 0
fi

# Revert（コミットを逆順で revert）
for i in $(seq 1 "$COMMITS"); do
  git revert --no-edit HEAD~$((i-1))
done

echo "✅ Revert 完了。git push で反映してください。"
echo "   git push origin main"
```

**ロールバック手順書（ドキュメント）:**

```
🚨 緊急ロールバック手順

1. 問題の確認
   - サイトにアクセスして問題を目視確認
   - ブラウザの DevTools > Console でエラー確認

2. 原因特定
   - git log --oneline -5  で最近のコミットを確認
   - 問題を引き起こしたコミットを特定

3. ロールバック実行
   方法A（推奨: revert）:
     git revert <問題のコミットハッシュ>
     git push origin main

   方法B（緊急: force push）:
     git reset --hard <正常なコミットハッシュ>
     git push --force origin main
     ⚠️ 注意: 他の人のコミットが失われる可能性あり

4. 確認
   - GitHub Actions のデプロイ完了を待つ（約1〜2分）
   - サイトの正常動作を確認
```

---

### 9-2. 🟡 デプロイ前の自動スナップショット

| 項目 | 内容 |
|------|------|
| **問題/リスク** | デプロイ前の状態を素早く参照できない。 |
| **提案** | デプロイ前にタグを自動作成し、いつでも任意の時点に戻れるようにする |
| **信頼性への影響** | ⭐⭐⭐ — ロールバック対象の明確化 |
| **工数** | **S**（15分） |

**実装詳細:**

```yaml
# deploy.yml 内
- name: 🏷️ Tag deployment
  run: |
    TAG="deploy-$(date +%Y%m%d-%H%M%S)"
    git tag "$TAG"
    git push origin "$TAG"
```

---

## 10. Sitemap／SEO 自動化

### 10-1. 🔴 `sitemap.xml` 自動生成

| 項目 | 内容 |
|------|------|
| **問題/リスク** | `sitemap.xml` が完全に手動管理されている。現在、`list.json` に8記事、sitemapにも8記事登録されているが、記事追加時のsitemap更新忘れが確実に発生し得る。ブログ記事はハッシュフラグメント（`#post/xxx`）による SPA ルーティングのため、通常のクローラーはこれらを別ページとして認識しない可能性もある。 |
| **提案** | CI/プリデプロイ時に `list.json` + ファイルシステムから `sitemap.xml` を自動生成する |
| **信頼性への影響** | ⭐⭐⭐⭐ — SEO整合性の完全自動化 |
| **工数** | **M**（1〜2時間） |

**実装詳細:**

```javascript
// scripts/generate-sitemap.js
const fs = require('fs');

const DOMAIN = 'https://studio344.net';
const today = new Date().toISOString().split('T')[0];

// 静的ページ定義
const staticPages = [
  { path: '/', priority: '1.0' },
  { path: '/about.html', priority: '0.8' },
  { path: '/contact.html', priority: '0.8' },
  { path: '/projects.html', priority: '0.9' },
  { path: '/blog.html', priority: '0.8' },
  { path: '/projects/ucfitness.html', priority: '0.9' },
  { path: '/projects/portfolio.html', priority: '0.7' },
  { path: '/privacy-policy.html', priority: '0.5' },
  { path: '/terms.html', priority: '0.5' },
];

// ブログ記事を list.json から取得
const posts = JSON.parse(fs.readFileSync('assets/posts/list.json', 'utf8'));

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

// 静的ページ
staticPages.forEach(page => {
  xml += `
  <url>
    <loc>${DOMAIN}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <priority>${page.priority}</priority>
  </url>`;
});

// ブログ記事
xml += '\n\n  <!-- ブログ記事（自動生成） -->';
posts.forEach(post => {
  // list.json の日付は "YYYY.MM.DD" → "YYYY-MM-DD" に変換
  const lastmod = post.date.replace(/\./g, '-');
  xml += `
  <url>
    <loc>${DOMAIN}/blog.html#post/${post.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>0.7</priority>
  </url>`;
});

xml += '\n</urlset>\n';

fs.writeFileSync('sitemap.xml', xml);
console.log(`✅ sitemap.xml 生成完了（${staticPages.length} ページ + ${posts.length} 記事）`);
```

```yaml
# CI 内で自動生成&コミット
- name: 🗺️ Generate Sitemap
  run: node scripts/generate-sitemap.js

- name: Check for sitemap changes
  run: |
    if git diff --quiet sitemap.xml; then
      echo "No sitemap changes"
    else
      echo "⚠️ sitemap.xml is outdated. Run: node scripts/generate-sitemap.js"
      exit 1
    fi
```

---

### 10-2. 🟡 SEO メタデータ自動検証

| 項目 | 内容 |
|------|------|
| **問題/リスク** | 各HTMLページの `<title>`、`<meta description>`、OGP タグ、構造化データ (JSON-LD) が適切に設定されているか自動チェックがない。新しいページ追加時にメタデータの記載漏れが起きやすい。 |
| **提案** | CI で全 HTML の SEO メタデータを検証するスクリプトを追加 |
| **信頼性への影響** | ⭐⭐⭐ — ソーシャルメディア共有時の表示品質保証 |
| **工数** | **S**（1時間） |

**実装詳細:**

```javascript
// scripts/check-seo-meta.js
const fs = require('fs');
const path = require('path');

const htmlFiles = [
  'index.html', 'about.html', 'blog.html',
  'contact.html', 'projects.html', 'privacy-policy.html',
  'terms.html', 'projects/portfolio.html', 'projects/ucfitness.html'
];

const requiredMeta = [
  { name: 'title', regex: /<title>[^<]+<\/title>/ },
  { name: 'meta description', regex: /<meta\s+name="description"\s+content="[^"]+"\s*\/?>/i },
  { name: 'og:title', regex: /<meta\s+property="og:title"\s+content="[^"]+"\s*\/?>/i },
  { name: 'og:description', regex: /<meta\s+property="og:description"\s+content="[^"]+"\s*\/?>/i },
  { name: 'canonical', regex: /<link\s+rel="canonical"\s+href="[^"]+"\s*\/?>/i },
];

let errors = [];

htmlFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    errors.push(`⚠️ ファイルが存在しない: ${file}`);
    return;
  }
  const html = fs.readFileSync(file, 'utf8');
  requiredMeta.forEach(meta => {
    if (!meta.regex.test(html)) {
      errors.push(`❌ ${file}: ${meta.name} が見つからない`);
    }
  });
});

if (errors.length > 0) {
  console.error('\\nSEO メタデータチェック失敗:\\n');
  errors.forEach(e => console.error(e));
  process.exit(1);
} else {
  console.log(`✅ SEO メタデータチェック通過 (${htmlFiles.length} ファイル検証済み)`);
}
```

---

## 📊 優先度別サマリー

### 🔴 High Priority（即対応推奨）— 合計工数: M〜L

| # | 提案 | 工数 | 影響度 |
|---|------|------|--------|
| 1-1 | GitHub Actions CI パイプライン | M | ⭐⭐⭐⭐⭐ |
| 1-2 | CI ゲート付きデプロイ自動化 | S | ⭐⭐⭐⭐⭐ |
| 2-1 | HTML バリデーション | S | ⭐⭐⭐⭐ |
| 2-2 | リンクチェック | S | ⭐⭐⭐⭐ |
| 3-1 | ブランチ保護ルール | S | ⭐⭐⭐⭐⭐ |
| 4-1 | fetch() レスポンスチェック | S | ⭐⭐⭐⭐ |
| 4-2 | CDN フォールバック | M | ⭐⭐⭐⭐⭐ |
| 6-1 | list.json ↔ MD ファイル整合性チェック | S | ⭐⭐⭐⭐⭐ |
| 7-1 | CDN 依存関係一元管理 | M | ⭐⭐⭐⭐ |
| 8-1 | プリデプロイチェックリスト | M | ⭐⭐⭐⭐⭐ |
| 9-1 | ロールバック手順・スクリプト | S | ⭐⭐⭐⭐ |
| 10-1 | sitemap.xml 自動生成 | M | ⭐⭐⭐⭐ |

### 🟡 Medium Priority（早期対応推奨）— 合計工数: M

| # | 提案 | 工数 | 影響度 |
|---|------|------|--------|
| 2-3 | アクセシビリティテスト | M | ⭐⭐⭐ |
| 2-4 | JSON スキーマバリデーション | S | ⭐⭐⭐⭐ |
| 3-2 | プリコミットフック | S | ⭐⭐⭐ |
| 3-3 | ファイルサイズ監視 | S | ⭐⭐ |
| 4-3 | i18n.js パス解決の堅牢化 | S | ⭐⭐⭐⭐ |
| 4-4 | テンプレートクローン nullチェック | S | ⭐⭐⭐ |
| 4-5 | グローバルエラーハンドラー | S | ⭐⭐⭐ |
| 5-1 | アップタイムモニタリング | S | ⭐⭐⭐ |
| 6-2 | sitemap ↔ ページ整合性チェック | S | ⭐⭐⭐ |
| 6-3 | 著作権年ハードコード排除 | S | ⭐⭐ |
| 7-2 | Dependabot 設定 | S | ⭐⭐⭐ |
| 8-2 | 記事スキャフォルドスクリプト | M | ⭐⭐⭐ |
| 9-2 | デプロイ前タグ自動作成 | S | ⭐⭐⭐ |
| 10-2 | SEO メタデータ自動検証 | S | ⭐⭐⭐ |

### 🟢 Low Priority（余裕時に対応）— 合計工数: S〜M

| # | 提案 | 工数 | 影響度 |
|---|------|------|--------|
| 5-2 | Lighthouse CI 定期監視 | M | ⭐⭐ |
| 5-3 | Search Console アラート | S | ⭐⭐ |

---

## 🗺️ 推奨実装ロードマップ

```
Phase 1 — 基盤構築（1〜2日）
├── 3-1: ブランチ保護ルール設定
├── 1-1: GitHub Actions CI 基本構成
├── 1-2: CI ゲート付きデプロイ
├── 4-1: fetch() のレスポンスチェック修正
└── 9-1: ロールバック手順書作成

Phase 2 — バリデーション強化（1日）
├── 2-1: HTML バリデーション導入
├── 2-2: リンクチェック導入
├── 2-4: JSON スキーマ定義＆検証
├── 6-1: コンテンツ整合性チェック
└── 6-2: sitemap 整合性チェック

Phase 3 — 自動化＆DX向上（1〜2日）
├── 10-1: sitemap 自動生成
├── 8-1: プリデプロイチェックリスト統合
├── 8-2: 記事スキャフォルドスクリプト
├── 4-2: CDN フォールバック実装
└── 4-3: i18n.js パス解決改善

Phase 4 — 監視＆継続改善（随時）
├── 5-1: アップタイムモニタリング
├── 7-1: CDN 依存関係一元管理
├── 7-2: Dependabot 設定
├── 2-3: アクセシビリティテスト
└── 5-2: Lighthouse CI 定期監視
```

---

> **📝 補足:** 本提案書の全てのスクリプト・設定は、ビルドシステムなしの静的サイト構成を前提としています。将来的に Vite や Astro などの SSG を導入する場合は、多くのチェック機構がビルドプロセスに統合可能です。
