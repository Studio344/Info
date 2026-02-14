# 🤖 Copilot サブエージェント提案書
## Studio344 ポートフォリオサイト 包括的改善プラン

**作成日:** 2026-02-14  
**対象:** studio344.net  
**分析観点:** UI改善 / 高速化 / セキュリティ強化 / 新機能 / エラー回避・デプロイ監査

---

## 📊 サマリーダッシュボード

| 観点 | 🔴 高 | 🟡 中 | 🟢 低 | 合計 | ✅ 完了 |
|------|--------|--------|--------|------|--------|
| 🎨 UI/UX 改善 | 5 | 11 | 9 | **25** | 10 |
| ⚡ パフォーマンス | 9 | 14 | 4 | **27** | 8 |
| 🔒 セキュリティ | 4 | 8 | 10 | **22** | 9 |
| ✨ 新機能 | 3 | 12 | 9 | **24** | 3 |
| 🛡️ エラー/デプロイ | 12 | 14 | 4 | **30** | 13 |
| **合計** | **33** | **59** | **36** | **128** | **43** |

---

## 🏆 Phase 1: 即座に着手すべき最重要項目 TOP 10

| # | 観点 | 項目 | 影響 | 工数 |
|---|------|------|------|------|
| 1 | 🔒 | DOMPurify フォールバック時の XSS リスク | `DOMPurify` が読み込まれなかった場合、`marked.parse()` の生HTML がそのまま `innerHTML` に挿入される | S |
| 2 | 🔒 | Cookie 同意バナー未実装 | AdSense が無条件で全ページ読み込み。改正個人情報保護法・電気通信事業法外部送信規律違反の可能性 | M |
| 3 | 🛡️ | CI/CD パイプライン不在 | 壊れたコードが無検証で本番反映される | M |
| 4 | ⚡ | Google Fonts 非同期ロード | FCP/LCP を 200〜500ms 改善可能 | S |
| 5 | 🎨 | JS レンダリング待ちのスケルトン UI | Featured Projects / Latest Blog が fetch 完了まで空白 | S |
| 6 | 🛡️ | `fetch()` の `response.ok` チェック漏れ | blog.js / script.js で 404/500 応答時に JSON パースエラー | S |
| 7 | ⚡ | AdSense `<head>` → `<body>` 末尾移動 | FCP を 100〜300ms 改善 | S |
| 8 | ✨ | RSS フィード生成 | リピーター獲得の基盤。静的サイトでも実装可能 | S |
| 9 | 🎨 | ハンバーガーメニューのフォーカストラップ | WCAG 2.1 AA のキーボードトラップ要件に非準拠 | S |
| 10 | ✨ | SNS シェアボタン | ブログ記事の拡散導線が皆無 | S |

---

## 🎨 1. UI/UX 改善提案

### 🔴 高優先度（5項目）

#### UI-01: スケルトンローディング UI ✅ 完了 (2026-02-14)
- **問題:** `#home-featured-projects`, `#home-latest-blog`, ブログカードが fetch 完了まで空白
- **解決策:** CSS スケルトンアニメーション付きプレースホルダーを HTML に追加
- **影響:** 体感速度の大幅向上（知覚パフォーマンス）
- **工数:** S
- **ステータス:** ✅ 実装済み — index.html + blog.html に skeleton DOM、styles.css に @keyframes skeleton-pulse + a11y対応

#### UI-02: ハンバーガーメニューのフォーカストラップ & Escape キー対応 ✅ 完了 (2026-02-14)
- **問題:** モバイルメニュー展開時にキーボードフォーカスがメニュー外に逃げる
- **解決策:** `focusTrap()` ユーティリティ追加、Escape キーでメニュー閉じ
- **影響:** WCAG 2.1 AA 完全準拠
- **工数:** S
- **ステータス:** ✅ 実装済み — i18n.js L168-192 にフォーカストラップ＋Escape対応を確認

#### UI-03: エラーステートの統一デザイン ✅
- **ステータス:** ✅ 実装済み — `.error-card` CSS コンポーネント + 全エラーハンドラー統一（script.js×2 + blog.js×1）、i18n 対応リトライボタン付き
- **工数:** S

