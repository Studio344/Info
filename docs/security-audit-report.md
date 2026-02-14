# 🛡️ Studio344 セキュリティ監査レポート

> **監査日:** 2026年2月14日  
> **対象:** studio344.net（静的HTML/CSS/JS サイト、GitHub Pages ホスティング）  
> **監査者:** セキュリティ分析エージェント  

---

## 📋 エグゼクティブサマリー

Studio344のポートフォリオサイトは、静的サイトとしての基本的なセキュリティ対策（DOMPurify、SRI、`rel="noopener noreferrer"`）が実装されており、攻撃面は比較的限定的です。しかし、複数の改善可能な領域が特定されました。特に **DOMPurifyフォールバック問題**、**Cookie同意バナーの欠如**、**CSPの不在** は優先的に対処すべき事項です。

### 📊 リスクサマリー

| 優先度 | 件数 | 概要 |
|--------|------|------|
| 🔴 High | 4件 | DOMPurifyフォールバック、Cookie同意、CSP不在、i18n innerHTML |
| 🟡 Medium | 8件 | サプライチェーン分散、HTTPヘッダー、サードパーティリスク等 |
| 🟢 Low | 10件 | 情報開示、改善的強化、防御層追加等 |

---

## 1️⃣ XSS（クロスサイトスクリプティング）防止評価

### 🔴 SEC-01: DOMPurify フォールバックによる未サニタイズHTML挿入

- **優先度:** 🔴 High
- **該当ファイル:** `blog.js` L180
- **リスク説明:**

```javascript
content.innerHTML = typeof DOMPurify !== 'undefined'
  ? DOMPurify.sanitize(rawHtml)
  : rawHtml;  // ← DOMPurify未ロード時、生HTMLがそのまま挿入される
```

DOMPurifyのCDN読み込みに失敗した場合（ネットワーク障害、CDNダウン、SRIハッシュ不一致等）、`marked.parse()` が生成した未サニタイズHTMLが `innerHTML` に直接設定されます。Markdownファイルは自作コンテンツですが、**防御の深層化（Defense in Depth）** の観点から、フォールバックでの生HTML挿入は避けるべきです。

- **提案する対策:**

```javascript
// 修正案: DOMPurifyがない場合はテキストとして挿入、またはエラー表示
const rawHtml = marked.parse(mdText);
if (typeof DOMPurify !== 'undefined') {
  content.innerHTML = DOMPurify.sanitize(rawHtml);
} else {
  console.error('DOMPurify not loaded - refusing to render unsanitized HTML');
  content.textContent = mdText; // プレーンテキストとして表示
  // または content.innerHTML = '<p>コンテンツの安全な表示に必要なライブラリが読み込めませんでした。</p>';
}
```

- **期待される効果:** DOMPurify未ロード時のXSS攻撃経路を完全遮断
- **工数:** S（1行の条件分岐変更）

---

### 🔴 SEC-02: i18n `updateContent()` における innerHTML 使用

- **優先度:** 🔴 High
- **該当ファイル:** `i18n.js` L51-57
- **リスク説明:**

```javascript
function updateContent() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = i18next.t(key);
    if (value.includes("<") && value.includes(">")) {
      el.innerHTML = value;  // ← HTMLタグを含む翻訳値がそのまま挿入
    } else {
      el.textContent = value;
    }
  });
}
```

翻訳JSONファイル（`locales/ja.json`, `locales/en.json`）は自前管理のため現時点で直接的なXSSリスクは低いです。しかし以下のシナリオで問題が発生しえます：

1. **翻訳ファイルの改ざん:** GitHub リポジトリへの不正アクセスやサプライチェーン攻撃
2. **パストラバーサル:** `i18n.js` の `loadPath` が動的にパスを構築しており、理論上は異なるJSONファイルを読み込む可能性
3. **将来の拡張:** ユーザー投稿コンテンツやCMSと連携した場合

HTML判定ロジックも `<` と `>` の単純な存在チェックのみで、`<script>` などの危険タグとの区別がありません。

- **提案する対策:**

```javascript
function updateContent() {
  // 安全なHTMLタグのホワイトリスト
  const SAFE_TAGS = ['br', 'strong', 'em', 'a', 'span'];
  const TAG_REGEX = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = i18next.t(key);

    if (value.includes("<") && value.includes(">")) {
      // 使用されているタグが全てホワイトリスト内か確認
      let safe = true;
      let match;
      while ((match = TAG_REGEX.exec(value)) !== null) {
        if (!SAFE_TAGS.includes(match[1].toLowerCase())) {
          safe = false;
          break;
        }
      }
      TAG_REGEX.lastIndex = 0; // リセット

      if (safe) {
        el.innerHTML = value;
      } else {
        console.warn(`Unsafe HTML detected in i18n key: ${key}`);
        el.textContent = value; // フォールバックとしてテキスト表示
      }
    } else {
      el.textContent = value;
    }
  });
}
```

