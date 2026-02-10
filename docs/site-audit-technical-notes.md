# 📝 技術学習ノート: 包括的サイト監査 & 修正

**作成日:** 2025-07  
**対象:** studio344.net ポートフォリオサイト  
**ブランチ:** `fix/comprehensive-site-audit`

---

## 🏗️ アーキテクチャ概要

静的HTMLサイト（ビルドツールなし）で、GitHub Pagesでホスティング。  
i18next によるクライアントサイド多言語切替（日本語/英語）を採用。

---

## 🔑 実装した主要な技術コンセプト

### 1. Prism.js 遅延ロード（パフォーマンス）

**問題:** ブログ一覧ページでも Prism.js（シンタックスハイライト）が全件読み込まれていた。  
**解決:** 静的 `<script>` タグを削除し、記事内にコードブロックがある場合のみ動的にロードする方式に変更。

```javascript
// 遅延ロードパターン: Promise チェーンで順次読み込み
let prismLoaded = false;
window.loadPrism = function () {
  if (prismLoaded) return Promise.resolve();
  return new Promise((resolve) => {
    // CSS を head に追加
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "...prism-tomorrow.min.css";
    document.head.appendChild(link);
    // JS を順次読み込み（core → components）
    function loadNext(i) {
      if (i >= scripts.length) { prismLoaded = true; resolve(); return; }
      const s = document.createElement("script");
      s.src = scripts[i].src;
      s.onload = () => loadNext(i + 1);
      document.body.appendChild(s);
    }
    loadNext(0);
  });
};

// 使用箇所: コードブロックがある場合のみ発火
if (content.querySelector("pre code")) {
  window.loadPrism().then(() => {
    if (window.Prism) window.Prism.highlightAll();
  });
}
```

**学び:**
- `<script>` の順次読み込みは `onload` コールバックで制御する
- SRI (Subresource Integrity) の `integrity` 属性は動的生成でも維持する
- `prismLoaded` フラグで二重読み込みを防止

---

### 2. DOMPurify によるXSS対策（セキュリティ）

**問題:** `marked.parse()` の出力をそのまま `innerHTML` に挿入するとXSSリスクがある。  
**解決:** DOMPurify でサニタイズしてから挿入。

```javascript
const rawHtml = marked.parse(mdText);
content.innerHTML = typeof DOMPurify !== 'undefined'
  ? DOMPurify.sanitize(rawHtml)
  : rawHtml;
```

**学び:**
- マークダウン → HTML 変換は信頼できないコンテンツとして扱う
- `typeof` チェックでライブラリが読み込まれていない場合のフォールバックを用意
- DOMPurify は HTML 構造を保持しながら危険な要素（`<script>`, `onerror` 等）を除去

---

### 3. hreflang タグ（多言語SEO）

**問題:** 同一URLで日英両方を提供するサイトに hreflang がなかった。  
**解決:** 全ページに `hreflang="ja"`, `hreflang="en"`, `hreflang="x-default"` を追加。

```html
<link rel="alternate" hreflang="ja" href="https://studio344.net/about.html" />
<link rel="alternate" hreflang="en" href="https://studio344.net/about.html" />
<link rel="alternate" hreflang="x-default" href="https://studio344.net/about.html" />
```

**学び:**
- クライアントサイド多言語サイトでは、全言語バリエーションが同じURLを指す
- `x-default` は言語が合致しない場合のフォールバックを示す
- Google は hreflang を「ヒント」として扱う（厳密な命令ではない）

---

### 4. アクセシビリティ強化（ARIA属性）

**問題:** ナビゲーション、装飾SVG、言語切替ボタンに適切な ARIA がなかった。

```html
<!-- ナビゲーションにランドマークロール -->
<nav class="nav-menu" aria-label="メインナビゲーション">

<!-- 装飾SVGを支援技術から隠す -->
<svg aria-hidden="true" ...>

<!-- 言語切替ボタンの状態を伝える -->
<button aria-label="Switch to English">EN</button>
```

**学び:**
- `aria-label` はスクリーンリーダーユーザーにコンテキストを提供
- 装飾用SVGは `aria-hidden="true"` で読み上げを防止
- 動的に変化する状態は JavaScript で `aria-label` を更新

---

### 5. Google Fonts 最適化

**問題:** `font-weight` 300;400;600;700;800 を全ページで読み込んでいたが、600 は使用していなかった。  
**解決:** 未使用ウェイトを削除してファイルサイズを削減。

```html
<!-- Before -->
<link href="...Sora:wght@300;400;600;700;800&..." />
<!-- After -->
<link href="...Sora:wght@300;400;700;800&..." />
```

**学び:**
- Google Fonts は指定したウェイト分だけデータ量が増える
- 実際に `font-weight` で使用している値をCSS内で確認してから指定する
- `display=swap` は FOIT（Flash of Invisible Text）を防ぐ

---

### 6. CSS `will-change` と `contain`（レンダリング最適化）

**問題:** `aurora-orb` のアニメーションが独立レイヤーに昇格されていなかった。  
**解決:** `will-change: transform` と `contain: layout style` を追加。

```css
.aurora-orb {
  will-change: transform;
  contain: layout style;
}
```

**学び:**
- `will-change` はブラウザにアニメーションの事前最適化を促す
- `contain` はレイアウト計算の影響範囲を制限（リフロー最小化）
- 乱用するとメモリ消費が増えるため、実際にアニメーションする要素にのみ適用

---

### 7. レンダーブロッキングスクリプトの移動

**問題:** `i18next` が `<head>` 内で同期読み込みされ、パフォーマンスに影響。  
**解決:** `<body>` 末尾に移動。

**学び:**
- `<head>` 内の `<script>`（`defer`/`async` なし）はHTML解析をブロック
- i18next は DOM 操作を行うため `defer` より `body` 末尾配置が安全
- First Contentful Paint (FCP) の改善に直結

---

### 8. 構造化データ (JSON-LD) の修正

**問題:** `author` が `Person` 型になっていたが、Studio344 は組織/ブランド。  
**解決:** `Organization` 型に変更。

```json
{
  "@type": "Organization",
  "name": "Studio344",
  "url": "https://studio344.net"
}
```

**学び:**
- Google はJSON-LDの `@type` を厳密に評価する
- 個人ブランドでも、サイト全体の著者としては `Organization` が適切
- `sameAs` でSNSプロフィールをリンクすると rich snippet に反映される可能性

---

## 📊 修正サマリー

| カテゴリ | 修正数 | 主な内容 |
|---------|--------|---------|
| パフォーマンス | 7 | Fonts軽量化, Prism遅延ロード, will-change, スクリプト配置 |
| SEO | 6 | hreflang, JSON-LD, OGP, sitemap, twitter:site |
| アクセシビリティ | 6 | ARIA属性, SVG hidden, ローカライズ |
| UX/UI | 5 | Hero CTA, Coming Soonカード, Footer拡充, Blog前後ナビ |
| コード品質 | 3 | CSS重複削除, fetch統合, エラー多言語化 |
| セキュリティ | 1 | DOMPurify統合 |

**合計: 28項目を実装、残り7項目はスキップ（設計判断/非該当）**

---

## ⏭️ 今後の検討事項

1. **CSS分割** — ページ固有CSSの分離（ビルドツール導入時に対応）
2. **SSG移行** — Next.js/Astro等への移行で、Blog SEO・ビルド最適化を実現
3. **Light Mode** — 現在はダークモード専用（意図的な設計判断）
4. **SRI on Google Fonts** — CDNの性質上、SRI適用は非現実的
