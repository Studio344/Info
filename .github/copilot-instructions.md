---
applyTo: '**'
---

# Studio344 ポートフォリオサイト — Copilot Instructions

> **サイト:** https://studio344.net  
> **ホスティング:** GitHub Pages（静的サイト）  
> **リポジトリ:** Studio344/Info_Studio344

---

## 🏗️ プロジェクト概要

個人エンジニアのポートフォリオ＆技術ブログサイト。  
ビルドツール・フレームワークなしの **Vanilla HTML/CSS/JS** 構成。  
i18next によるクライアントサイド多言語切替（日本語 / 英語）を採用。

### 技術スタック
- **マークアップ:** HTML5（セマンティック）
- **スタイル:** CSS3（カスタムプロパティ / Grid / Flexbox）
- **スクリプト:** Vanilla JavaScript（ES2020+）
- **i18n:** i18next + i18next-http-backend（CDN）
- **ブログ:** Markdown → marked.js → DOMPurify → innerHTML
- **構文ハイライト:** Prism.js（遅延ロード）
- **広告:** Google AdSense
- **SEO:** JSON-LD 構造化データ / OGP / Twitter Card / hreflang / sitemap.xml

---

## 📁 ディレクトリ構造 & ファイル役割

```
/
├── index.html           # トップページ（Hero + Bento Grid）
├── about.html           # プロフィールページ
├── blog.html            # ブログ一覧 & 記事表示（SPA的ハッシュルーティング）
├── projects.html        # プロジェクト一覧
├── contact.html         # SNSリンク集
├── privacy-policy.html  # プライバシーポリシー
├── terms.html           # 利用規約
├── 404.html             # カスタム404ページ
├── styles.css           # 全ページ共通スタイル（単一ファイル）
├── script.js            # トップ & プロジェクト用JS
├── blog.js              # ブログ専用JS（記事レンダリング・TOC・検索等）
├── i18n.js              # i18next 初期化 & 言語切替ロジック
├── projects.json        # プロジェクトデータ
├── sitemap.xml          # サイトマップ（手動管理）
├── robots.txt           # クローラー制御
├── ads.txt              # AdSense 認証
├── assets/
│   ├── js/
│   │   └── ui.js        # 共通UI（ヘッダー制御・スクロール・タイピング等）
│   └── posts/
│       ├── list.json    # ブログ記事マニフェスト
│       └── *.md         # 記事本文（{date}-{slug}.{lang}.md）
├── locales/
│   ├── ja.json          # 日本語翻訳
│   └── en.json          # 英語翻訳
├── projects/
│   ├── portfolio.html   # ポートフォリオ詳細
│   └── ucfitness.html   # UCFitness 詳細
└── docs/                # 技術ドキュメント（サイト監査ログ等）
```

---

## 📐 コーディング規約

### HTML
- **セマンティック要素**を使用（`<main>`, `<nav>`, `<section>`, `<article>`, `<footer>`）
- 全ページに `<a href="#main-content" class="skip-link">` を含める
- `body` に `data-page="ページ名"` 属性（ナビのアクティブ状態に使用）
- 外部リンクには `target="_blank" rel="noopener noreferrer"` を必ず付与
- 装飾SVGには `aria-hidden="true"`、機能SVGには `aria-label` を付与
- i18n 対象テキストには `data-i18n="キー名"` 属性を設定
- `<img>` には必ず `width`, `height`, `alt`, `loading="lazy"` を含める

### CSS
- **CSS カスタムプロパティ（`:root`）** を使用 — ハードコード値禁止
- カラー: `--accent-primary`, `--accent-secondary`, `--accent-tertiary`, `--text-primary`, `--text-secondary` 等
- フォント: `--font-main`, `--font-heading`, `--font-ja`, `--font-logo`, `--font-mono`
- サイズ: `--text-xs` 〜 `--text-lg`, `--radius-sm/md/lg`
- **WCAG AA コントラスト比 4.5:1** 以上を維持（`#030303` 背景基準）
- `!important` は原則禁止（例外: `prefers-reduced-motion` のアニメーション無効化のみ）
- インラインスタイル禁止 → CSSクラスを使用
- `.scroll-reveal` クラスで IntersectionObserver アニメーション
- レスポンシブ: モバイル → タブレット(769-1024px) → デスクトップ の3段階

