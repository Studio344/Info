# 静的サイトのパフォーマンス最適化: Lighthouse スコア改善戦略

## はじめに

Studio344 のポートフォリオサイトでは、Google Lighthouse のスコアを重視して最適化を行っています。「趣味のサイトだからパフォーマンスはそこまで…」と思いがちですが、AdSense 審査や SEO ランキングにも影響するため、基本的な最適化は押さえておくべきです。本記事では、実際に行った最適化とその効果を紹介します。

## Lighthouse の4つの指標

Lighthouse は以下の4カテゴリでサイトを評価します。

| カテゴリ | 評価内容 |
|---------|---------|
| Performance | ページの読み込み速度、インタラクティブまでの時間 |
| Accessibility | アクセシビリティ（スクリーンリーダー対応、コントラスト比など） |
| Best Practices | セキュリティ、画像の最適化、コンソールエラーの有無 |
| SEO | メタタグ、クローラビリティ、モバイル対応 |

## Performance の最適化

### 1. スクリプトの非同期読み込み

最も効果的だったのは、外部スクリプト（GSAP、i18next、AdSense）の `async` / `defer` 属性の最適化です。

```html
<!-- AdSense: async で非同期読み込み -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>

<!-- GSAP: ページ下部で読み込み -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>

<!-- i18next: ページ下部で読み込み -->
<script src="https://unpkg.com/i18next@23.2.3/i18next.min.js"></script>
```

CDN からの読み込みは HTTP/2 の並列取得の恩恵もあり、パフォーマンスへの影響は最小限に抑えられます。

### 2. CSS の最適化

使用していない CSS ルールを削除し、クリティカルなスタイルはインラインに配置しました。特に `aurora-container` などのアニメーション用 CSS は、初期表示に必要なスタイルのみを残しています。

### 3. 画像の最適化

Studio344 では画像をほとんど使用していませんが、ロゴ（PNG）は最適なサイズに圧縮しています。可能であれば WebP 形式への変換が推奨されます。

## Accessibility の改善

### セマンティック HTML

`<div onclick>` のようなアクセシブルでない要素を `<a>` タグに置き換えました。これにより、キーボードナビゲーションとスクリーンリーダーの両方に対応できます。

### コントラスト比

暗いテーマのサイトでは、テキストのコントラスト比が不足しがちです。Studio344 では、本文テキストに `#ddd`（明度87%）以上のカラーを使用しています。濃いグレー（`#888`）は補助テキストにのみ使用し、主要コンテンツへの使用は避けています。

### ARIA ラベル

アイコンのみのボタン（ハンバーガーメニュー、GitHub リンク）には `aria-label` を付与しています。

```html
<button class="hamburger" aria-label="メニュー" aria-expanded="false">
```

## SEO の最適化

### メタタグの完備

すべてのページに `<meta name="description">` を設定しています。Open Graph タグ（`og:title`、`og:description`、`og:url`）も主要ページに配置し、SNS でのシェア時の見え方を最適化しています。

### sitemap.xml

すべての公開ページを `sitemap.xml` に登録し、優先度（`<priority>`）と最終更新日（`<lastmod>`）を設定しています。孤立したページや廃止ページは速やかに削除して、クローラーに正確な情報を提供します。

### noscript フォールバック

JavaScript で動的に生成されるコンテンツ（ブログ記事一覧、プロジェクト一覧）には `<noscript>` タグで静的な HTML を提供しています。これにより、JavaScript を実行しないクローラーにもコンテンツを認識させることが可能です。

## Best Practices

### HTTPS

GitHub Pages + カスタムドメインで HTTPS が自動的に有効になります。混合コンテンツ（HTTP の画像や CSS）がないことを確認しています。

### 外部リンクの安全性

`target="_blank"` を持つリンクには `rel="noopener"` を付与し、セキュリティリスクを軽減しています。

## 実際のスコア推移

最適化前後でのスコア変化:

| カテゴリ | 最適化前 | 最適化後 |
|---------|---------|---------|
| Performance | 78 | 92 |
| Accessibility | 85 | 98 |
| Best Practices | 83 | 95 |
| SEO | 72 | 100 |

特に SEO はメタタグと sitemap の追加だけで大幅に改善しました。

## まとめ

静的サイトのパフォーマンス最適化は、小さな改善の積み重ねです。スクリプトの非同期読み込み、セマンティック HTML、メタタグの完備といった基本を押さえるだけで、Lighthouse スコアは大きく向上します。趣味のサイトでも、これらの対策は AdSense 審査やユーザー体験の向上に直結するため、一度は見直しておくことをおすすめします。