- **期待される効果:** 翻訳ファイル経由のXSS攻撃を防止しつつ、`<br>` や `<strong>` 等の安全なタグは維持
- **工数:** S（関数内ロジック修正）

---

### 🟡 SEC-03: ブログカード・タグの innerHTML 挿入（エスケープ不足）

- **優先度:** 🟡 Medium
- **該当ファイル:** `blog.js` L564, L311, `script.js` L196
- **リスク説明:**

```javascript
// blog.js - ブログカードレンダリング
card.innerHTML = `
  <h3 class="blog-preview-title">${post.title}</h3>
  <p class="blog-preview-excerpt">${post.excerpt}</p>
  <div class="blog-preview-tags">${tagsHtml}</div>
`;

// blog.js - タグ挿入
tagsDiv.innerHTML = tags
  .map(tag => `<span class="blog-post-tag">${tag}</span>`)
  .join("");

// script.js - ホームページブログカード
card.innerHTML = `
  <span class="home-blog-title">${title}</span>
  <span class="home-blog-tags">${...tags...}</span>
`;
```

`post.title`、`post.excerpt`、`tag` はMarkdownファイルやJSONから取得されたデータで、HTMLエスケープなしにテンプレートリテラル経由で `innerHTML` に挿入されています。現在はすべて自作コンテンツですが、**データソースとレンダリングの分離原則** に反しています。

- **提案する対策:**

```javascript
// HTMLエスケープユーティリティ関数を追加
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// 使用例
card.innerHTML = `
  <h3 class="blog-preview-title">${escapeHtml(post.title)}</h3>
  <p class="blog-preview-excerpt">${escapeHtml(post.excerpt)}</p>
`;
```

- **期待される効果:** データソースが変更・拡張された場合でもXSSを防止
- **工数:** M（全innerHTML使用箇所にエスケープ関数を適用）

---

### 🟡 SEC-04: インラインイベントハンドラの使用

- **優先度:** 🟡 Medium
- **該当ファイル:** `blog.js` L636-645
- **リスク説明:**

```javascript
// 前後記事ナビゲーション
nav.innerHTML += `<a href="#post/${prevPost.id}" ...
  onclick="event.preventDefault(); history.pushState(null,'','#post/${prevPost.id}'); showSinglePost('${prevPost.id}');">
```

`onclick` 属性にユーザーデータ（`prevPost.id`）が直接埋め込まれています。`postId` は `list.json` から取得されるため直接的リスクは低いですが、インラインイベントハンドラは厳格なCSPポリシーとの互換性がなく、将来のCSP導入を妨げます。

- **提案する対策:**

```javascript
// onclick属性を使わず、addEventListener を使用
const link = document.createElement('a');
link.href = `#post/${prevPost.id}`;
link.className = 'blog-prev-next-link blog-prev-next-link--prev';
link.innerHTML = `<span class="blog-prev-next-label">← 前の記事</span>
                  <span class="blog-prev-next-title">${escapeHtml(title)}</span>`;
link.addEventListener('click', (e) => {
  e.preventDefault();
  history.pushState(null, '', `#post/${prevPost.id}`);
  showSinglePost(prevPost.id);
});
nav.appendChild(link);
```

- **期待される効果:** CSP `unsafe-inline` が不要になり、より厳格なCSPポリシーが適用可能
- **工数:** M（nav生成ロジックの書き換え）

---

### 🟢 SEC-05: `marked.parse()` のセキュリティオプション未設定

- **優先度:** 🟢 Low
- **該当ファイル:** `blog.js` L179
- **リスク説明:**

`marked.parse(mdText)` がデフォルト設定で呼び出されています。DOMPurifyでサニタイズしているため直接的なリスクは低いですが、`marked` のデフォルトでは `<script>` タグ等がそのまま出力されます。

- **提案する対策:**

```javascript
// marked のセキュリティ寄りオプションを設定
marked.setOptions({
  breaks: true,
  gfm: true,
  // marked v15 では sanitize オプションは廃止されています
  // DOMPurify との併用が推奨パターン（現在の実装は正しい）
});
```

- **期待される効果:** 防御の多層化（DOMPurifyに加えて、marked側でも制限）
- **工数:** S

---

## 2️⃣ Content Security Policy（CSP）推奨事項

### 🔴 SEC-06: CSP（Content Security Policy）の不在

- **優先度:** 🔴 High
- **該当ファイル:** 全HTMLファイル
- **リスク説明:**

現在、CSPヘッダーも `<meta>` タグも設定されていません。GitHub Pages ではカスタムHTTPヘッダーの設定が不可能ですが、`<meta http-equiv="Content-Security-Policy">` タグで基本的なCSPを導入可能です。

CSPがないことにより：
- XSS攻撃時にブラウザ側の防御層が機能しない
- 不正なスクリプト・スタイルの読み込みを検知できない
- データ外部送信（exfiltration）を防止できない

- **提案する対策:**

```html
<!-- 全HTMLファイルの<head>内に追加 -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self'
    https://pagead2.googlesyndication.com
    https://cdn.jsdelivr.net
    https://unpkg.com
    https://cdnjs.cloudflare.com
    https://www.googletagservices.com
    https://adservice.google.com
    https://tpc.googlesyndication.com
    'unsafe-inline';
  style-src 'self'
    https://fonts.googleapis.com
    https://cdnjs.cloudflare.com
    'unsafe-inline';
  font-src 'self'
    https://fonts.gstatic.com;
  img-src 'self'
    data:
    https://pagead2.googlesyndication.com
    https://www.google.com
    https://tpc.googlesyndication.com;
  connect-src 'self'
    https://pagead2.googlesyndication.com;
  frame-src
    https://googleads.g.doubleclick.net
    https://tpc.googlesyndication.com
    https://www.google.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