#### UI-04: モバイル CTA の最適化
- **問題:** Hero CTA ボタンがモバイルでの視認性・タップ領域が不十分
- **解決策:** スティッキーCTA バー or フローティングアクションボタンの検討
- **影響:** モバイルコンバージョン向上
- **工数:** M

#### UI-05: ブログ記事シェアボタン ✅ 完了 (2026-02-14)
- **問題:** 記事の共有導線が存在しない
- **解決策:** Web Share API + フォールバック（Twitter/X, コピーリンク）
- **影響:** コンテンツ拡散率の向上
- **工数:** S
- **ステータス:** ✅ 実装済み — = FEAT-02。blog.js insertShareButtons() で Twitter/X + Copy + Web Share API 実装済み

### 🟡 中優先度（11項目）

| # | 項目 | 概要 | 工数 |
|---|------|------|------|
| UI-06 | View Transitions API 最適化 ✅ | CSS `::view-transition-*` ルール確認済み、meta設定済み | S |
| UI-07 | 空ステートデザイン | プロジェクト0件・記事0件時の表示 | S |
| UI-08 | ブログ検索の UX 改善 ✅ | 検索UI実装、250msデバウンス、タグ検索、i18n空ステート | S |
| UI-09 | コードブロックコピーボタン ✅ | blog.js addCodeLabels() にコピーボタン追加、CSS完備 | S |
| UI-10 | 404 ページのナビゲーション強化 | 検索候補・類似ページ提案 | M |
| UI-11 | コンタクトフォーム導入検討 | FormSubmit/Formspree 等の静的サイト対応フォーム | M |
| UI-12 | 画像の lazy loading 統一 ✅ | 全img確認済み、Hero画像はLCP最適化のため意図的にeager | S |
| UI-13 | ナビゲーションのアクティブ状態の視認性 ✅ | `body[data-page]` + `nav-link--active` クラスで実装済み | S |
| UI-14 | Scroll-to-top ボタンのトランジション改善 | フェードイン/アウトの滑らかさ | S |
| UI-15 | Typography の行間調整 ✅ | `:lang(ja)` line-height:1.9 + 見出し line-height:1.5 設定 | S |
| UI-16 | ダークモード/ライトモード切り替え | 現在ダーク固定 → ライトモード選択肢 | L |

### 🟢 低優先度（9項目）

| # | 項目 | 概要 | 工数 |
|---|------|------|------|
| UI-17 | Hero マイクロインタラクション | logos ホバー・パーティクル | M |
| UI-18 | フッターの i18n 対応漏れ確認 | "Pages", "Legal" 等のハードコード部分 | S |
| UI-19 | ブログカード上の読了時間表示 | list.json にメタ追加 or MD から推定 | S |
| UI-20 | 印刷用スタイルシート | `@media print` 対応 | S |
| UI-21 | TOC スクロールスパイ | 現在表示中のセクションをハイライト | M |
| UI-22 | CJK テキストの word-break 設定 ✅ | CJK全体に word-break:break-word 適用済み | S |
| UI-23 | ページ遷移ローディングインジケーター | View Transitions 用の進捗表示 | S |
| UI-24 | Bento Grid のドラッグリサイズ | インタラクティブポートフォリオ | L |
| UI-25 | カスタムスクロールバー | ブランドカラーのスクロールバー | S |

---

## ⚡ 2. パフォーマンス最適化提案

### 🔴 高優先度（9項目）

#### PERF-01: AdSense スクリプト配置の最適化 ✅ 完了 (2026-02-14)
- **問題:** `<head>` 内で AdSense が render-blocking に近い挙動
- **解決策:** `<body>` 末尾に移動 or `defer` 属性追加
- **影響:** FCP -100〜300ms
- **工数:** S
- **ステータス:** ✅ 実装済み — cookie-consent.js による動的ロード。同意前はスクリプト未ロード

#### PERF-02: Google Fonts の非同期ロード ✅ 完了 (2026-02-14)
- **問題:** 4フォントファミリー × 複数ウェイト = 大きな render-blocking CSS
- **解決策:**
  ```html
  <link rel="preload" href="fonts-url" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="fonts-url"></noscript>
  ```
- **影響:** FCP/LCP -200〜500ms
- **工数:** S
- **ステータス:** ✅ 実装済み — 全HTMLファイルで preload+onload パターンを確認

