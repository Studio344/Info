# 静的HTMLサイトにi18nextで多言語対応を実装する方法

## はじめに

Studio344のポートフォリオサイトは **日本語（JA）** と **英語（EN）** の二言語に対応しています。フレームワークを使わない純粋な静的HTMLサイトで多言語化を実現するために、軽量なi18nライブラリ **i18next** を採用しました。

この記事では、静的HTMLサイトにi18nextを導入して多言語対応を実装する具体的な方法と、その過程で工夫したポイントを詳しく解説します。

## なぜi18nextを選んだのか

フロントエンドの多言語化ライブラリはいくつかありますが、i18nextを選んだ理由は以下の通りです。

- **フレームワーク非依存**: React、Vue、Angularなどに依存せず、バニラJSでも使える
- **豊富なエコシステム**: ブラウザ言語検出、ローカルストレージ保存など、プラグインが充実
- **実績と安定性**: 10年以上の歴史があり、大規模プロジェクトでの採用実績も豊富
- **CDN配信**: npm不要で、scriptタグ一つで導入可能

特に、ビルドツールなしの静的サイトで使える点が決め手でした。

## 基本的な実装方法

### 1. ライブラリの導入

CDN経由でi18nextと関連プラグインを読み込みます。

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/i18next/23.2.3/i18next.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/i18next-browser-languagedetector/7.1.0/i18nextBrowserLanguageDetector.min.js"></script>
```

### 2. 翻訳リソースの定義

JavaScriptファイル内に、言語ごとの翻訳データを定義します。

```javascript
const resources = {
  ja: {
    translation: {
      hero_title: "ようこそ Studio344 へ",
      hero_subtitle: "テクノロジーで遊ぶ、趣味のアカウントです",
      nav_projects: "プロジェクト",
      nav_blog: "ブログ"
    }
  },
  en: {
    translation: {
      hero_title: "Welcome to Studio344",
      hero_subtitle: "A hobby account exploring technology",
      nav_projects: "Projects",
      nav_blog: "Blog"
    }
  }
};
```

### 3. HTMLでの宣言的な翻訳指定

翻訳対象の要素に `data-i18n` 属性を追加します。

```html
<h1 data-i18n="hero_title">ようこそ Studio344 へ</h1>
<p data-i18n="hero_subtitle">テクノロジーで遊ぶ、趣味のアカウントです</p>
```

### 4. 初期化と適用

i18nextを初期化し、DOM要素を一括で翻訳します。

```javascript
i18next
  .use(i18nextBrowserLanguageDetector)
  .init({
    resources,
    fallbackLng: 'ja',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  })
  .then(() => {
    updateContent();
  });

function updateContent() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = i18next.t(key);
  });
}
```

## 工夫したポイント

### 言語切り替えUIの設計

ヘッダーに **JA / EN** の切り替えボタンを配置しました。クリック時に `i18next.changeLanguage()` を呼び出し、`updateContent()` を再実行することで即座に画面全体が切り替わります。

現在の言語はLocalStorageに保存されるため、再訪問時にも前回選択した言語が維持されます。

### placeholder属性の翻訳

i18nextの `data-i18n` は通常 `textContent` を置き換えますが、フォームのplaceholderのように **属性値** を翻訳したい場合があります。その場合は `[placeholder]` という接頭辞を使います。

```html
<input data-i18n="[placeholder]search_placeholder" placeholder="検索..." />
```

### ブログ記事の多言語化

ブログ記事はMarkdownファイルで管理しているため、i18nextのJSONリソースとは別のアプローチが必要でした。解決策として、記事ファイルを言語ごとに分割しました。

```
assets/posts/
  2026-01-20-fitbit.ja.md   ← 日本語版
  2026-01-20-fitbit.en.md   ← 英語版
```

言語切り替え時にi18nextの `languageChanged` イベントをリッスンし、対応する言語の記事ファイルを再読み込みします。

### HTMLのlang属性の動的更新

言語切り替え時に `<html lang="ja">` 属性も動的に更新することで、スクリーンリーダーやブラウザの言語検出が正しく機能するようにしています。

```javascript
i18next.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});
```

## 注意点と改善の余地

### SEOへの影響

クライアントサイドで翻訳を行う方式のため、検索エンジンのクローラーがJavaScript実行前のDOMを読み取った場合、デフォルト言語（日本語）しかインデックスされない可能性があります。

SSRやSSGを採用しているサイトであれば、ビルド時に言語別のHTMLを生成する方式がSEO的には有利です。Studio344は静的サイトのため、`hreflang` タグの設定やサイトマップでの言語指定で補完しています。

### 翻訳漏れの防止

ページを追加するたびに翻訳キーの追加を忘れないよう、すべての `data-i18n` キーを一箇所のJSファイル（`i18n.js`）で管理する方針にしました。翻訳リソースが散らばらないため、漏れを発見しやすくなっています。

## まとめ

i18nextは、フレームワークを使わない静的HTMLサイトでも十分に実用的な多言語化ソリューションです。`data-i18n` 属性による宣言的なアプローチは、HTMLとJavaScriptの責務を明確に分離でき、保守性の高いコードになります。

小規模なポートフォリオサイトから始めて、徐々にコンテンツを拡充していく場合に、特におすすめのアプローチです。