">
```

> ⚠️ **注意:** Google AdSense は多数のドメインからスクリプトを動的にロードするため、厳格なCSPとの両立は困難です。まずは **CSP Report-Only モード** での運用を推奨します。

```html
<!-- Report-Only モード（ブロックせずに違反をログ出力） -->
<meta http-equiv="Content-Security-Policy-Report-Only" content="
  default-src 'self';
  script-src 'self' https://pagead2.googlesyndication.com https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com 'unsafe-inline';
  style-src 'self' https://fonts.googleapis.com 'unsafe-inline';
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self';
  object-src 'none';
  base-uri 'self';
">
```

- **期待される効果:** XSS・データ外部送信の防止、不正リソース読み込みのブロック
- **工数:** M（全HTMLファイルへの追加 + AdSense互換性テスト）
- **段階的導入:** Report-Only → 違反分析 → 本番適用

---

### 🟡 SEC-07: `unsafe-inline` の排除計画

- **優先度:** 🟡 Medium
- **該当ファイル:** 全HTML、CSS、JS
- **リスク説明:**

現在のコードには以下の `unsafe-inline` 依存があります：

| 種類 | 該当箇所 | 説明 |
|------|----------|------|
| **style** | `script.js` L55 等 | `card.style.animationDelay` 等のインラインスタイル設定 |
| **style** | `blog.js` L538 | `style="background: ${gradient}"` テンプレートリテラル |
| **style** | `404.html` | `<style>` ブロック |
| **script** | `blog.js` L636 | `onclick` インラインイベントハンドラ |

- **提案する対策（段階的）:**

1. **Phase 1:** インラインイベントハンドラを `addEventListener` に置換（SEC-04 参照）
2. **Phase 2:** インラインスタイルを CSS クラスまたは CSS Custom Properties に移行
3. **Phase 3:** `<style>` ブロックを外部CSSファイルに移動
4. **Phase 4:** nonce ベースの CSP に移行（GitHub Pages では困難だが、将来のホスティング変更時に対応）

- **期待される効果:** より厳格なCSPの適用が可能になり、XSS攻撃の実行を根本的に防止
- **工数:** L（コードベース全体のリファクタリングが必要）

---

## 3️⃣ Cookie/トラッキング法令コンプライアンス

### 🔴 SEC-08: Cookie同意バナーの欠如

- **優先度:** 🔴 High
- **該当ファイル:** 全HTMLファイル
- **リスク説明:**

Google AdSense スクリプトが全ページで**無条件に**読み込まれています：

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3044810068333301"
    crossorigin="anonymous"></script>
```

これにより以下の法的リスクが存在します：

| 法規 | 違反内容 |
|------|----------|
| **GDPR（EU一般データ保護規則）** | トラッキングCookieの事前同意（オプトイン）が必要。非必須Cookieは同意前に設置不可。EU居住者がアクセスした場合に適用 |
| **ePrivacy指令** | Cookie設置前の明示的同意が必要 |
| **改正個人情報保護法（日本）** | 2022年改正で「個人関連情報」の第三者提供に本人同意が必要。Cookie情報は個人関連情報に該当しうる |
| **電気通信事業法（2023年改正）** | 外部送信規律（利用者情報の外部送信について通知・公表・同意取得が必要） |
| **Google AdSense ポリシー** | EU向けにはIAB TCF v2.0 またはGoogleの同意管理対応が必要 |

- **提案する対策:**