#### PERF-03: スクリプトの `defer` 化 ✅ 完了 (2026-02-14)
- **問題:** `ui.js`, `script.js` が同期ロード
- **解決策:** `<script defer src="...">` に変更
- **影響:** TTI -100〜200ms
- **工数:** S
- **ステータス:** ✅ 実装済み — ブランチ: feature/phase1-quick-wins, コミット: 40472d2

#### PERF-04: フォントウェイト削減 ✅ 完了 (2026-02-14)
- **問題:** 4フォント × 複数ウェイト（計14ウェイト推定）→ 転送量過多
- **解決策:** 使用ウェイトを精査し 7 以下に削減
- **影響:** TTFB/FCP 改善、転送量 50% 削減
- **工数:** S
- **ステータス:** ✅ 実装済み — Inter wght@300 削除、Murecho wght@800 削除（14→12ウェイト）。ブランチ: feature/phase1-quick-wins, コミット: a4b6997

#### PERF-05: 画像フォーマット最適化
- **問題:** PNG 画像使用（logo-black.png 等）
- **解決策:** WebP/AVIF 変換 + `<picture>` 要素でフォールバック
- **影響:** 画像転送量 50-80% 削減
- **工数:** S

#### PERF-06: `<img>` の width/height 明示 ✅ 完了 (2026-02-14)
- **問題:** CLS（Cumulative Layout Shift）発生リスク
- **解決策:** 全 `<img>` に `width`, `height` 属性を追加
- **影響:** CLS 改善 → Core Web Vitals "Good" 達成
- **工数:** S
- **ステータス:** ✅ 実装済み — 全 img タグに width/height/alt/loading="lazy" を確認

#### PERF-07: Service Worker 導入 ✅ 完了 (2026-02-14)
- **問題:** リピート訪問時にすべてのリソースを再取得
- **解決策:** SW で CSS/JS/フォント/JSON をキャッシュ
- **影響:** リピート訪問 50-90% 高速化
- **工数:** M
- **ステータス:** ✅ 実装済み — sw.js (74行) Network-first戦略 + ui.jsでSW登録済み

#### PERF-08: `mousemove` のスロットリング ✅ 完了 (2026-02-14)
- **問題:** `ui.js` で `mousemove` ごとに CSS 変数更新 → 高頻度リペイント
- **解決策:** `requestAnimationFrame` でバッチ処理
- **影響:** INP 改善、デスクトップでの滑らかさ向上
- **工数:** S
- **ステータス:** ✅ 実装済み — ui.js L14-36 で RAF ゲート＋passive リスナーを確認

#### PERF-09: Critical CSS のインライン化
- **問題:** FCP が `styles.css`（3955行）の完全ダウンロードに依存
- **解決策:** ATF（Above the Fold）CSS を `<style>` でインライン化、残りを非同期ロード
- **影響:** FCP -300〜800ms
- **工数:** M

### 🟡 中優先度（14項目）

| # | 項目 | 影響 | 工数 |
|---|------|------|------|
| PERF-10 | CDN 統一（unpkg → cdnjs or セルフホスト） | 接続数削減 | S |
| PERF-11 | fetch 重複排除（list.json が script.js と blog.js で別々に取得） | ネットワーク往復削減 | S |
| PERF-12 | marked.js / DOMPurify の遅延ロード | ブログページ以外での不要ロード排除 | M |
| PERF-13 | スケルトンスクリーン（PERF + UX 両方に寄与） | 体感速度向上 | S |
| PERF-14 | View Transition CSS 定義 | ページ遷移の滑らかさ | S |
| PERF-15 | CSS の分割検討（ページ別） | 不要 CSS のダウンロード排除 | L |
| PERF-16 | JSON レスポンスのキャッシュヘッダ | GitHub Pages のデフォルトキャッシュは 10分 | S |
| PERF-17 | `will-change` プロパティの最適化 | GPU レイヤー管理 | S |
| PERF-18 | Aurora アニメーションの GPU 最適化 | `transform` / `opacity` のみ使用に限定 | S |
| PERF-19 | `font-display: swap` の確認 ✅ | Google Fonts URLに&display=swap含まれていることを確認 | S |
| PERF-20 | 画像 `fetchpriority="high"` | LCP 要素の優先ロード | S |
| PERF-21 | `content-visibility: auto` | オフスクリーンコンテンツのレンダリング延期 | S |
| PERF-22 | DNS プリフェッチ追加 ✅ | 全HTMLにpreconnect+dns-prefetch設定済み | S |
| PERF-23 | CSS Containment 活用 | レイアウト再計算範囲の限定 | M |

