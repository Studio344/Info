/**
 * DEV-25: i18nキー整合性チェック
 *
 * locales/ja.json と locales/en.json のキーを再帰的に比較し、
 * 片方にしか存在しないキーを報告する。
 * 不一致があれば exit code 1 で終了。
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'locales');
const JA_FILE = path.join(LOCALES_DIR, 'ja.json');
const EN_FILE = path.join(LOCALES_DIR, 'en.json');

/**
 * オブジェクトのキーをドット記法でフラット化する
 * @param {object} obj - 対象オブジェクト
 * @param {string} prefix - キーのプレフィックス
 * @returns {Set<string>} フラット化されたキーの Set
 */
function flattenKeys(obj, prefix = '') {
  const keys = new Set();

  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      // ネストされたオブジェクト → 再帰
      for (const nested of flattenKeys(obj[key], fullKey)) {
        keys.add(nested);
      }
    } else {
      // リーフノード（文字列・数値・配列・null）
      keys.add(fullKey);
    }
  }

  return keys;
}

// --- JSONファイル読み込み ---
let jaData, enData;

try {
  jaData = JSON.parse(fs.readFileSync(JA_FILE, 'utf8'));
} catch (err) {
  console.error(`❌ ja.json の読み込みに失敗しました: ${err.message}`);
  process.exit(1);
}

try {
  enData = JSON.parse(fs.readFileSync(EN_FILE, 'utf8'));
} catch (err) {
  console.error(`❌ en.json の読み込みに失敗しました: ${err.message}`);
  process.exit(1);
}

// --- キー比較 ---
const jaKeys = flattenKeys(jaData);
const enKeys = flattenKeys(enData);

const onlyInJa = [...jaKeys].filter(k => !enKeys.has(k)).sort();
const onlyInEn = [...enKeys].filter(k => !jaKeys.has(k)).sort();

// --- 結果出力 ---
let hasError = false;

if (onlyInJa.length > 0) {
  hasError = true;
  console.error('');
  console.error('❌ ja.json にのみ存在するキー:');
  for (const key of onlyInJa) {
    console.error(`   - ${key}`);
  }
}

if (onlyInEn.length > 0) {
  hasError = true;
  console.error('');
  console.error('❌ en.json にのみ存在するキー:');
  for (const key of onlyInEn) {
    console.error(`   - ${key}`);
  }
}

if (hasError) {
  console.error('');
  console.error(`合計: ja.jsonのみ ${onlyInJa.length} 件 / en.jsonのみ ${onlyInEn.length} 件`);
  console.error('locales/ の両ファイルでキーを同期してください。');
  process.exit(1);
} else {
  console.log(`✅ i18nキー整合性OK — ja.json: ${jaKeys.size} キー / en.json: ${enKeys.size} キー（完全一致）`);
  process.exit(0);
}