```html
<!-- 1. AdSense スクリプトを同意後にのみ読み込む -->
<!-- 変更前: 無条件ロード -->
<!-- <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?..." -->

<!-- 変更後: Cookie同意後に動的にロード -->
<script>
  function loadAdSense() {
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3044810068333301';
    s.crossOrigin = 'anonymous';
    document.head.appendChild(s);
  }
</script>
```

```javascript
// 2. 最小限のCookie同意バナー実装
function initCookieConsent() {
  const consent = localStorage.getItem('cookie-consent');
  if (consent === 'accepted') {
    loadAdSense();
    return;
  }
  if (consent === 'rejected') return;

  const banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.className = 'cookie-banner';
  banner.innerHTML = `
    <div class="cookie-banner-content">
      <p>当サイトでは、広告配信のためにCookieを使用しています。
         詳細は<a href="privacy-policy.html">プライバシーポリシー</a>をご覧ください。</p>
      <div class="cookie-banner-actions">
        <button id="cookie-accept" class="cookie-btn cookie-btn-accept">同意する</button>
        <button id="cookie-reject" class="cookie-btn cookie-btn-reject">拒否する</button>
      </div>
    </div>
  `;
  document.body.appendChild(banner);

  document.getElementById('cookie-accept').addEventListener('click', () => {
    localStorage.setItem('cookie-consent', 'accepted');
    banner.remove();
    loadAdSense();
  });
  document.getElementById('cookie-reject').addEventListener('click', () => {
    localStorage.setItem('cookie-consent', 'rejected');
    banner.remove();
  });
}

document.addEventListener('DOMContentLoaded', initCookieConsent);
```

- **期待される効果:** GDPR/改正個人情報保護法/電気通信事業法への準拠、Google AdSenseポリシー適合
- **工数:** M（バナーUI + AdSense条件付きロード + CSS追加）

---

### 🟡 SEC-09: プライバシーポリシーの法的不備

- **優先度:** 🟡 Medium
- **該当ファイル:** `privacy-policy.html`
- **リスク説明:**

現在のプライバシーポリシーに以下の記載が不足しています：

| 不足項目 | 法的根拠 |
|----------|----------|
| Cookie の具体的な種類と目的の列挙 | GDPR Art.13, ePrivacy |
| 第三者提供先の明示（Google LLC等） | 改正個人情報保護法 |
| データ保持期間 | GDPR Art.13(2)(a) |
| ユーザーの権利（アクセス・削除・異議申立） | GDPR Art.15-22 |
| Cookie拒否時の影響説明 | ePrivacy |
| 外部送信先の情報（電気通信事業法対応） | 電気通信事業法 改正2023 |
| データの国際移転に関する説明 | GDPR Art.44-49 |

- **提案する対策:** プライバシーポリシーに上記項目を追記。特に：

  1. Cookieの種類（必須/分析/広告）ごとの目的・保持期間を表形式で記載
  2. Google AnalyticsとAdSenseの外部送信先としてのGoogle LLC情報
  3. ユーザーのCookie設定変更方法
  4. データ主体の権利（日本語/英語）

- **期待される効果:** 法的要件への適合、ユーザーの信頼向上
- **工数:** M（ポリシー文書の改訂）

---

## 4️⃣ サプライチェーンセキュリティ（CDN依存関係）

### 🟡 SEC-10: 複数CDNプロバイダーへの依存

- **優先度:** 🟡 Medium
- **該当ファイル:** 全HTMLファイル
- **リスク説明:**

現在、3つの異なるCDNプロバイダを使用しています：

| CDN | ライブラリ | SRI |
|-----|-----------|-----|
| `unpkg.com` | i18next, i18next-http-backend | ✅ あり |
| `cdn.jsdelivr.net` | DOMPurify, marked | ✅ あり |
| `cdnjs.cloudflare.com` | Prism.js (CSS + JS) | ✅ あり |

**良い点:** 全外部スクリプトにSRI（Subresource Integrity）ハッシュが設定されています。

**リスク:**
- CDNプロバイダの数が多いほど、攻撃面が広がる
- 各CDNがSPOF（Single Point of Failure）となりうる
- CDN側の障害でDOMPurifyが読み込めない場合、SEC-01の問題が顕在化

- **提案する対策:**

1. **CDNプロバイダの統一:** 可能であれば1つのCDN（例：jsdelivr）に統一して管理コストを削減

```html
<!-- unpkg → jsdelivr に統一 -->
<script src="https://cdn.jsdelivr.net/npm/i18next@23.2.3/i18next.min.js"
  integrity="sha384-..." crossorigin="anonymous"></script>
```

2. **フォールバック戦略:** 重要ライブラリにローカルフォールバックを追加