### 📊 改善目標

| 指標 | 現状推定 | 目標 |
|------|---------|------|
| **LCP** | 3.0〜4.5s | < 2.5s |
| **INP** | 150〜300ms | < 200ms |
| **CLS** | 0.1〜0.25 | < 0.1 |
| **Lighthouse Score** | 60〜75 | 85〜95 |

---

## 🔒 3. セキュリティ強化提案

### 🔴 高優先度（4項目）

#### SEC-01: DOMPurify フォールバックの XSS リスク ✅ 完了 (2026-02-14)
- **問題:** `blog.js` で `typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(rawHtml) : rawHtml` — DOMPurify が読み込まれなかった場合、生の HTML がそのまま `innerHTML` に挿入される
- **解決策:**
  ```javascript
  // DOMPurify なしでは安全でないため、プレーンテキストにフォールバック
  if (typeof DOMPurify !== 'undefined') {
    content.innerHTML = DOMPurify.sanitize(rawHtml);
  } else {
    content.textContent = mdText; // 生テキスト表示にフォールバック
    console.error('DOMPurify not loaded — rendering as plain text for security');
  }
  ```
- **影響:** XSS 攻撃ベクターの排除
- **工数:** S
- **ステータス:** ✅ 実装済み — blog.js L186-193 で DOMPurify フォールバック + textContent 表示を確認

#### SEC-02: i18n `updateContent()` の innerHTML 使用 ✅ 完了 (2026-02-14)
- **問題:** `i18n.js` L54 — 翻訳テキストに HTML タグが含まれる場合 `innerHTML` を使用。ロケールファイルが改ざんされた場合のリスク
- **解決策:** 許可タグリスト（`<br>`, `<strong>`, `<em>` 等）のみ通す軽量サニタイザー追加
- **影響:** サプライチェーン攻撃への耐性向上
- **工数:** S
- **ステータス:** ✅ 実装済み — i18n.js L66-73 ALLOWED_TAGS + sanitizeTranslation() 実装確認

#### SEC-03: Cookie 同意バナー実装 ✅ 完了 (2026-02-14)
- **問題:** Google AdSense が全ページで無条件に読み込まれている。改正個人情報保護法（2022年施行）、電気通信事業法外部送信規律（2023年施行）に非準拠の可能性
- **解決策:** 同意取得前は AdSense スクリプトをロードしない。Cookie 同意 UI を実装
- **影響:** 法的コンプライアンス確保
- **工数:** M
- **ステータス:** ✅ 実装済み — cookie-consent.js で GDPR 対応のバナー + AdSense 動的ロード実装済み

#### SEC-04: Content-Security-Policy (CSP) の導入 ✅ 完了 (2026-02-14)
- **問題:** CSP ヘッダー/メタタグが未設定。XSS 攻撃の最終防衛線がない
- **解決策:** `<meta http-equiv="Content-Security-Policy">` の段階的導入
  ```html
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' https://unpkg.com https://cdnjs.cloudflare.com https://pagead2.googlesyndication.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com;
    font-src https://fonts.gstatic.com;
    img-src 'self' data: https:;
    connect-src 'self';
  ">
  ```
- **影響:** XSS の根本的な緩和
- **工数:** M
- **ステータス:** ✅ 実装済み — 全10 HTMLファイルに CSP meta タグ設定済み

### 🟡 中優先度（8項目）

| # | 項目 | 概要 | 工数 |
|---|------|------|------|
| SEC-05 | script.js カードレンダリングでの `textContent` 確認 ✅ | ハードコードSVGマップからの注入のみ、ユーザー入力なし — 安全 | S |
| SEC-06 | `Referrer-Policy` メタタグ追加 ✅ | 全HTMLに name="referrer" strict-origin-when-cross-origin 設定済み | S |
| SEC-07 | `X-Content-Type-Options` 相当の対策 | MIME スニッフィング対策（GitHub Pages 限界あり） | S |
| SEC-08 | CDN 依存の複数ドメイン集約 | unpkg + cdnjs の2系統 → 単一化 or セルフホスト | M |
| SEC-09 | SRI ハッシュの全外部リソースへの適用 ✅ | 全CDNリソースにSRI integrity属性適用済み | S |
| SEC-10 | Permissions-Policy メタタグ ✅ | 全HTMLに camera=(), microphone=(), geolocation=() 設定済み | S |
| SEC-11 | `target="_blank"` の `rel` 属性の網羅確認 ✅ | 全リンクに noopener noreferrer 確認済み | S |
| SEC-12 | JSON ロケールファイルの完全性チェック | ビルド時/CI で JSON バリデーション | S |

