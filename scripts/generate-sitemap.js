/**
 * DEV-06: sitemap.xml 自動生成スクリプト
 *
 * - 静的HTMLページを収集し、ファイルの更新日時を lastmod に使用
 * - assets/posts/list.json からブログ記事を取得
 * - 適切な priority 値を設定して sitemap.xml を生成
 *
 * 使用方法: node scripts/generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://studio344.net';
const ROOT_DIR = path.join(__dirname, '..');
const LIST_FILE = path.join(ROOT_DIR, 'assets', 'posts', 'list.json');
const OUTPUT_FILE = path.join(ROOT_DIR, 'sitemap.xml');

/**
 * ページ定義
 * path: サイト上のパス
 * file: ローカルファイルパス（ROOT_DIR からの相対）
 * priority: サイトマップの優先度
 */
const STATIC_PAGES = [
  { path: '/',                          file: 'index.html',          priority: '1.0' },
  { path: '/about.html',               file: 'about.html',          priority: '0.8' },
  { path: '/contact.html',             file: 'contact.html',        priority: '0.8' },
  { path: '/projects.html',            file: 'projects.html',       priority: '0.9' },
  { path: '/blog.html',                file: 'blog.html',           priority: '0.8' },
  { path: '/projects/ucfitness.html',  file: 'projects/ucfitness.html', priority: '0.9' },
  { path: '/projects/portfolio.html',  file: 'projects/portfolio.html', priority: '0.7' },
  { path: '/privacy-policy.html',      file: 'privacy-policy.html', priority: '0.5' },
  { path: '/terms.html',               file: 'terms.html',          priority: '0.5' },
];

/**
 * ファイルの最終更新日を YYYY-MM-DD 形式で取得
 * @param {string} filePath - ファイルの絶対パス
 * @returns {string} YYYY-MM-DD 形式の日付
 */
function getLastMod(filePath) {
  try {
    const stat = fs.statSync(filePath);
    return stat.mtime.toISOString().split('T')[0];
  } catch {
    // ファイルが見つからない場合は今日の日付を使用
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * list.json の日付形式 (YYYY.MM.DD) を YYYY-MM-DD に変換
 * @param {string} dateStr - YYYY.MM.DD 形式の日付
 * @returns {string} YYYY-MM-DD 形式の日付
 */
function convertDate(dateStr) {
  return dateStr.replace(/\./g, '-');
}

/**
 * XML エスケープ
 * @param {string} str
 * @returns {string}
 */
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// --- メイン処理 ---
function main() {
  // ブログ記事の読み込み
  let posts;
  try {
    const raw = fs.readFileSync(LIST_FILE, 'utf8');
    posts = JSON.parse(raw);
  } catch (err) {
    console.error(`❌ list.json の読み込みに失敗しました: ${err.message}`);
    process.exit(1);
  }

  // XML 構築
  const urls = [];

  // 静的ページ
  for (const page of STATIC_PAGES) {
    const filePath = path.join(ROOT_DIR, page.file);
    const lastmod = getLastMod(filePath);
    urls.push(`  <url>
    <loc>${escapeXml(BASE_URL + page.path)}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${page.priority}</priority>
  </url>`);
  }

  // ブログ記事セパレーター
  urls.push('');
  urls.push('  <!-- ブログ記事 -->');

  // ブログ記事
  for (const post of posts) {
    const lastmod = convertDate(post.date);
    urls.push(`  <url>
    <loc>${escapeXml(BASE_URL + '/blog.html#post/' + post.id)}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>0.7</priority>
  </url>`);
  }

  // sitemap.xml 出力
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

  fs.writeFileSync(OUTPUT_FILE, xml, 'utf8');
  console.log(`✅ sitemap.xml を生成しました（静的ページ: ${STATIC_PAGES.length} 件 / ブログ記事: ${posts.length} 件）`);
}

main();