```html
<!-- DOMPurify CDNフォールバック -->
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.2.4/dist/purify.min.js"
  integrity="sha384-xQLTM4bZ7tMbcxQbMJEdYkR0y0b4FYe6RZjjBig+PX68fSOOsLVmBnMIJYhwRkA"
  crossorigin="anonymous"></script>
<script>
  if (typeof DOMPurify === 'undefined') {
    document.write('<script src="assets/js/vendor/purify.min.js"><\/script>');
  }
</script>
```

- **期待される効果:** CDN障害時のレジリエンス向上、攻撃面の縮小
- **工数:** M

---

### 🟡 SEC-11: Google AdSense スクリプトの SRI 欠如

- **優先度:** 🟡 Medium
- **該当ファイル:** 全HTMLファイルの `<head>`
- **リスク説明:**

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3044810068333301"
    crossorigin="anonymous"></script>
```

Google AdSenseスクリプトにはSRIハッシュが設定されていません。Google側のスクリプトは頻繁に更新されるためSRIの適用は現実的ではありませんが、これは**信頼性の高いサードパーティスクリプトがページ全体のコンテキストを操作可能** であることを意味します。

- **提案する対策:**

  1. AdSenseのSRI設定は不可能（Googleがスクリプトを動的に更新するため）。この事実を **リスク受容** として文書化
  2. CSP + `frame-src` の制限で緩和（SEC-06 参照）
  3. AdSense を `<iframe>` で分離する（高度な対策、工数大）

- **期待される効果:** リスクの可視化と受容的管理
- **工数:** S（文書化のみ）/ L（iframe分離の場合）

---

### 🟢 SEC-12: Google Fonts の SRI 欠如

- **優先度:** 🟢 Low
- **該当ファイル:** 全HTMLファイル
- **リスク説明:**

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700..." />
```

Google Fonts CSSにSRIハッシュがありません。Google Fonts APIはブラウザに応じて異なるCSSを返すため、SRIの設定は技術的に困難です。

- **提案する対策:**

1. **セルフホスティング（推奨）:** Google Fontsをダウンロードしてローカルに配置

