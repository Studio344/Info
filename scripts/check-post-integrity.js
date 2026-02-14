/**
 * DEV-04: list.json ↔ MDファイル整合性チェック
 *
 * assets/posts/list.json の各エントリに対応する
 * .ja.md / .en.md ファイルが存在するか検証する。
 * 不足ファイルがあれば exit code 1 で終了。
 */

const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '..', 'assets', 'posts');
const LIST_FILE = path.join(POSTS_DIR, 'list.json');

// --- list.json 読み込み ---
let entries;
try {
  const raw = fs.readFileSync(LIST_FILE, 'utf8');
  entries = JSON.parse(raw);
} catch (err) {
  console.error(`❌ list.json の読み込みに失敗しました: ${err.message}`);
  process.exit(1);
}

if (!Array.isArray(entries)) {
  console.error('❌ list.json のルート要素が配列ではありません');
  process.exit(1);
}

// --- 整合性チェック ---
const missing = [];
const LANGS = ['ja', 'en'];

for (const entry of entries) {
  if (!entry.baseFilename) {
    console.error(`❌ エントリに baseFilename がありません: ${JSON.stringify(entry)}`);
    missing.push(`(baseFilename 未定義) id=${entry.id || '不明'}`);
    continue;
  }

  for (const lang of LANGS) {
    const filename = `${entry.baseFilename}.${lang}.md`;
    const filepath = path.join(POSTS_DIR, filename);

    if (!fs.existsSync(filepath)) {
      missing.push(filename);
    }
  }
}

// --- 結果出力 ---
if (missing.length > 0) {
  console.error('');
  console.error('❌ 以下のMDファイルが見つかりません:');
  console.error('');
  for (const file of missing) {
    console.error(`   - ${file}`);
  }
  console.error('');
  console.error(`合計 ${missing.length} 件の不足ファイルがあります。`);
  console.error('assets/posts/ ディレクトリにファイルを追加してください。');
  process.exit(1);
} else {
  console.log(`✅ 全 ${entries.length} 件のエントリに対応するMDファイル（ja/en）が存在します。`);
  process.exit(0);
}