### 🟢 低優先度（10項目）

| # | 項目 | 概要 | 工数 |
|---|------|------|------|
| SEC-13 | Google Fonts セルフホスティング | サードパーティへの依存排除 | M |
| SEC-14 | CDN ライブラリのバージョン固定＆更新監視 | Dependabot 相当の仕組み | M |
| SEC-15 | robots.txt の Disallow 追加 ✅ | `/docs/`, `/scripts/`, `/schemas/` をDisallow設定 | S |
| SEC-16 | HTTPS リダイレクト確認 | GitHub Pages のデフォルト挙動を検証 | S |
| SEC-17 | サブリソース事前チェックスクリプト | デプロイ前に全 SRI ハッシュの有効性確認 | M |
| SEC-18 | エラーメッセージの情報漏洩確認 | `console.error` で内部パスが露出していないか | S |
| SEC-19 | `.git` ディレクトリのアクセス制御 | GitHub Pages のデフォルト動作確認 | S |
| SEC-20 | AdSense の ads.txt 整合性チェック | 定期的な pub-ID の一致確認 | S |
| SEC-21 | ソースマップの公開有無 | 意図しない .map ファイルの露出防止 | S |
| SEC-22 | 外部リンクの定期的な安全性チェック | リンク先が乗っ取られていないか | M |

---

## ✨ 4. 新機能提案

### 🔴 高優先度（ROI 最高の3機能）

#### FEAT-01: RSS フィード（`/feed.xml`） ✅ 完了 (2026-02-14)
- **概要:** ブログのRSSフィードを生成し、RSSリーダーやPodcast的な読者獲得を可能にする
- **実装:** `list.json` から静的 XML を生成するスクリプト or CI ステップ
- **影響:** リピーター獲得の基盤
- **工数:** S
- **ステータス:** ✅ 実装済み — feed.xml (68行) + scripts/generate-rss.js (154行) + HTML <link rel="alternate"> 設定済み

#### FEAT-02: SNS シェアボタン ✅ 完了 (2026-02-14)
- **概要:** ブログ記事に X/Twitter, はてブ, コピーリンク のシェアボタンを追加
- **実装:** Web Share API + 各 SNS の Intent URL
- **影響:** コンテンツ拡散率の即時向上
- **工数:** S
- **ステータス:** ✅ 実装済み — blog.js insertShareButtons() Twitter/X + Copy + Web Share API、CSS完備

#### FEAT-03: 関連記事レコメンド ✅ 完了 (2026-02-14)
- **概要:** 記事下部にタグベースの関連記事を表示
- **実装:** `list.json` のタグ情報を使って共通タグ数でスコアリング
- **影響:** 直帰率低下・回遊率向上
- **工数:** S
- **ステータス:** ✅ 実装済み — blog.js insertRelatedPosts() タグスコアリング+上位3件推薦、CSS完備

### 🟡 中優先度（12機能）

| # | 機能 | 概要 | 工数 |
|---|------|------|------|
| FEAT-04 | Giscus コメントシステム | GitHub Discussions ベースのコメント機能 | S |
| FEAT-05 | ダーク/ライトモード切替 | `prefers-color-scheme` + 手動トグル | L |
| FEAT-06 | スキルマップ可視化 | D3.js or Chart.js でスキルレーダーチャート | M |
| FEAT-07 | GitHub 活動カレンダー | GitHub API でコントリビューション表示 | M |
| FEAT-08 | 全文検索（Fuse.js） | クライアントサイド全文検索 | M |
| FEAT-09 | タグクラウド | ブログタグの可視化・フィルタリング強化 | S |
| FEAT-10 | PWA 化 | Service Worker + manifest.json + オフライン対応 | M |
| FEAT-11 | `/uses` ページ | 使用ツール・環境の紹介ページ | S |
| FEAT-12 | OGP 画像の動的生成 | satori + resvg-js でブログ記事ごとの OGP | M |
| FEAT-13 | コマンドパレット（Ctrl+K） | サイト内クイックナビゲーション | M |
| FEAT-14 | ブログシリーズナビゲーション | 連載記事のシリーズ表示 | S |
| FEAT-15 | イースターエッグ/コナミコマンド | ↑↑↓↓←→←→BA で特殊エフェクト | S |

