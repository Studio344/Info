# サイト監査 Phase 1-4 修正ノート

## 📅 実施日: 2026年

## 🎯 概要
サイト全体を4段階（Critical → High → Medium → Low）で監査し、一括修正を実施。

---

## Phase 1: 🔴 Critical — セキュリティ & パフォーマンス

### SRI (Subresource Integrity) の追加
**対象:** CDNから読み込む全外部スクリプト・CSS

```html
<!-- Before: SRIなし → CDNが改ざんされると悪意あるコードが実行される -->
<script src="https://cdn.example.com/lib.js"></script>

<!-- After: SRIあり → ハッシュ不一致時はブラウザがブロック -->
<script src="https://cdn.example.com/lib.js"
  integrity="sha384-xxxxx" crossorigin="anonymous"></script>
```

**技術ポイント:**
- `integrity` 属性にBase64エンコードされたSHA-384ハッシュを指定
- `crossorigin="anonymous"` が必須（CORSヘッダーとの連携）
- ハッシュ生成コマンド: `curl -s URL | openssl dgst -sha384 -binary | openssl base64 -A`

### GSAP不要スクリプトの除去
- 全ページからGSAPスクリプトを削除
- 実際にはGSAPのアニメーションコードは全てコメントアウト済みだった
- **学び:** 使わないCDNを残すと無駄な帯域 + 攻撃面の拡大

### CDNバージョン固定
```html
<!-- Before: バージョン未指定 → 予告なくメジャーアップデートされるリスク -->
<script src="https://unpkg.com/i18next-http-backend/i18nextHttpBackend.min.js"></script>

<!-- After: @3.0.2で固定 -->
<script src="https://unpkg.com/i18next-http-backend@3.0.2/i18nextHttpBackend.min.js"></script>
```

---

## Phase 2: 🟠 High — SEO & アクセシビリティ

### JSON-LD 構造化データ
各ページに適切なSchema.orgタイプを設定:
- `index.html` → `WebSite`
- `about.html` → `AboutPage`
- `blog.html` → `Blog`
- `contact.html` → `ContactPage`
- `projects.html` → `CollectionPage`
- `projects/*.html` → `SoftwareApplication`
- `terms.html`, `privacy-policy.html` → `WebPage`

### Twitter Card メタタグ
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@studio0344" />
```

### Skip Link (スキップリンク)
スクリーンリーダーやキーボードユーザーがナビゲーションを飛ばせる:
```html
<a href="#main-content" class="skip-link">メインコンテンツへスキップ</a>
```
CSSで通常時は非表示、`:focus`で表示。

### aria-label
言語切替ボタンに `aria-label="言語を切り替え / Switch language"` を追加。

### rel="noopener noreferrer"
`target="_blank"` リンクのセキュリティ対策。逆参照攻撃を防止。

---

## Phase 3: 🟡 Medium — パフォーマンス最適化

### Google Fonts @import → link preconnect
```css
/* Before: CSSの@import → レンダリングブロック */
@import url('https://fonts.googleapis.com/css2?...');
```
```html
<!-- After: preconnectで事前DNS解決 + 早期接続 -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?..." rel="stylesheet" />
```
**効果:** フォント読み込み開始が約200-500ms早くなる

### html lang属性の動的更新
```javascript
i18next.on("languageChanged", (lng) => {
  document.documentElement.lang = lng.substring(0, 2);
  updateContent();
});
```
**重要性:** スクリーンリーダーが正しい言語で読み上げ + SEOでの言語認識

---

## Phase 4: 🟢 Low — コード品質

### Dead Code 除去
- `ui.js`: コメントアウトされていた3D Tiltエフェクト（約40行）を削除
- `script.js`: 無効化されていたGSAPアニメーションコード（約12行）を削除
- `terms.html`, `privacy-policy.html`: ui.jsと重複するインラインmousemoveスクリプトを除去

### フッターリンクのCSS化
インライン `style="color: #666"` → `.footer-link` クラスに統一。
- コントラスト比をWCAG AA準拠に改善 (#666→#999)
- ホバーエフェクト追加

### focus-visible スタイル
```css
:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}
```
キーボードナビゲーション時のフォーカス表示を改善。

---

## ⚠️ 注意: script defer の実行順序
`defer` 属性は「ドキュメント解析後に実行」を意味する。
非deferスクリプトと混在すると実行順序が壊れる:

```
非defer: パーサーが遭遇した時点で即実行
defer:   ドキュメント解析完了後に、ドキュメント順で実行
```

今回の教訓: i18nextに`defer`を付けると、依存する`i18n.js`（非defer）が先に実行されてエラーになる。
→ 解決: i18nextから`defer`を除去し、全スクリプトを同じタイミング（body底部、非defer）で実行。

---

## 📊 変更ファイル一覧
| ファイル | 主な変更 |
|---|---|
| 全9 HTML | SRI, Twitter Card, JSON-LD, Skip Link, aria-label, preconnect |
| styles.css | skip-link, footer-link, focus-visible スタイル追加 |
| i18n.js | html lang属性の動的更新 |
| ui.js | Dead code除去 |
| script.js | Dead code除去 |
