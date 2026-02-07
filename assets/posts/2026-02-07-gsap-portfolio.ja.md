# GitHub Pagesで作る、GSAPアニメーション付きポートフォリオサイト

## はじめに

エンジニアのポートフォリオサイトを構築する際、「フレームワークを使うべきか、それとも素のHTML/CSS/JSで十分か？」という問いに直面します。Studio344では後者を選択し、**GitHub Pages** + **GSAP** + **バニラJS** というシンプルな構成で、リッチなアニメーション体験を持つポートフォリオサイトを実現しました。

この記事では、フレームワークなしでモダンなポートフォリオサイトを構築するための技術的なアプローチを解説します。

## なぜフレームワークを使わないのか

React、Next.js、Astroなどのフレームワークは強力ですが、ポートフォリオサイトに限って言えば、以下の理由からバニラ構成を選びました。

- **デプロイの簡素さ**: GitHub Pagesはビルドステップ不要で、pushするだけで公開される
- **依存関係ゼロ**: `node_modules` がないため、メンテナンスコストが極めて低い
- **学習の深化**: フレームワークに頼らず素のWeb技術を使うことで、基礎力が鍛えられる
- **パフォーマンス**: バンドルサイズが最小限のため、初回表示が高速

ただし、「フレームワーク不要」は「ライブラリ不要」とは異なります。特にアニメーション領域では、GSAPのようなライブラリが大きな差を生みます。

## GSAP + ScrollTriggerの活用

### GSAPを選んだ理由

**GSAP（GreenSock Animation Platform）** は、Web上で最もパフォーマンスの高いアニメーションライブラリの一つです。

- **60fps保証**: requestAnimationFrameベースで、ジャンクのない滑らかなアニメーション
- **Timeline機能**: 複数のアニメーションを時系列で連鎖させるオーケストレーション
- **ScrollTriggerプラグイン**: スクロール位置に連動したアニメーションが宣言的に記述可能
- **イージング関数**: `power2.out`、`elastic.inOut`など、物理的に自然な動きを表現

### 実装例: カードのフェードイン

Studio344のトップページでは、各カードがスクロールに合わせてフェードインする演出を実装しています。

```javascript
gsap.utils.toArray('.bento-card').forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: 'top 85%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    y: 40,
    duration: 0.8,
    delay: i * 0.1,
    ease: 'power2.out'
  });
});
```

ポイントは `delay: i * 0.1` です。カードのインデックスに応じて遅延を設けることで、**ステージング効果**（順番にアニメーションする演出）を簡潔に実現しています。

### マウス追従エフェクト

ヒーロセクションでは、マウスカーソルの位置に応じて背景要素が微妙にずれる **パララックス効果** を実装しました。

```javascript
document.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 20;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;
  gsap.to('.aurora-orb', {
    x: x,
    y: y,
    duration: 1,
    ease: 'power2.out'
  });
});
```

微小な動き（±20px程度）に抑えることで、煩わしさのない上品な動的効果を演出しています。

## Aurora UIの実装

### 背景デザインの構成要素

Studio344の背景は、複数のレイヤーを重ねて構成されています。

1. **Aurora Orb**: 大きなグラデーション円をぼかしたオーブ。背景色のアクセントとして配置
2. **Grid Overlay**: 1pxの半透明ラインによるグリッドパターン。テック感を演出
3. **Noise Overlay**: CSS背景としてのノイズテクスチャ。のっぺりとした印象を防ぐ
4. **Spotlight**: マウス位置に連動する光源効果

```css
.aurora-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
}

.grid-overlay {
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 60px 60px;
}
```

これらを `z-index` で適切に重ねることで、奥行きのある空間を表現しています。

## Bento Gridレイアウト

### CSS Gridによる実装

コンテンツエリアには **Bento Grid** レイアウトを採用しています。Apple系のデザインでよく見られる、角丸のカードをグリッド状に配置するUIパターンです。

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.bento-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 2.5rem;
  backdrop-filter: blur(20px);
}
```

12カラムグリッドを使うことで、カードのスパン数を `grid-column: span 4` や `span 6` で柔軟に制御でき、レスポンシブ対応も容易です。

### ガラスモーフィズム効果

`backdrop-filter: blur()` と半透明の背景色を組み合わせることで、**ガラスモーフィズム（Glassmorphism）** を実現しています。背景のAuroraオーブがカード越しにぼんやりと見え、レイヤー感が生まれます。

## GitHub Pagesのデプロイ設定

### 独自ドメインの設定

GitHub Pagesで独自ドメイン（`studio344.net`）を使う設定は以下の通りです。

1. DNSプロバイダーでAレコードまたはCNAMEを設定
2. リポジトリの Settings → Pages で Custom domain を入力
3. 「Enforce HTTPS」を有効にする（Let's Encryptによる自動SSL）

### デプロイフロー

```
1. ローカルで変更を作成
2. git add → git commit → git push
3. GitHub Pages が自動的にデプロイ
4. 数秒〜数分で反映完了
```

ビルドステップがないため、プッシュからデプロイまでのラグが最小限です。

## まとめ

フレームワークを使わなくても、GSAPとCSS Gridを組み合わせれば、十分にモダンでリッチなポートフォリオサイトを構築できます。GitHub Pagesの無料ホスティングと合わせれば、**コストゼロ** で独自ドメインのHTTPSサイトを運用可能です。

重要なのはツールの選択よりも **ユーザーに何を伝えるか** です。技術スタックを見せるだけでなく、各プロジェクトの背景や工夫を語ることで、ポートフォリオは単なる作品集から「エンジニアとしてのストーリー」に変わります。