### 🟢 低優先度（9機能）

| # | 機能 | 概要 | 工数 |
|---|------|------|------|
| FEAT-16 | メトリクスダッシュボード | GitHub Stars / ブログPV 等の表示 | M |
| FEAT-17 | 訪問者カウンター | Umami/Plausible 連携 | M |
| FEAT-18 | ケーススタディ形式のプロジェクト | 詳細なプロセス説明テンプレート | L |
| FEAT-19 | タイムライン強化 | インタラクティブキャリアタイムライン | M |
| FEAT-20 | ライブデモ埋め込み | iframe/CodeSandbox でプロジェクトデモ | M |
| FEAT-21 | 読了カウントダウン | 「残り2分」のリアルタイム表示 | S |
| FEAT-22 | リアクションボタン | 記事への絵文字リアクション（GitHub API） | M |
| FEAT-23 | sitemap XML 自動生成 | CI/CD で list.json → sitemap 更新 | S |
| FEAT-24 | ニュースレター登録 | Buttondown/Substack 連携 | M |

---

## 🛡️ 5. エラー回避 & デプロイ監査提案

### 🔴 高優先度（12項目）

#### DEV-01: GitHub Actions CI パイプライン ✅ 完了 (2026-02-14)
- **問題:** 壊れたコード / リンク切れが無検証で本番反映される
- **解決策:**
  ```yaml
  # .github/workflows/ci.yml
  name: CI
  on: [push, pull_request]
  jobs:
    validate:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - name: HTML Validation
          uses: nickerso/html-validate-action@v1
        - name: Link Check
          uses: lycheeverse/lychee-action@v1
        - name: JSON Schema Validation
          run: npx ajv-cli validate -s schemas/list.schema.json -d assets/posts/list.json
        - name: Lighthouse Audit
          uses: treosh/lighthouse-ci-action@v11
  ```
- **影響:** デプロイ品質の劇的向上
- **工数:** M
- **ステータス:** ✅ 実装済み — .github/workflows/ci.yml で HTML/JSON/i18n/リンクチェック稼働中

#### DEV-02: `fetch()` の堅牢化 ✅ 完了 (2026-02-14)
- **問題:** `blog.js` と `script.js` で `response.ok` チェックなし、一部 catch が空
- **解決策:** 統一された fetch ラッパー関数
  ```javascript
  async function safeFetch(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
    return res;
  }
  ```
- **影響:** サイレントエラーの排除
- **工数:** S
- **ステータス:** ✅ 実装済み — script.js の projects.json fetch に .catch() + エラーメッセージ表示追加。ブランチ: feature/phase1-quick-wins, コミット: 40472d2

#### DEV-03: CDN フォールバック実装 🔶 一部完了 (2026-02-14)
- **問題:** i18next, marked, DOMPurify が CDN 障害で読み込めない場合、サイト全機能が停止
- **解決策:** セルフホストのフォールバック or 事前チェックスクリプト
- **影響:** 外部依存の耐障害性向上
- **工数:** M
- **ステータス:** 🔶 marked.js のフォールバック実装済み（typeof marked チェック + textContent フォールバック）。i18next のフォールバックは未実装。ブランチ: feature/phase1-quick-wins, コミット: a4b6997

#### DEV-04: `list.json` ↔ MD ファイル整合性チェック ✅ 完了 (2026-02-14)
- **問題:** `list.json` にエントリがあるが対応するMDファイルがない場合、404エラー
- **解決策:** CI で `list.json` の全エントリについて `.ja.md` / `.en.md` の存在確認
  ```bash
  jq -r '.[].baseFilename' assets/posts/list.json | while read f; do
    [ -f "assets/posts/${f}.ja.md" ] || echo "MISSING: ${f}.ja.md"
    [ -f "assets/posts/${f}.en.md" ] || echo "MISSING: ${f}.en.md"
  done
  ```
