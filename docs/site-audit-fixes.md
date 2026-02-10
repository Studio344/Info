# サイト監査修正ログ

**日付:** 2026年  
**ブランチ:** `refactor/site-audit-fixes`

## 📋 概要

デザイナー視点でのサイト監査（58項目）を実施し、全項目を修正。主にCSS設計の近代化、アクセシビリティ改善、インラインスタイルの排除を実施。

---

## 🎨 CSS デザイントークン（`:root` 変数）

### なぜ必要か
ハードコードされた色・フォントサイズが散在していると:
- 一括変更が困難
- 一貫性が崩れやすい
- ダークモード等の将来拡張が難しい

### 追加したトークン

```css
:root {
  /* テキストカラー (WCAG AA 準拠) */
  --text-primary: #ededed;     /* 17.4:1 on #030303 */
  --text-light: #cccccc;       /* 12.7:1 */
  --text-secondary: #a0a0a0;   /* 7.5:1 */
  --text-muted: #888888;       /* 5.7:1 */
  
  /* アクセントカラー */
  --accent-indigo: #6366f1;
  --accent-violet: #a78bfa;
  --accent-lavender: #a5b4fc;
  --accent-purple: #c4b5fd;
  
  /* フォント */
  --font-main: 'Inter', sans-serif;
  --font-heading: 'Outfit', sans-serif;
  --font-blog-heading: 'Sora', 'Outfit', sans-serif;
  --font-mono: 'Courier New', monospace;
  
  /* フォントサイズ (最小 0.75rem = 12px) */
  --text-xs: 0.75rem;
  --text-sm: 0.8rem;
  --text-base: 0.875rem;
}
```

### 学びのポイント
- **WCAG AA** はコントラスト比 **4.5:1** 以上（通常テキスト）
- `#666` は `#030303` 背景で **3.5:1** → 不合格 → `#888` (5.7:1) に引き上げ
- CSS変数は `var(--token-name)` で参照し、フォールバック値も指定可能

---

## ♿ アクセシビリティ対応

### `prefers-reduced-motion`
```css
@media (prefers-reduced-motion: reduce) {
  .aurora-orb, .orbit-ring, .typing-text::after,
  .scroll-indicator { animation: none !important; }
  * { transition-duration: 0.01ms !important; }
}
```
**理由:** 前庭障害のあるユーザーがアニメーションで体調不良を起こす可能性。OS設定を尊重する。

### `aria-live="polite"`
タイピングアニメーションの `<p>` に設定。スクリーンリーダーがテキスト変更を読み上げる。

### `aria-label`
- スキルバッジ: アイコンのみの要素に`aria-label`で説明を追加
- SNSリンク: `aria-label="GitHub @Studio344"` 等

### フォーカス表示の改善
```css
:focus-visible {
  outline: 2px solid rgba(165, 180, 252, 0.8); /* より視認性の高い色 */
}
```

---

## 📐 インラインスタイル → CSSクラス

### なぜインラインスタイルを避けるべきか
1. **優先度が高すぎる** — CSSの上書きに `!important` が必要になる
2. **再利用不可** — 同じスタイルを複数箇所で書く必要がある
3. **メンテナンス困難** — HTML内に散在するスタイルを見つけるのが大変

### 追加したクラス例
| クラス名 | 用途 |
|---|---|
| `.logo-link` | ヘッダーロゴリンクのスタイル |
| `.footer-links` | フッターリンクグループ |
| `.home-nav-card` | ホーム画面ナビカード共通 |
| `.home-nav-card--projects` | Projectsカード固有 |
| `.contact-content` | コンタクトページ中央寄せ |
| `.legal-updated` | 法的ページの最終更新日 |

---

## 📱 レスポンシブデザイン

### タブレットブレイクポイント追加
```css
@media (min-width: 769px) and (max-width: 1024px) {
  .bento-grid { grid-template-columns: repeat(8, 1fr); }
}
```
**理由:** モバイル(1カラム)とデスクトップ(12カラム)の間にタブレット用の中間レイアウトが必要。

### Safe Area Insets
```css
padding: 4.5rem max(0.6rem, env(safe-area-inset-left)) 1.5rem;
```
**理由:** iPhone のノッチ/Dynamic Island対応。

---

## 🔑 `!important` の削除方針

`!important` はCSSの詳細度（specificity）を無視して強制適用する。
- デバッグが困難になる
- CSSの自然なカスケードが壊れる
- **代替策:** セレクタの詳細度を上げる（`.parent .child` 等）

### 例外
- `prefers-reduced-motion` の `animation: none !important;` — ユーザー設定を確実に尊重するため必要

---

## 📝 コミット履歴

1. `874954d` — CSS: デザイントークン整備・コントラスト修正・最小フォントサイズ等
2. `2325244` — HTML/JS: インラインスタイル削除・フォント統一・アクセシビリティ改善