### 📱 モバイル対応（必須）
すべての変更はモバイル表示（375px〜）で崩れないことを確認してから完了とすること。
- **横スクロール禁止設計** — `overflow-x: hidden` に頼らず、はみ出しの原因を修正する
- **タッチターゲット** — ボタン・リンクの最小タップ領域 **44×44px** を厳守
- **フォントサイズ** — CJK テキスト最小 **14px** / 英文最小 **12px**
- **画像** — `max-width: 100%` + `height: auto` で親コンテナからのはみ出し禁止
- **テーブル** — モバイルでは `overflow-x: auto` ラッパーで横スクロール可能にする
- **入力欄** — `font-size: 16px` 以上（iOS のオートズーム防止）
- **モーダル/メニュー** — `100dvh` を活用し、アドレスバー表示/非表示に対応
- **Grid/Flexbox** — モバイルでは `grid-template-columns: 1fr` or `flex-direction: column` にフォールバック
- **メディアクエリ** — **モバイルファースト**（`min-width` ベース）で記述。既存が `max-width` の場合は整合性を維持

### JavaScript
- `"use strict"` は不要（ES modules でないため暗黙的ではないが、現在の構成で統一）
- DOM 操作は `DOMContentLoaded` 内で実行
- `fetch()` は必ず `response.ok` チェック + `catch` でエラーハンドリング
- `innerHTML` 使用時は **DOMPurify サニタイズ必須**（`textContent` 優先）
- イベントリスナーの `scroll` には `{ passive: true }` を付与
- 高頻度イベント（`mousemove`, `scroll`）は `requestAnimationFrame` でスロットリング

---

## 📝 ブログ記事の追加手順

新しいブログ記事を追加する際は、以下の**3ファイル**を更新する:

### 1. Markdown ファイル（2つ）
```
assets/posts/{YYYY-MM-DD}-{slug}.ja.md   # 日本語版
assets/posts/{YYYY-MM-DD}-{slug}.en.md   # 英語版
```
- ファイル先頭は `# タイトル` で開始（このh1がタイトルとして抽出される）
- コードブロックには言語指定を必ず付ける（Prism.js 連携）

### 2. 記事マニフェスト
`assets/posts/list.json` の**先頭**に新エントリを追加:
```json
{
    "id": "slug-name",
    "date": "YYYY.MM.DD",
    "baseFilename": "YYYY-MM-DD-slug-name",
    "emoji": "🎯",
    "tags": ["Tag1", "Tag2"]
}
```

### 3. サイトマップ（手動）
`sitemap.xml` にブログ記事の URL を追加:
```xml
<url>
    <loc>https://studio344.net/blog.html#post/slug-name</loc>
    <lastmod>YYYY-MM-DD</lastmod>
    <priority>0.7</priority>
</url>
```

---

## 🌐 i18n（多言語対応）ルール

- 翻訳ファイル: `locales/ja.json` / `locales/en.json`
- **両ファイルのキー構造は完全に一致させる**（キーの追加・削除は必ず両方同時に行う）
- HTML 側: `data-i18n="セクション.キー名"` で参照
- 翻訳値に `<br>` や `<strong>` 等のHTMLが含まれる場合、`updateContent()` が `innerHTML` を使用する
  - **許可タグ:** `<br>`, `<strong>`, `<em>`, `<a>` のみ（XSSリスク軽減）
- `projects/` サブディレクトリでは i18n.js のパス解決が `../locales/` になる（`i18n.js` 内のヒューリスティック制御）

---

## 🔒 セキュリティチェックリスト

コード変更時に確認すべき項目:

- [ ] `innerHTML` を使用する場合、DOMPurify でサニタイズしているか
- [ ] 外部 CDN スクリプトに `integrity` (SRI) と `crossorigin="anonymous"` が付いているか
- [ ] 外部リンクに `rel="noopener noreferrer"` が付いているか
- [ ] `locales/*.json` に `<script>` 等の危険なHTMLが混入していないか
- [ ] 新しい CDN ドメインを追加する場合、CSP メタタグも更新したか
- [ ] API キーや秘密情報がコードに含まれていないか

