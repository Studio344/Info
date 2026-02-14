# 🚀 Studio344 パフォーマンス最適化提案書

> **対象サイト:** studio344.net（静的 HTML/CSS/JS ポートフォリオ）
> **ホスティング:** GitHub Pages
> **監査日:** 2026-02-14
> **作成者:** Performance Audit Bot

---

## 📋 目次

1. [クリティカルレンダリングパス最適化](#1-クリティカルレンダリングパス最適化)
2. [リソースローディング戦略](#2-リソースローディング戦略フォントスクリプトスタイル)
3. [画像最適化](#3-画像最適化)
4. [キャッシング戦略](#4-キャッシング戦略)
5. [JavaScript 最適化](#5-javascript-最適化)
6. [CSS 最適化](#6-css-最適化)
7. [ネットワークリクエスト削減](#7-ネットワークリクエスト削減)
8. [Core Web Vitals 改善](#8-core-web-vitals-改善-lcp--inp--cls)
9. [体感パフォーマンス改善](#9-体感パフォーマンス改善)

---

## 📊 現状サマリー

| 項目 | 現状 |
|------|------|
| CSS | `styles.css` 単一ファイル・3,955行（未圧縮） |
| JS ファイル数 | `ui.js`, `script.js`, `blog.js`, `i18n.js` + CDN 4本 |
| 外部フォント | Google Fonts 4ファミリー（Inter, Murecho, Russo One, Sora） |
| CDN 依存 | i18next, i18next-http-backend, marked.js, DOMPurify, Prism.js |
| ビルドツール | なし（ミニファイ/バンドル未実施） |
| Service Worker | なし |
| 画像形式 | PNG（WebP/AVIF 未使用） |
| レンダリングブロック | Google Fonts CSS, styles.css, AdSense |

---

## 1. クリティカルレンダリングパス最適化

### 🔴 P1: AdSense スクリプトの読み込み位置

- **問題:** `<head>` 内に `async` 付きの AdSense スクリプトがあるが、パーサーブロッキングではないもののDNS解決・接続・ダウンロードがFCPを遅延させる
- **現状コード:**
  ```html
  <head>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-..."
      crossorigin="anonymous"></script>
  ```
- **提案:** `<body>` 末尾に移動、または `loading="lazy"` / `afterInteractive` パターンを使用
  ```html
  <!-- </body> 直前に移動 -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-..."
    crossorigin="anonymous"></script>
  ```
- **期待効果:** FCP が 100-300ms 改善（DNS + TLS ハンドシェイクの遅延回避）
- **工数:** 🟢 S

---

### 🔴 P2: レンダリングブロック CSS（Google Fonts）

- **問題:** Google Fonts の CSS は `<link rel="stylesheet">` でロードされ、**レンダリングブロック**となる。4ファミリー × 複数ウェイト = 大量のフォントデータ
- **現状コード:**
  ```html
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Murecho:wght@400;500;600;700;800&family=Russo+One&family=Sora:wght@600;700;800&display=swap" />
  ```
- **提案A（推奨）:** `<link rel="preload">` + JS による非同期ロードに切り替え
  ```html
  <!-- ① Preload でフォント CSS を先行取得（レンダリング非ブロック） -->
  <link rel="preload" as="style"
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Murecho:wght@400;700&family=Russo+One&family=Sora:wght@700&display=swap"
    onload="this.onload=null;this.rel='stylesheet'" />
  <noscript>
    <link rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Murecho:wght@400;700&family=Russo+One&family=Sora:wght@700&display=swap" />
  </noscript>
  ```
- **提案B:** フォントウェイトを削減（Interの300,500を削除、Murechoの500,600,800を削除）
- **期待効果:** FCP 200-500ms 改善、LCP 改善
- **工数:** 🟢 S

---

### 🔴 P3: スクリプトの `defer` / ロード順序最適化

- **問題:** `<body>` 末尾に7本のスクリプトが同期的に並んでいる。i18next → i18next-http-backend → i18n.js は順序依存だが、`ui.js` と `script.js` は依存関係なしで並列ロード可能
- **現状コード:**
  ```html
  <script src="assets/js/ui.js"></script>
  <script src="script.js"></script>
  <script src="https://unpkg.com/i18next@23.2.3/i18next.min.js" ...></script>
  <script src="https://unpkg.com/i18next-http-backend@3.0.2/i18nextHttpBackend.min.js" ...></script>
  <script src="i18n.js"></script>
  ```
- **提案:**
  ```html
  <!-- 独立スクリプト: defer で並列ダウンロード + DOM順序実行 -->
  <script defer src="assets/js/ui.js"></script>

  <!-- i18next 依存チェーン: defer で順序保証 -->
  <script defer src="https://unpkg.com/i18next@23.2.3/i18next.min.js" ...></script>
  <script defer src="https://unpkg.com/i18next-http-backend@3.0.2/i18nextHttpBackend.min.js" ...></script>
  <script defer src="i18n.js"></script>
  <script defer src="script.js"></script>
  ```
- **期待効果:** HTML パース阻害の解消、TTI 100-200ms 改善
- **工数:** 🟢 S

---

## 2. リソースローディング戦略（フォント・スクリプト・スタイル）

### 🔴 P4: Google Fonts のフォントウェイト過剰読み込み

- **問題:** 4ファミリー × 合計14ウェイトをリクエスト。実際に使用しているウェイトは限定的
  - Inter: 300,400,500,600,700 → 実使用は **400, 600, 700** の3つ
  - Murecho: 400,500,600,700,800 → 実使用は **400, 700** の2つ
  - Sora: 600,700,800 → 実使用は **700** の1つ
  - Russo One: 単一ウェイト（OK）
- **提案:** 使用ウェイトのみに限定
  ```
  Inter:wght@400;600;700
  Murecho:wght@400;700
  Russo+One
  Sora:wght@700
  ```
- **期待効果:** フォントCSS レスポンスサイズ 30-50% 削減、FOIT/FOUT 時間短縮
- **工数:** 🟢 S

---

### 🟡 P5: CDN ホストの統一

- **問題:** CDN が `unpkg.com`（i18next系）と `cdn.jsdelivr.net`（marked, DOMPurify）と `cdnjs.cloudflare.com`（Prism.js）の3つに分散。DNS ルックアップが3回追加発生
- **提案:** すべて `cdn.jsdelivr.net` に統一（SRI ハッシュは再計算が必要）
  ```html
  <!-- 統一例: jsdelivr -->
  <script defer src="https://cdn.jsdelivr.net/npm/i18next@23.2.3/i18next.min.js" ...></script>
  <script defer src="https://cdn.jsdelivr.net/npm/i18next-http-backend@3.0.2/i18nextHttpBackend.min.js" ...></script>
  ```
  追加で `<link rel="preconnect">` を1つ追加:
  ```html
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
  ```
- **期待効果:** DNS ルックアップ 2回分削減 = 60-200ms 改善
- **工数:** 🟡 M（SRI ハッシュ再計算が必要）

---

### 🟡 P6: `dns-prefetch` の活用

- **問題:** 外部ドメインへの `dns-prefetch` が未設定（preconnect のみ Google Fonts 向けに設定済み）
- **提案:**
  ```html
  <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
  <link rel="dns-prefetch" href="https://unpkg.com" />
  <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
  ```
- **期待効果:** DNS 解決時間 20-100ms/ドメイン 削減
- **工数:** 🟢 S

---

## 3. 画像最適化

### 🔴 P7: 画像フォーマットの最新化（WebP / AVIF）

- **問題:** `assets/logo-black.png`（ファビコン、ヒーローロゴ）が PNG 形式。WebP/AVIF 未使用
- **提案:**
  ```html
  <!-- <picture> 要素による段階的フォールバック -->
  <picture>
    <source srcset="assets/logo-black.avif" type="image/avif" />
    <source srcset="assets/logo-black.webp" type="image/webp" />
    <img src="assets/logo-black.png" alt="Studio344 Logo" class="hero-logo"
         width="120" height="120" loading="eager" fetchpriority="high" />
  </picture>
  ```
- **期待効果:** 画像サイズ 30-80% 削減（AVIF は PNG 比で最大90%削減）
- **工数:** 🟡 M（画像変換ツールの導入が必要）

---

### 🔴 P8: 明示的な `width` / `height` 属性の付与

- **問題:** `<img>` タグに `width` / `height` が未設定 → ブラウザがレイアウト計算時にリフローを起こす → **CLS悪化**
- **現状:**
  ```html
  <img src="assets/logo-black.png" alt="Studio344 Logo" class="hero-logo" />
  ```
- **提案:**
  ```html
  <img src="assets/logo-black.png" alt="Studio344 Logo" class="hero-logo"
       width="120" height="120" />
  ```
- **期待効果:** CLS 0.05-0.1 改善
- **工数:** 🟢 S

---

### 🟡 P9: ファビコンのSVG化

- **問題:** `<link rel="icon" type="image/png">` は PNG。SVG ファビコンは解像度非依存で軽量
- **提案:**
  ```html
  <link rel="icon" type="image/svg+xml" href="assets/logo.svg" />
  <link rel="icon" type="image/png" href="assets/logo-black.png" />
  ```
- **期待効果:** 高DPIディスプレイで鮮明表示 + 若干のサイズ削減
- **工数:** 🟢 S

---

## 4. キャッシング戦略

### 🔴 P10: Service Worker の導入

- **問題:** Service Worker が未実装。リピート訪問時にすべてのリソースをネットワークから再取得
- **提案:** Stale-While-Revalidate 戦略の SW を導入
  ```javascript
  // sw.js
  const CACHE_NAME = 'studio344-v1';
  const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/styles.css',
    '/assets/js/ui.js',
    '/script.js',
    '/i18n.js',
    '/locales/ja.json',
    '/locales/en.json',
    '/projects.json',
    '/assets/posts/list.json',
    '/assets/logo-black.png',
  ];

  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
    );
  });

  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        });
        return cached || fetchPromise;
      })
    );
  });
  ```
  登録:
  ```javascript
  // index.html 末尾
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
  ```
- **期待効果:** リピート訪問時のロード時間 **50-90% 削減**、オフライン対応
- **工数:** 🟡 M

---

### 🟡 P11: GitHub Pages のキャッシュヘッダー最適化

- **問題:** GitHub Pages はデフォルトで `Cache-Control: max-age=600`（10分）。静的アセットに対して短すぎる
- **提案:** `_headers` ファイルは GitHub Pages では不可（Cloudflare Pages / Netlify なら可能）。代替:
  - Service Worker によるクライアントキャッシュ（P10で対応）
  - または、CSS/JS ファイル名にハッシュを追加してキャッシュバスティング:
    ```html
    <link rel="stylesheet" href="styles.css?v=20260214" />
    <script defer src="script.js?v=20260214"></script>
    ```
- **期待効果:** バージョン管理によるキャッシュ効率化
- **工数:** 🟢 S

---

## 5. JavaScript 最適化

### 🔴 P12: mousemove イベントのスロットリング

- **問題:** `ui.js` で `mousemove` イベントごとに CSS カスタムプロパティを更新。60fps で毎フレーム DOM スタイル更新 → 高コスト
- **現状コード:**
  ```javascript
  document.addEventListener("mousemove", (e) => {
    document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
    document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
  });
  ```
- **提案:** `requestAnimationFrame` でスロットリング
  ```javascript
  let mouseRAF = null;
  document.addEventListener("mousemove", (e) => {
    if (mouseRAF) return;
    mouseRAF = requestAnimationFrame(() => {
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
      mouseRAF = null;
    });
  }, { passive: true });
  ```
- **期待効果:** INP/FID 改善、メインスレッドブロッキング 50-70% 削減
- **工数:** 🟢 S

---

### 🟡 P13: Blog ページの不要な fetch 重複排除

- **問題:** `script.js` の `statPosts` と `showSinglePost()` 内で `assets/posts/list.json` を**複数回 fetch** している
- **提案:** シンプルなキャッシュレイヤーを導入
  ```javascript
  // fetchCache.js or inline
  const fetchCache = new Map();

  async function cachedFetch(url) {
    if (fetchCache.has(url)) return fetchCache.get(url);
    const promise = fetch(url).then(r => r.json());
    fetchCache.set(url, promise);
    return promise;
  }
  ```
- **期待効果:** ネットワークリクエスト 1-2本削減、ブログページのTTI改善
- **工数:** 🟢 S

---

### 🟡 P14: blog.js の遅延ロード（ブログ以外のページ）

- **問題:** `blog.js`（779行）は blog.html でのみ使用されるが、他ページには含まれていないため問題なし ✅
- **ステータス:** 対応済み（ページ別にスクリプトが分離されている）

---

### 🟡 P15: marked.js / DOMPurify の遅延ロード

- **問題:** `blog.html` で marked.js と DOMPurify が同期ロード。ブログ一覧表示では不要（記事本文表示のみで必要）
- **現状:** blog.html にて `<script src="...marked.min.js">` が body 末尾に同期ロード
- **提案:** 記事表示時にのみ動的インポート（Prism.js と同じパターン）
  ```javascript
  async function loadMarkdownDeps() {
    if (window.marked && window.DOMPurify) return;
    await Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/marked@15.0.12/marked.min.js', 'sha384-...'),
      loadScript('https://cdn.jsdelivr.net/npm/dompurify@3.2.4/dist/purify.min.js', 'sha384-...')
    ]);
  }

  function loadScript(src, integrity) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.integrity = integrity;
      s.crossOrigin = 'anonymous';
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }
  ```
- **期待効果:** ブログ一覧ページのTTI 100-200ms 改善
- **工数:** 🟡 M

---

### 🟢 P16: ミニファイの導入

- **問題:** すべての JS/CSS が未ミニファイ。コメント・空白・改行がそのまま送信される
- **提案:** GitHub Actions CI でビルドステップを追加
  ```yaml
  # .github/workflows/minify.yml
  name: Minify Assets
  on:
    push:
      branches: [main]
  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - name: Minify CSS
          run: npx csso-cli styles.css -o styles.min.css
        - name: Minify JS
          run: |
            npx terser script.js -o script.min.js -c -m
            npx terser assets/js/ui.js -o assets/js/ui.min.js -c -m
            npx terser blog.js -o blog.min.js -c -m
            npx terser i18n.js -o i18n.min.js -c -m
        - name: Deploy
          # .. deploy minified files
  ```
- **期待効果:** JS 30-50% サイズ削減、CSS 20-40% サイズ削減
- **工数:** 🟡 M

---

## 6. CSS 最適化

### 🔴 P17: Critical CSS のインライン化

- **問題:** 3,955行の `styles.css` 全体がレンダリングブロック。ATF（Above The Fold）で必要なのは一部のみ
- **提案:** Critical CSS をインラインで `<style>` タグに挿入し、残りを遅延ロード
  ```html
  <head>
    <!-- ① Critical CSS (ATF) をインライン化 -->
    <style>
      :root { /* カラートークン & フォント */ }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background-color: #030303; color: #ededed; font-family: 'Inter', sans-serif; }
      .header { /* ヘッダースタイル */ }
      .aurora-container, .aurora-orb { /* Aurora基本 */ }
      .hero-card { /* ヒーロー基本 */ }
      .glitch-text { /* H1 */ }
    </style>

    <!-- ② 残りの CSS は非同期ロード -->
    <link rel="preload" as="style" href="styles.css"
      onload="this.onload=null;this.rel='stylesheet'" />
    <noscript><link rel="stylesheet" href="styles.css" /></noscript>
  </head>
  ```
- **期待効果:** FCP **300-800ms 改善**（Render-blocking CSS 解消）
- **工数:** 🔴 L

---

### 🟡 P18: 未使用 CSS の削除

- **問題:** 3,955行のCSSには全ページ（home, about, blog, projects, contact, privacy, terms）のスタイルが含まれる。各ページで使用されるのは推定 40-60%
- **提案:**
  1. PurgeCSS で定量調査:
     ```bash
     npx purgecss --css styles.css --content '*.html' --output purged/
     ```
  2. ページ別 CSS ファイルに分割:
     - `styles-base.css` — 共通（variables, reset, header, footer, aurora, grid）
     - `styles-home.css` — ホーム固有
     - `styles-blog.css` — ブログ固有
     - `styles-projects.css` — プロジェクト固有
- **期待効果:** CSS転送サイズ 30-50% 削減
- **工数:** 🔴 L

---

### 🟡 P19: `will-change` の過剰使用見直し

- **問題:** `.aurora-orb` に `will-change: transform` が常時設定。3つの orb × 大きなブラー = GPU メモリ大量消費
- **現状:**
  ```css
  .aurora-orb {
    will-change: transform;
  }
  ```
- **提案:** `contain: layout style` は維持しつつ、`will-change` は `@media (prefers-reduced-motion: no-preference)` でのみ適用
  ```css
  .aurora-orb {
    contain: layout style;
  }
  @media (prefers-reduced-motion: no-preference) {
    .aurora-orb {
      will-change: transform;
    }
  }
  ```
- **期待効果:** モバイル GPU メモリ使用量削減、バッテリー消費改善
- **工数:** 🟢 S

---

### 🟡 P20: CSS の `contain` プロパティ活用

- **問題:** カードコンポーネント（`.bento-card`）に `contain` が未設定。リフロー時にドキュメント全体が再計算される
- **提案:**
  ```css
  .bento-card {
    contain: content; /* レイアウト・スタイル・ペイントを分離 */
  }
  ```
- **期待効果:** リフロー/リペイントのスコープ限定 → INP改善
- **工数:** 🟢 S

---

## 7. ネットワークリクエスト削減

### 🟡 P21: ホームページの fetch 統合

- **問題:** `index.html` で3回の fetch が発生:
  1. `assets/posts/list.json` — 記事数カウント用
  2. `projects.json` — プロジェクトカード描画用
  3. `assets/posts/list.json` — Latest Blog セクション用（**重複!**）
- **提案:** fetch 結果を共有して重複排除
  ```javascript
  // script.js 冒頭
  const postsPromise = fetch("assets/posts/list.json").then(r => r.json());

  // statPosts 用
  if (statPosts) {
    postsPromise.then(data => { statPosts.textContent = data.length; });
  }

  // homeBlog 用
  if (homeBlog) {
    postsPromise.then(async posts => { /* ... */ });
  }
  ```
- **期待効果:** ネットワークリクエスト 1本削減
- **工数:** 🟢 S

---

### 🟡 P22: ホームページのブログタイトル先行取得削減

- **問題:** ホームの Latest Blog セクションで、最新3記事のマークダウンファイルを **両言語分（6ファイル）** 先行 fetch してタイトルを抽出
- **提案:** `list.json` にタイトルフィールドを追加してfetchを不要に
  ```json
  {
    "id": "gsap-portfolio",
    "date": "2026.02.07",
    "title_ja": "GitHub Pagesで作る、GSAPアニメーション付きポートフォリオサイト",
    "title_en": "Building an Animated Portfolio with GSAP on GitHub Pages",
    "emoji": "✨",
    "tags": ["GSAP", "CSS Grid", "GitHub Pages"]
  }
  ```
- **期待効果:** ホームページで **6本の .md fetch 完全削除**、TTI 大幅改善
- **工数:** 🟡 M

---

### 🟢 P23: `preconnect` / `preload` の追加

- **問題:** CDNホストへの early connection hint が不足
- **提案:**
  ```html
  <!-- 既存 -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

  <!-- 追加 -->
  <link rel="preconnect" href="https://unpkg.com" crossorigin />
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
  ```
- **期待効果:** 初回接続時間 50-150ms 削減
- **工数:** 🟢 S

---

## 8. Core Web Vitals 改善 (LCP / INP / CLS)

### 🔴 LCP（Largest Contentful Paint）改善

| # | 施策 | 期待改善量 | 参照 |
|---|------|---------|------|
| L1 | Google Fonts の非同期ロード | -200~500ms | P2 |
| L2 | Critical CSS インライン化 | -300~800ms | P17 |
| L3 | ヒーローロゴに `fetchpriority="high"` 追加 | -50~100ms | 下記 |
| L4 | JS defer 化 | -100~200ms | P3 |

```html
<!-- LCP 候補要素の最適化 -->
<img src="assets/logo-black.png" alt="Studio344 Logo" class="hero-logo"
     width="120" height="120"
     fetchpriority="high"
     decoding="async" />
```

**目標:** LCP **2.5秒以下**（Good）

---

### 🔴 INP（Interaction to Next Paint）改善

| # | 施策 | 期待改善量 | 参照 |
|---|------|---------|------|
| I1 | mousemove の RAF スロットリング | -30~50ms | P12 |
| I2 | `contain: content` でリフロー限定 | -10~20ms | P20 |
| I3 | モバイルでの Aurora アニメーション簡素化 | -20~40ms | P19 |
| I4 | ハンバーガーメニューの `innerHTML` 書き換えを最適化 | -5~10ms | 下記 |

```javascript
// INP改善: ハンバーガー innerHTML → classList toggle に変更
hamburger.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("open");
  hamburger.classList.toggle("is-open", isOpen);
  // SVGアイコンの切り替えはCSSで制御
});
```
```css
/* CSS でアイコン切り替え */
.hamburger .icon-menu { display: block; }
.hamburger .icon-close { display: none; }
.hamburger.is-open .icon-menu { display: none; }
.hamburger.is-open .icon-close { display: block; }
```

**目標:** INP **200ms以下**（Good）

---

### 🟡 CLS（Cumulative Layout Shift）改善

| # | 施策 | 期待改善量 | 参照 |
|---|------|---------|------|
| C1 | img に width/height 設定 | -0.05~0.1 | P8 |
| C2 | フォント `display: swap` + サイズ調整ディスクリプタ | -0.02~0.05 | 下記 |
| C3 | JS注入コンテンツのスケルトン/プレースホルダー | -0.03~0.08 | P26 |
| C4 | `stat-*` カウンタの初期サイズ確保 | -0.01~0.03 | 下記 |

```css
/* フォント読み込み前後のサイズ変動を抑制 */
@font-face {
  font-family: 'Inter';
  size-adjust: 100%;
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
}

/* JS注入カウンタの初期サイズ確保 */
.home-nav-count {
  min-width: 2ch;
  min-height: 1.5em;
  display: inline-block;
}
```

**目標:** CLS **0.1以下**（Good）

---

## 9. 体感パフォーマンス改善

### 🟡 P24: スケルトンスクリーンの導入

- **問題:** プロジェクトカード・ブログカードがJS注入のため、ロード中は空白 → UI がガタつく
- **提案:**
  ```html
  <!-- プロジェクトカード スケルトン -->
  <div id="projects-wrapper" class="projects-grid">
    <div class="skeleton-card" aria-hidden="true">
      <div class="skeleton-visual"></div>
      <div class="skeleton-title"></div>
      <div class="skeleton-desc"></div>
    </div>
    <!-- 繰り返し -->
  </div>
  ```
  ```css
  .skeleton-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-md);
    padding: 1rem;
    animation: skeleton-pulse 1.5s ease-in-out infinite;
  }
  .skeleton-visual { height: 120px; background: rgba(255,255,255,0.08); border-radius: 8px; }
  .skeleton-title { height: 1.2em; width: 60%; margin-top: 1rem; background: rgba(255,255,255,0.08); border-radius: 4px; }
  .skeleton-desc { height: 0.8em; width: 80%; margin-top: 0.5rem; background: rgba(255,255,255,0.06); border-radius: 4px; }
  @keyframes skeleton-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  ```
- **期待効果:** 体感待ち時間の大幅削減、CLS改善
- **工数:** 🟡 M

---

### 🟡 P25: View Transition API の活用

- **問題:** `<meta name="view-transition" content="same-origin" />` が設定されているが、CSS側の遷移定義なし
- **提案:** ページ遷移時のフェードアニメーション追加
  ```css
  @view-transition {
    navigation: auto;
  }
  ::view-transition-old(root) {
    animation: fade-out 0.15s ease-out;
  }
  ::view-transition-new(root) {
    animation: fade-in 0.2s ease-in;
  }
  @keyframes fade-out { to { opacity: 0; } }
  @keyframes fade-in { from { opacity: 0; } }
  ```
- **期待効果:** ページ遷移のスムーズさ向上（体感速度アップ）
- **工数:** 🟢 S

---

### 🟡 P26: `prefers-reduced-motion` の一括管理強化

- **問題:** `ui.js` でタイピングアニメーションでは確認しているが、Aurora背景やスクロールアニメーションでは未対応の箇所あり
- **提案:** CSS レベルで一括無効化
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
    .aurora-orb { display: none; }
    .spotlight-overlay { display: none; }
  }
  ```
- **期待効果:** アクセシビリティ改善 + モーション感度ユーザーのバッテリー節約
- **工数:** 🟢 S

---

### 🟢 P27: `content-visibility: auto` の活用

- **問題:** ATF（Above The Fold）外のセクションもすべて即座にレンダリングされる
- **提案:**
  ```css
  .scroll-reveal,
  .home-section,
  .site-footer {
    content-visibility: auto;
    contain-intrinsic-size: auto 300px;
  }
  ```
- **期待効果:** 初回レンダリングコスト 20-30% 削減
- **工数:** 🟢 S

---

## 📊 優先度別サマリー

### 🔴 High Priority（即座に着手すべき）

| # | 施策 | 影響 | 工数 |
|---|------|------|------|
| P1 | AdSense スクリプト移動 | FCP -100~300ms | S |
| P2 | Google Fonts 非同期ロード | FCP/LCP -200~500ms | S |
| P3 | script defer 化 | TTI -100~200ms | S |
| P4 | フォントウェイト削減 | 転送サイズ -30~50% | S |
| P7 | WebP/AVIF 画像変換 | 画像サイズ -30~80% | M |
| P8 | img width/height | CLS -0.05~0.1 | S |
| P10 | Service Worker 導入 | リピート訪問 -50~90% | M |
| P12 | mousemove スロットリング | INP改善 | S |
| P17 | Critical CSS インライン化 | FCP -300~800ms | L |

### 🟡 Medium Priority（次フェーズ）

| # | 施策 | 影響 | 工数 |
|---|------|------|------|
| P5 | CDN ホスト統一 | DNS -60~200ms | M |
| P6 | dns-prefetch 追加 | DNS -20~100ms | S |
| P13 | fetch 重複排除 | リクエスト削減 | S |
| P15 | marked/DOMPurify 遅延ロード | TTI改善 | M |
| P16 | ミニファイ導入 | サイズ -20~50% | M |
| P18 | 未使用CSS削除 | CSS -30~50% | L |
| P19 | will-change 最適化 | GPU メモリ | S |
| P20 | contain プロパティ | INP改善 | S |
| P21 | fetch 統合 | リクエスト削減 | S |
| P22 | list.json にタイトル追加 | 6 fetch 削減 | M |
| P24 | スケルトンスクリーン | 体感速度 | M |
| P25 | View Transition CSS | 体感品質 | S |
| P26 | reduced-motion 一括管理 | A11y, バッテリー | S |

### 🟢 Low Priority（改善余地あり）

| # | 施策 | 影響 | 工数 |
|---|------|------|------|
| P9 | ファビコン SVG 化 | 軽微 | S |
| P11 | キャッシュバスティング（クエリパラメータ） | キャッシュ効率 | S |
| P23 | preconnect 追加 | -50~150ms | S |
| P27 | content-visibility: auto | レンダリングコスト -20~30% | S |

---

## ⚡ 推定トータル改善効果

| 指標 | 現状推定 | 改善後目標 |
|------|---------|---------|
| **LCP** | 3.0-4.5s | **< 2.5s** ✅ |
| **INP** | 150-300ms | **< 200ms** ✅ |
| **CLS** | 0.1-0.25 | **< 0.1** ✅ |
| **FCP** | 2.0-3.5s | **< 1.8s** ✅ |
| **TTI** | 4.0-6.0s | **< 3.5s** ✅ |
| **Lighthouse パフォーマンス** | 60-75 | **85-95** 🎯 |

---

## 🛠️ 推奨実施ロードマップ

### Phase 1（即効性 × 低コスト）— 1-2日
- [x] P1: AdSense 移動
- [x] P2: Google Fonts 非同期 + ウェイト削減（P4）
- [x] P3: script defer
- [x] P6: dns-prefetch 追加
- [x] P8: img width/height
- [x] P12: mousemove スロットリング
- [x] P19: will-change 最適化
- [x] P20: contain プロパティ
- [x] P21: fetch 統合
- [x] P23: preconnect 追加
- [x] P26: reduced-motion 一括管理
- [x] P27: content-visibility

### Phase 2（中程度の効果 × 適度なコスト）— 3-5日
- [ ] P5: CDN ホスト統一
- [ ] P7: WebP/AVIF 変換
- [ ] P10: Service Worker
- [ ] P13: fetch キャッシュレイヤー
- [ ] P15: marked/DOMPurify 遅延ロード
- [ ] P22: list.json にタイトル追加
- [ ] P24: スケルトンスクリーン
- [ ] P25: View Transition CSS

### Phase 3（大規模リファクタリング）— 1-2週間
- [ ] P16: GitHub Actions ミニファイパイプライン
- [ ] P17: Critical CSS 抽出 + インライン化
- [ ] P18: CSS ファイル分割（ページ別）

---

> **📝 備考:** 各施策の効果はネットワーク環境・デバイスにより変動します。実際の改善効果は Lighthouse / PageSpeed Insights / Chrome DevTools Performance パネルで計測・検証してください。