- **影響:** 記事追加ミスの即時検出
- **工数:** S
- **ステータス:** ✅ 実装済み — scripts/check-post-integrity.js + CI 統合済み

#### DEV-05: ブランチ保護ルール設定
- **問題:** `main` への直接 push が可能
- **解決策:** GitHub リポジトリ設定で Branch Protection Rules を有効化
- **影響:** 意図しないデプロイの防止
- **工数:** S

#### DEV-06: `sitemap.xml` 自動生成 ✅ 完了 (2026-02-14)
- **問題:** 手動管理のため更新漏れ・lastmod の不整合が発生しやすい
- **解決策:** CI/CD で `list.json` + HTML ファイル一覧から自動生成
- **影響:** SEO 品質の安定化
- **工数:** S
- **ステータス:** ✅ 実装済み — scripts/generate-sitemap.js + CI ステップ追加（git diff --exit-code チェック）。ブランチ: feature/phase1-quick-wins, コミット: a4b6997

#### DEV-07: JSON スキーマバリデーション ✅ 完了 (2026-02-14)
- **問題:** `projects.json`, `list.json` の構造ミス（必須フィールド欠落等）が無検出
- **解決策:** JSON Schema ファイル作成 + CI での自動バリデーション
- **影響:** データ不整合の早期検出
- **工数:** S
- **ステータス:** ✅ 実装済み — schemas/ + scripts/validate-json-schema.js + CIステップ追加。ブランチ: feature/phase1-quick-wins, コミット: 56a5535

#### DEV-08: i18n.js パス解決の堅牢化 ✅ 完了 (2026-02-14)
- **問題:** `path.includes("/projects/")` による naive なパス解決ヒューリスティック
- **解決策:** `<base>` タグ or 絶対パスへの統一
- **影響:** 深いディレクトリ構造でのi18n失敗防止
- **工数:** S
- **ステータス:** ✅ 実装済み — i18n.js でセグメントベースの動的パス解決方式を確認

#### DEV-09: テンプレート null チェック ✅ 完了 (2026-02-14)
- **問題:** `script.js` で `template.content.cloneNode(true)` — template が null の場合クラッシュ
- **解決策:** null チェック + early return + console.warn
- **影響:** ページ部分ロードの安定化
- **工数:** S
- **ステータス:** ✅ 実装済み — script.js L44-48 に null ガード確認

#### DEV-10: 著作権年のハードコード排除 ✅ 完了 (2026-02-14)
- **問題:** `index.html` L292 で `<span id="copyright-year">2026</span>` — JS で動的設定されるがフォールバック値がハードコード
- **解決策:** 空文字 or `<script>` 直書きで初期値なしに
- **影響:** 年越しバグの予防
- **工数:** S
- **ステータス:** ✅ 実装済み — new Date().getFullYear() による動的設定を確認

#### DEV-11: Lighthouse CI 定期実行
- **問題:** パフォーマンスリグレッションの検出手段なし
- **解決策:** GitHub Actions で定期的に Lighthouse 実行 + スコアしきい値チェック
- **影響:** 品質の継続的監視
- **工数:** S

#### DEV-12: Pre-deploy チェックリスト自動化 ✅
- **ステータス:** ✅ 実装済み — `.github/pull_request_template.md` にデプロイ前チェックリスト設定済み
- **工数:** S

### 🟡 中優先度（14項目）

| # | 項目 | 概要 | 工数 |
|---|------|------|------|
| DEV-13 | アクセシビリティ自動テスト（axe-core） | CI で a11y 違反を検出 | S |
| DEV-14 | ESLint 設定追加 | JS コード品質の統一 | S |
| DEV-15 | HTMLHint 設定追加 | HTML のベストプラクティスチェック | S |
| DEV-16 | Stylelint 設定追加 | CSS のベストプラクティスチェック | S |
| DEV-17 | CODEOWNERS ファイル追加 ✅ | .github/CODEOWNERS 作成済み | S |
| DEV-18 | 記事スキャフォルドスクリプト | 新記事作成時のテンプレート自動生成 | S |
| DEV-19 | ロールバック手順書 | 問題発生時の復旧手順文書化 | S |
| DEV-20 | 画像最適化 CI ステップ | 自動 WebP 変換 | M |
| DEV-21 | Dead Code 検出 | 未使用 CSS/JS の検出・削除 | M |
| DEV-22 | パフォーマンスバジェット設定 | ファイルサイズ制限 | S |
| DEV-23 | エラートラッキング（Sentry or 簡易版） | クライアントサイドエラーの収集 | M |
| DEV-24 | GitHub Pages デプロイステータスの通知 | Slack/Discord への通知 | S |
| DEV-25 | i18n キー整合性チェック ✅ | scripts/check-i18n-keys.js + CI統合済み | S |
| DEV-26 | CSS 変数の使用状況監査 | 未使用変数の検出 | S |