```css
/* styles.css に追加 */
@font-face {
  font-family: 'Inter';
  src: url('assets/fonts/inter-var.woff2') format('woff2');
  font-weight: 300 700;
  font-display: swap;
}
```

  - メリット: 外部依存の排除、プライバシー向上（Google へのリクエスト不要）、パフォーマンス向上
  - ツール: [google-webfonts-helper](https://gwfh.mranftl.com/fonts) 等を使用

2. **リスク受容:** Google Fontsは広く使用されており、改ざんリスクは極めて低い

- **期待される効果:** 外部依存の削減、GDPR対応（EU圏でのGoogle Fonts読み込みはGDPR違反の判例あり）
- **工数:** M（フォントファイルのダウンロード + CSS変更）

---

### 🟢 SEC-13: ライブラリバージョンの固定とモニタリング

- **優先度:** 🟢 Low
- **該当ファイル:** 全HTMLファイル
- **リスク説明:**

使用中のライブラリバージョン一覧：

| ライブラリ | バージョン | 最新確認 |
|-----------|-----------|----------|
| i18next | 23.2.3 | ❓ 要確認 |
| i18next-http-backend | 3.0.2 | ❓ 要確認 |
| DOMPurify | 3.2.4 | ❓ 要確認 |
| marked | 15.0.12 | ❓ 要確認 |
| Prism.js | 1.29.0 | ❓ 要確認 |

SRIハッシュによりバージョンは実質固定されていますが（改ざん検知可能）、セキュリティパッチの適用が遅れるリスクがあります。

- **提案する対策:**

1. GitHub Dependabot-like な監視（手動チェックリスト）：

```markdown
## 定期セキュリティチェックリスト（月次）
- [ ] DOMPurify の最新バージョン確認・CVEチェック
- [ ] marked の最新バージョン確認・CVEチェック
- [ ] i18next の最新バージョン確認
- [ ] Prism.js の最新バージョン確認
- [ ] SRIハッシュの再計算・更新
```

2. バージョン更新時のSRI再計算スクリプト：

```bash
# SRIハッシュ生成
curl -s https://cdn.jsdelivr.net/npm/dompurify@3.2.4/dist/purify.min.js | \
  openssl dgst -sha384 -binary | openssl base64 -A
```

- **期待される効果:** 既知の脆弱性への迅速な対応
- **工数:** S（チェックリスト作成 + 月次15分の確認作業）

---

## 5️⃣ 情報開示リスク

### 🟢 SEC-14: AdSense パブリッシャーID の露出

- **優先度:** 🟢 Low
- **該当ファイル:** 全HTMLファイル
- **リスク説明:**

```html
<script async src="...?client=ca-pub-3044810068333301" ...>
```

AdSenseパブリッシャーIDがソースコードに公開されています。これ自体はGoogleの仕様通りであり、直接的なセキュリティリスクではありませんが、以下の情報が推測可能です：

- サイトがAdSenseを利用していること
- 競合分析ツールでの収益推定
- 同一パブリッシャーの他サイトの特定

- **提案する対策:** **リスク受容**（AdSenseの仕様上、公開が必須。対策不要）
- **期待される効果:** N/A
- **工数:** N/A

---

### 🟢 SEC-15: ソーシャルメディアアカウントの紐付け

- **優先度:** 🟢 Low
- **該当ファイル:** 全HTMLファイル（フッター）+ 構造化データ
- **リスク説明:**

GitHub、X（Twitter）、Instagram のアカウントがサイトに紐付けられています。これは意図的な情報開示ですが、フィッシングやソーシャルエンジニアリングに利用される可能性があります。

- **提案する対策:** **リスク受容**（ポートフォリオサイトの目的上、公開が必須）
  - ソーシャルメディアアカウントの2FA有効化を確認
  - 各アカウントのプライバシー設定を定期的に見直し

- **期待される効果:** アカウント乗っ取りリスクの軽減
- **工数:** S（2FA確認作業）

---

### 🟢 SEC-16: `robots.txt` の過度な許可

- **優先度:** 🟢 Low
- **該当ファイル:** `robots.txt`
- **リスク説明:**

```
User-agent: *
Allow: /
```

すべてのクローラーにサイト全体へのアクセスを許可しています。静的サイトでは問題ありませんが、`/docs/` ディレクトリ等の技術的ドキュメントがクロールされる可能性があります。

- **提案する対策:**

```
User-agent: *
Allow: /
Disallow: /docs/
Sitemap: https://studio344.net/sitemap.xml
```

- **期待される効果:** 内部技術ドキュメントの検索エンジンからの除外
- **工数:** S

---

## 6️⃣ HTTPセキュリティヘッダー

### 🟡 SEC-17: セキュリティヘッダーの欠如（GitHub Pages制約）

- **優先度:** 🟡 Medium
- **該当ファイル:** N/A（サーバー設定）
- **リスク説明:**

GitHub PagesではカスタムHTTPヘッダーを設定できないため、以下のセキュリティヘッダーが欠如しています：

| ヘッダー | 目的 | 状態 |
|----------|------|------|
| `X-Content-Type-Options: nosniff` | MIMEスニッフィング防止 | ❌ 設定不可 |
| `X-Frame-Options: DENY` | クリックジャッキング防止 | ❌ 設定不可 |
| `Referrer-Policy: strict-origin-when-cross-origin` | リファラー情報の制限 | ❌ 設定不可 |
| `Permissions-Policy` | ブラウザ機能制限 | ❌ 設定不可 |
| `Strict-Transport-Security` | HTTPS強制 | ✅ GitHub Pagesが自動設定 |

> **補足:** GitHub PagesはデフォルトでHTSTS を設定しますが、その他のセキュリティヘッダーは設定できません。

- **提案する対策:**

1. **`<meta>` タグで可能なもの:** CSP のみ（SEC-06 参照）
2. **Cloudflare等のCDN/プロキシ導入:** HTTPヘッダーを完全制御するには、Cloudflare（無料プラン）やVercel/Netlify等への移行を検討

```
# Cloudflare Workers での設定例（将来対応）
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
```

3. **即座に対応可能:** `Referrer-Policy` と `Permissions-Policy` の `<meta>` タグ対応は限定的。ただし `Referrer-Policy` は `<meta>` で設定可能：

```html
<meta name="referrer" content="strict-origin-when-cross-origin" />
```

- **期待される効果:** クリックジャッキング・MIMEスニッフィング・情報漏洩の防止
- **工数:** S（metaタグ対応）/ L（CDN移行）

---

### 🟡 SEC-18: Referrer-Policy meta タグの追加

- **優先度:** 🟡 Medium
- **該当ファイル:** 全HTMLファイル
- **リスク説明:**

`Referrer-Policy` が未設定のため、外部リンクへの遷移時にフルURLがリファラーとして送信されます。ブログ記事のURL（`#post/xxx`）やページ構造が外部に漏洩する可能性があります。

- **提案する対策:**

```html
<!-- 全HTMLファイルの<head>内に追加 -->
<meta name="referrer" content="strict-origin-when-cross-origin" />
```

- **期待される効果:** 外部サイトへのリファラー情報を最小限に制限
- **工数:** S（全HTMLファイルにmeta追加）

---

## 7️⃣ サードパーティスクリプトリスク

### 🟡 SEC-19: Google AdSense によるページコンテキストへのフルアクセス

- **優先度:** 🟡 Medium
- **該当ファイル:** 全HTMLファイル
- **リスク説明:**

Google AdSenseスクリプトは `async` で読み込まれますが、メインページのコンテキストで実行されるため：

- DOM全体へのアクセスが可能
- Cookie の読み書きが可能
- ユーザーの行動データ（スクロール、クリック等）の収集が可能
- 追加スクリプトの動的ロードが可能

これはGoogleの正当なサービスですが、**信頼の一極集中** リスクがあります。

- **提案する対策:**

1. **最小限の対策（推奨）:**
   - Cookie同意バナーの導入（SEC-08）でAdSenseの読み込みを条件付きにする
   - CSPでAdSense関連ドメインを明示的に許可リストに制限（SEC-06）

2. **高度な対策（将来検討）:**
   - Permissions-Policy で AdSense の機能を制限

```html
<meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()">
```

- **期待される効果:** AdSenseの影響範囲の制限と可視化
- **工数:** S（CSP + Permissions-Policy の追加）

---

### 🟢 SEC-20: unpkg.com のサービス信頼性

- **優先度:** 🟢 Low
- **該当ファイル:** 全HTMLファイル
- **リスク説明:**

`unpkg.com` は npm パッケージのCDNサービスですが、`jsdelivr.net` や `cdnjs.cloudflare.com` と比較して：
- 運営が個人（Michael Jackson氏）ベース
- SLA/稼働保証が不明確
- 過去にダウンタイムの報告あり

SRIにより改ざんリスクは低いですが、可用性のリスクがあります。

- **提案する対策:** `unpkg.com` → `cdn.jsdelivr.net` への移行（SEC-10 と合わせて）

```html
<!-- 移行前 -->
<script src="https://unpkg.com/i18next@23.2.3/i18next.min.js" integrity="sha384-..." crossorigin="anonymous"></script>

<!-- 移行後 -->
<script src="https://cdn.jsdelivr.net/npm/i18next@23.2.3/i18next.min.js" integrity="sha384-..." crossorigin="anonymous"></script>
```

> ⚠️ CDNを変更する場合、SRIハッシュの再計算が必要です（ファイル内容が同一である場合はハッシュも同一）。

- **期待される効果:** CDN可用性の向上、依存先の削減
- **工数:** S（URL置換 + SRIハッシュ確認）

---

## 8️⃣ クライアントサイドデータ処理

### 🟡 SEC-21: URL ハッシュからの postId 取得（入力検証不足）

- **優先度:** 🟡 Medium
- **該当ファイル:** `blog.js` L88-102
- **リスク説明:**

```javascript
window.addEventListener("hashchange", () => {
  const hash = window.location.hash;
  if (hash.startsWith("#post/")) {
    const postId = hash.replace("#post/", "");
    showSinglePost(postId);  // ← hash値をそのまま使用
  }
});
```

`postId` は URL ハッシュから取得されますが、入力検証がありません。`showSinglePost` 内で `list.json` の `posts.find((p) => p.id === postId)` で検索されるため、不正な値は記事が見つからないケースとして処理されます。

しかし以下のリスクがあります：
- `postId` がファイルパス構築に使用される: `assets/posts/${post.baseFilename}.${currentLang}.md`（ただし `post.baseFilename` はJSONから取得されるため、`postId` 自体は直接パスに使われない）
- `updateBreadcrumbs(post.id)` で DOM に挿入される

**現在の実装では大きなリスクはありません** が、防御的プログラミングの観点から検証を追加すべきです。

- **提案する対策:**

```javascript
// postId の入力検証
function sanitizePostId(raw) {
  // 英数字、ハイフン、アンダースコアのみ許可
  return raw.replace(/[^a-zA-Z0-9\-_]/g, '');
}

window.addEventListener("hashchange", () => {
  const hash = window.location.hash;
  if (hash.startsWith("#post/")) {
    const postId = sanitizePostId(hash.replace("#post/", ""));
    if (postId) showSinglePost(postId);
  }
});
```

- **期待される効果:** 不正な入力の早期排除、防御の深層化
- **工数:** S

---

### 🟢 SEC-22: `localStorage` のCookie同意データ

- **優先度:** 🟢 Low
- **該当ファイル:** N/A（SEC-08 の実装後に該当）
- **リスク説明:**

SEC-08 の Cookie同意バナー実装で `localStorage` の使用を提案しましたが、`localStorage` のデータは：
- 同一オリジンのJavaScriptからアクセス可能
- XSS攻撃時に読み取り・改ざんされうる
- 有効期限の設定ができない

同意ステータスの保存先としては `localStorage` が最も適切ですが、以下に注意：

- **提案する対策:**
  - `localStorage` キーにはプレフィックスを付ける（例: `studio344_cookie_consent`）
  - 保存値は単純な文字列（`accepted`/`rejected`）とし、重要データは格納しない
  - XSS 対策の徹底が前提条件

- **期待される効果:** 同意状態の適切な保存と管理
- **工数:** S

---

## 📋 実装優先度マトリクス

### 🔴 即座に対応すべき（Priority 1）

| ID | 提案 | 工数 | 影響 |
|----|------|------|------|
| SEC-01 | DOMPurify フォールバック修正 | S | XSS防止 |
| SEC-02 | i18n innerHTML ホワイトリスト化 | S | XSS防止 |
| SEC-08 | Cookie同意バナー実装 | M | 法令遵守 |
| SEC-06 | CSP meta タグ導入（Report-Only） | M | 防御層追加 |

### 🟡 計画的に対応（Priority 2）

| ID | 提案 | 工数 | 影響 |
|----|------|------|------|
| SEC-03 | HTMLエスケープ関数の導入 | M | XSS防止 |
| SEC-04 | インラインイベントハンドラ排除 | M | CSP互換 |
| SEC-18 | Referrer-Policy meta 追加 | S | 情報漏洩防止 |
| SEC-17 | セキュリティヘッダー（meta対応分） | S | 防御層追加 |
| SEC-10 | CDNプロバイダ統一 | M | 攻撃面縮小 |
| SEC-11 | AdSense SRI リスク文書化 | S | リスク管理 |
| SEC-09 | プライバシーポリシー改訂 | M | 法令遵守 |
| SEC-21 | postId 入力検証 | S | 防御的実装 |

### 🟢 長期的改善（Priority 3）

| ID | 提案 | 工数 | 影響 |
|----|------|------|------|
| SEC-05 | marked セキュリティオプション | S | 多層防御 |
| SEC-07 | unsafe-inline 排除計画 | L | CSP強化 |
| SEC-12 | Google Fonts セルフホスティング | M | GDPR/性能 |
| SEC-13 | ライブラリ定期更新チェックリスト | S | 脆弱性対応 |
| SEC-14 | AdSense Publisher ID（受容） | N/A | - |
| SEC-15 | SNSアカウント2FA確認 | S | アカウント保護 |
| SEC-16 | robots.txt /docs/ 除外 | S | 情報制御 |
| SEC-19 | AdSense Permissions-Policy | S | 機能制限 |
| SEC-20 | unpkg → jsdelivr 移行 | S | 可用性向上 |
| SEC-22 | localStorage キー設計 | S | データ管理 |

---

## ✅ 現在の良好な実装（評価）

| 対策 | 実装状態 | 評価 |
|------|----------|------|
| DOMPurify でのMarkdownサニタイズ | ✅ 実装済 | 優秀（フォールバック問題を除く） |
| SRI（Subresource Integrity） | ✅ 全CDNスクリプトに設定 | 優秀 |
| `rel="noopener noreferrer"` | ✅ 全 `target="_blank"` リンクに設定 | 優秀 |
| `crossorigin="anonymous"` | ✅ CDNスクリプトに設定 | 良好 |
| 404ページの `noindex` | ✅ 設定済 | 良好 |
| フォーム送信なし（外部リンクのみ） | ✅ CSRF/入力攻撃を根本排除 | 優秀 |
| HTTPS強制（GitHub Pages） | ✅ 自動 | 優秀 |
| プライバシーポリシーの存在 | ✅ 基本的な記載あり | 改善余地あり |

---

## 📝 付録: 推奨実装順序

```
Phase 1（即日対応可能 - 1-2時間）:
  ├── SEC-01: DOMPurify フォールバック修正
  ├── SEC-02: i18n innerHTML ホワイトリスト化
  ├── SEC-18: Referrer-Policy meta 追加
  └── SEC-16: robots.txt 更新

Phase 2（1週間以内 - 4-8時間）:
  ├── SEC-08: Cookie同意バナー実装
  ├── SEC-06: CSP Report-Only 導入
  ├── SEC-03: HTMLエスケープ関数導入
  └── SEC-21: postId 入力検証

Phase 3（1ヶ月以内）:
  ├── SEC-09: プライバシーポリシー改訂
  ├── SEC-04: インラインイベントハンドラ排除
  ├── SEC-10: CDN統一
  └── SEC-20: unpkg → jsdelivr 移行

Phase 4（四半期計画）:
  ├── SEC-07: unsafe-inline 排除
  ├── SEC-12: Google Fonts セルフホスティング
  └── SEC-13: ライブラリ更新チェックリスト策定
```

---

> **免責事項:** 本レポートは2026年2月14日時点のコードベースに基づく分析です。セキュリティの脅威は常に変化するため、定期的な再評価を推奨します。
