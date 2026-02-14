/**
 * RSS 2.0 フィード生成スクリプト
 * 
 * assets/posts/list.json を読み込み、各記事の日本語MDファイルから
 * タイトルと抜粋を抽出して feed.xml を生成する。
 * 
 * 使い方: node scripts/generate-rss.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LIST_PATH = path.join(ROOT, 'assets', 'posts', 'list.json');
const OUTPUT_PATH = path.join(ROOT, 'feed.xml');

const SITE_URL = 'https://studio344.net';
const BLOG_URL = `${SITE_URL}/blog.html`;
const FEED_TITLE = 'Studio344 Blog';
const FEED_DESCRIPTION = 'Studio344 の開発ログと技術的な知見を発信するブログ';
const FEED_LANGUAGE = 'ja';

/**
 * XML 特殊文字をエスケープする
 */
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Markdown テキストから最初の見出し（# タイトル）を抽出する
 */
function extractTitle(mdText) {
  const match = mdText.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : 'Untitled';
}

/**
 * Markdown テキストからプレーンテキストの抜粋を抽出する（最大200文字）
 */
function extractExcerpt(mdText, maxLength = 200) {
  const lines = mdText.split('\n');
  let excerpt = '';
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('#')) continue;
    if (trimmed.startsWith('|')) continue;
    if (trimmed.startsWith('![')) continue;
    if (trimmed.startsWith('<')) continue;
    if (trimmed.startsWith('- **') || trimmed.startsWith('- `')) continue;

    // Markdown 書式を除去してプレーンテキストにする
    let clean = trimmed
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .replace(/<br\s*\/?>/g, ' ')
      .trim();

    if (clean.length > 0) {
      excerpt += (excerpt ? ' ' : '') + clean;
      if (excerpt.length >= maxLength) break;
    }
  }

  if (excerpt.length > maxLength) {
    excerpt = excerpt.substring(0, maxLength).trim() + '…';
  }
  return excerpt;
}

/**
 * list.json の日付文字列（"2026.02.07"）を RFC 822 形式に変換する
 */
function toRfc822Date(dateStr) {
  // "2026.02.07" → Date → RFC 822
  const parts = dateStr.split('.');
  const date = new Date(`${parts[0]}-${parts[1]}-${parts[2]}T00:00:00+09:00`);
  return date.toUTCString();
}

function main() {
  // list.json を読み込む
  const listJson = fs.readFileSync(LIST_PATH, 'utf-8');
  const posts = JSON.parse(listJson);

  // 各記事の日本語MDファイルを読み込んでアイテムを生成する
  const items = [];

  for (const post of posts) {
    const mdPath = path.join(ROOT, 'assets', 'posts', `${post.baseFilename}.ja.md`);

    if (!fs.existsSync(mdPath)) {
      console.warn(`⚠️ スキップ: ${mdPath} が見つかりません`);
      continue;
    }

    const mdText = fs.readFileSync(mdPath, 'utf-8');
    const title = extractTitle(mdText);
    const excerpt = extractExcerpt(mdText);
    const link = `${BLOG_URL}#post/${post.id}`;
    const pubDate = toRfc822Date(post.date);

    items.push(`    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(link)}</link>
      <description>${escapeXml(excerpt)}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
    </item>`);
  }

  // RSS 2.0 XML を組み立てる
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${escapeXml(BLOG_URL)}</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>${FEED_LANGUAGE}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items.join('\n')}
  </channel>
</rss>
`;

  fs.writeFileSync(OUTPUT_PATH, rss, 'utf-8');
  console.log(`✅ feed.xml を生成しました（${items.length}件の記事）`);
  console.log(`📁 出力先: ${OUTPUT_PATH}`);
}

main();