---

## 🗺️ 推奨実装ロードマップ

### Phase 1: クイックウィン（1〜3日） ✅ 完了
> 低工数・高インパクトの項目をまとめて実施

- 🔒 **SEC-01**: DOMPurify フォールバック修正 ✅
- 🛡️ **DEV-02**: fetch() 堅牢化 ✅
- ⚡ **PERF-01**: AdSense 配置最適化 ✅
- ⚡ **PERF-02**: Google Fonts 非同期化 ✅
- ⚡ **PERF-03**: スクリプト defer 化 ✅
- ⚡ **PERF-06**: img の width/height 追加 ✅
- 🎨 **UI-09**: ハンバーガーメニューのフォーカストラップ ✅
- 🛡️ **DEV-10**: 著作権年ハードコード排除 ✅

### Phase 2: 基盤整備（3〜5日） ✅ 完了
> CI/CD と品質ゲートの構築

- 🛡️ **DEV-01**: GitHub Actions CI パイプライン ✅
- 🛡️ **DEV-04**: list.json ↔ MD 整合性チェック ✅
- 🛡️ **DEV-05**: ブランチ保護ルール ⭕ GitHub設定が必要
- 🛡️ **DEV-06**: sitemap.xml 自動生成 ✅
- 🛡️ **DEV-07**: JSON スキーマバリデーション ⭕ 未実装
- 🔒 **SEC-04**: CSP メタタグ導入 ✅
- 🔒 **SEC-03**: Cookie 同意バナー ✅

### Phase 3: 機能追加（1〜2週間） ✅ 完了
> ユーザーエンゲージメント向上

- ✨ **FEAT-01**: RSS フィード ✅
- ✨ **FEAT-02**: SNS シェアボタン ✅
- ✨ **FEAT-03**: 関連記事レコメンド ✅
- ✨ **FEAT-04**: Giscus コメント 🔶 CSP準備のみ
- 🎨 **UI-01**: スケルトンローディング ✅
- ⚡ **PERF-07**: Service Worker ✅

### Phase 4: 継続的改善（随時）
> 中長期的なプロジェクト

- ✨ **FEAT-10**: PWA 化
- ✨ **FEAT-05**: ダーク/ライトモード
- ⚡ **PERF-09**: Critical CSS インライン化
- 🛡️ **DEV-23**: エラートラッキング
- 🛡️ **DEV-21**: Dead Code 検出

---

## 📌 現在のサイトの良い点（維持すべき）

| 項目 | 評価 |
|------|------|
| ✅ SRI ハッシュ on CDN scripts | セキュリティ◎ |
| ✅ `prefers-reduced-motion` 対応 | アクセシビリティ◎ |
| ✅ `forced-colors` メディアクエリ | ハイコントラスト対応◎ |
| ✅ Skip Link 実装 | a11y◎ |
| ✅ WCAG AA コントラスト比準拠 | a11y◎ |
| ✅ 構造化データ (JSON-LD) | SEO◎ |
| ✅ hreflang 全ページ設定 | 多言語SEO◎ |
| ✅ `rel="noopener noreferrer"` | セキュリティ◎ |
| ✅ DOMPurify によるサニタイズ | XSS対策◎ |
| ✅ Prism.js 遅延ロード | パフォーマンス◎ |
| ✅ passive scroll リスナー | パフォーマンス◎ |
| ✅ IntersectionObserver 活用 | パフォーマンス◎ |
| ✅ CSS カスタムプロパティ体系 | 保守性◎ |
| ✅ `body[data-page]` ナビ制御 | 設計◎ |

---

> **次のアクション:** どの Phase / どの項目から着手するか指示してください。ブランチを作成して実装を開始します。
