# 静的サイトのセキュリティ強化 — CSP・GDPR・SRI を GitHub Pages で実装する

GitHub Pages で運用する静的サイトでも、セキュリティ対策は必須です。この記事では、ポートフォリオサイト studio344.net に実装した CSP（Content Security Policy）、Cookie 同意バナー、SRI（Subresource Integrity）ハッシュ検証について、具体的なコードと設定を解説します。

## なぜ静的サイトにセキュリティ対策が必要か

「静的サイトにはサーバーサイドの脆弱性がないから安全」という認識は誤りです。CDN 経由の外部スクリプト読み込み、広告スクリプト、ユーザー入力の表示など、XSS や Supply Chain 攻撃のリスクは静的サイトにも存在します。

## 1. Content Security Policy（CSP）

### GitHub Pages の制約

GitHub Pages ではカスタム HTTP ヘッダーを設定できません。そのため、`<meta>` タグで CSP を実装します。

```html
<meta http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self' https://unpkg.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://pagead2.googlesyndication.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https:;
    connect-src 'self';
  ">
```

### ポイント

- **`default-src 'self'`**: デフォルトで同一オリジンのみ許可
- **`script-src`**: CDN ドメインを個別に許可（ワイルドカード禁止）
- **`style-src 'unsafe-inline'`**: CSS カスタムプロパティの動的設定で必要（改善の余地あり）
- **`img-src data:`**: Base64 インライン画像用

### 全ページへの適用

CSP メタタグは全 HTML ファイルの `<head>` に配置する必要があります。1つでも漏れるとそのページが無防備になります。

## 2. その他のセキュリティヘッダー（meta タグ）

```html
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta name="referrer" content="strict-origin-when-cross-origin">
```

- **`X-Content-Type-Options: nosniff`**: MIME スニッフィング防止
- **`Referrer-Policy`**: クロスオリジン遷移時にパス情報を送信しない

## 3. Cookie 同意バナー（GDPR 対応）

### 実装構成

```
assets/js/cookie-consent.js  — バナーの表示/非表示制御
styles.css                   — バナーのスタイル
locales/ja.json, en.json     — 多言語対応テキスト
```

### 基本フロー

1. ページ読み込み時に `localStorage` の同意状態を確認
2. 未同意ならバナーを表示
3. 「同意」→ AdSense スクリプトを動的ロード
4. 「拒否」→ 広告なしで閲覧継続
5. フッターの「Cookie 設定」リンクからいつでも変更可能

```javascript
function loadAdSense() {
  if (localStorage.getItem('cookie-consent') !== 'accepted') return;
  const script = document.createElement('script');
  script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
  script.async = true;
  document.head.appendChild(script);
}
```

### GDPR の要件

- **事前同意:** 同意前にトラッキング Cookie を設置しない
- **明示的選択:** 「同意」と「拒否」の両方のボタンを同等に提示
- **撤回可能:** いつでも同意を撤回できる UI を提供

## 4. SRI（Subresource Integrity）ハッシュ検証

### SRI とは

CDN から読み込む外部スクリプトが改ざんされていないことを検証する仕組みです。

```html
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.2.4/dist/purify.min.js"
  integrity="sha384-eEu5CTj3qG..."
  crossorigin="anonymous"></script>
```

### 実際に遭遇した問題

DOMPurify 3.2.4 の SRI ハッシュが、ある時点で不一致になりブラウザが読み込みをブロックしました。原因は **CDN 側のファイル内容が更新された**（同じバージョンでもビルド成果物が変わる場合がある）ことでした。

### 検証コマンド

```bash
curl -s https://cdn.jsdelivr.net/npm/dompurify@3.2.4/dist/purify.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

このコマンドで得られるハッシュと HTML の `integrity` 属性の値が一致することを確認します。

### 教訓

- ドキュメントからハッシュをコピーするだけでは不十分
- **実際のファイルをダウンロードしてハッシュを計算し直す**
- CI/CD に SRI 検証ステップを組み込むのが理想的

## 5. 外部リンクの安全対策

```html
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
```

- **`noopener`**: 新しいタブから元ページの `window.opener` にアクセスさせない
- **`noreferrer`**: リファラー情報を送信しない

## 6. DOMPurify によるサニタイズ

ブログ記事は Markdown → HTML 変換後に `innerHTML` で挿入するため、DOMPurify でサニタイズが必須です。

```javascript
const cleanHTML = DOMPurify.sanitize(rawHTML);
document.getElementById('content').innerHTML = cleanHTML;
```

## セキュリティチェックリスト

変更時に確認すべき項目:

- [ ] `innerHTML` 使用時に DOMPurify サニタイズしているか
- [ ] 外部 CDN スクリプトに `integrity` + `crossorigin="anonymous"` があるか
- [ ] SRI ハッシュを実ファイルから再計算して検証したか
- [ ] 外部リンクに `rel="noopener noreferrer"` があるか
- [ ] `locales/*.json` に危険な HTML が含まれていないか
- [ ] 新しい CDN ドメインを CSP メタタグに追加したか

## まとめ

静的サイトであっても、セキュリティ対策はレイヤーで実装することが重要です。CSP で読み込み元を制限し、SRI で改ざんを検知し、Cookie 同意で法的要件を満たし、DOMPurify で XSS を防ぐ。GitHub Pages の制約（カスタムヘッダー不可）はありますが、`<meta>` タグと JavaScript で十分な対策が可能です。