---

## ⚡ パフォーマンス基準

- **Lighthouse スコア:** 85+ を目標（Performance / Accessibility / Best Practices / SEO）
- **LCP:** < 2.5s
- **CLS:** < 0.1
- **INP:** < 200ms
- スクリプトは可能な限り `defer` 属性を使用
- 画像は WebP/AVIF フォーマットを優先、`<picture>` でフォールバック
- Prism.js などの重いライブラリは**必要な時のみ遅延ロード**

---

## ♿ アクセシビリティ基準

- **WCAG 2.1 AA** 準拠
- `prefers-reduced-motion: reduce` でアニメーション無効化
- `forced-colors: active` でハイコントラストモード対応
- すべてのインタラクティブ要素にキーボードアクセス可能
- `aria-label`, `aria-expanded`, `aria-live` を適切に使用
- フォーカス表示: `:focus-visible` で `outline: 3px solid #a5b4fc`
- タッチターゲット: 最小 44×44px

---

## 🔀 Git ワークフロー

### ブランチ命名規則
| 種類 | パターン | 例 |
|------|---------|-----|
| 機能追加 | `feature/{機能名}` | `feature/rss-feed` |
| バグ修正 | `fix/{修正内容}` | `fix/mobile-menu-focus` |
| リファクタ | `refactor/{対象}` | `refactor/css-variables` |
| ドキュメント | `docs/{内容}` | `docs/api-reference` |
| 監査/改善 | `audit/{対象}` | `audit/performance` |

### コミットメッセージ
- **日本語**で記述（プロジェクトルール）
- 絵文字プレフィックス推奨:
  - ✨ 新機能 / 🐛 バグ修正 / 🎨 スタイル / ⚡ パフォーマンス
  - ♿ アクセシビリティ / 🔒 セキュリティ / 📝 ドキュメント / 🔧 設定

### 保護ルール
- `main` への直接 push 禁止
- PR 作成 → レビュー → マージの流れを遵守
- マージ前に必ずユーザー確認を取る

---

## 🧪 品質チェック（変更後に確認）

1. **HTML バリデーション:** 構文エラーがないか
2. **リンクチェック:** 内部リンク・外部リンクの疎通確認
3. **i18n 整合性:** `ja.json` と `en.json` のキーが一致しているか
4. **JSON バリデーション:** `projects.json`, `list.json` の構文
5. **レスポンシブ確認:** モバイル / タブレット / デスクトップの3画面
6. **アクセシビリティ:** キーボード操作・スクリーンリーダー対応
7. **パフォーマンス:** 不要な同期スクリプトや大きな画像がないか

---

## ⚠️ 既知の注意点

1. **GitHub Pages の制限:** カスタム HTTP ヘッダー設定不可 → CSP は `<meta>` タグで対応
2. **AdSense:** `ads.txt` の pub-ID と `<script>` 内の `client` パラメータの一致確認が必要
3. **i18n パス解決:** `projects/` 配下のページでは相対パスが `../locales/` に変わる
4. **DOMPurify フォールバック:** CDN 障害時に生HTML が挿入されるリスクあり（要改善項目）
5. **著作権年:** `<span id="copyright-year">` のフォールバック値がハードコードされている
6. **sitemap.xml:** 手動管理 → 記事追加時に更新忘れ注意
7. **styles.css:** 3955行の単一ファイル → 大規模変更時は影響範囲をグリップ検索で確認

---

## 📚 参考ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| `docs/site-audit-fixes.md` | CSS トークン・a11y 修正ログ |
| `docs/site-audit-technical-notes.md` | 包括的監査の技術学習ノート |
| `docs/site-audit-phase1-4.md` | 監査フェーズ詳細 |
| `docs/copilot-subagent-proposals.md` | 5観点の改善提案書（128項目） |

---

## 🔧 Azure 関連

- @azure Rule - Use Azure Best Practices: When generating code for Azure, running terminal commands for Azure, or performing operations related to Azure, invoke your `get_azure_best_practices` tool if available.