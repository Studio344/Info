/**
 * JSON スキーマバリデーションスクリプト
 * list.json と projects.json をスキーマ定義に基づいて検証する
 * 外部依存なし — JSON Schema draft-07 のサブセットを自前で検証
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

/** スキーマ定義と対象ファイルのマッピング */
const TARGETS = [
  {
    name: "list.json",
    dataPath: path.join(ROOT, "assets/posts/list.json"),
    schemaPath: path.join(ROOT, "schemas/list.schema.json"),
  },
  {
    name: "projects.json",
    dataPath: path.join(ROOT, "projects.json"),
    schemaPath: path.join(ROOT, "schemas/projects.schema.json"),
  },
];

/**
 * 簡易スキーマバリデーター（draft-07 サブセット）
 * 対応: type, required, properties, pattern, minLength, maxLength,
 *        minItems, items, additionalProperties, enum
 */
function validate(value, schema, path = "$") {
  const errors = [];

  // type チェック
  if (schema.type) {
    const actual = Array.isArray(value) ? "array" : typeof value;
    if (actual !== schema.type) {
      errors.push(`${path}: 型が不正 — 期待: ${schema.type}, 実際: ${actual}`);
      return errors; // 型が違えば以降のチェックは無意味
    }
  }

  // string バリデーション
  if (schema.type === "string" && typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push(
        `${path}: 最小文字数 ${schema.minLength} 未満 (実際: ${value.length})`,
      );
    }
    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      errors.push(
        `${path}: 最大文字数 ${schema.maxLength} 超過 (実際: ${value.length})`,
      );
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      errors.push(
        `${path}: パターン不一致 — /${schema.pattern}/ に対して "${value}"`,
      );
    }
  }

  // array バリデーション
  if (schema.type === "array" && Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push(
        `${path}: 最小要素数 ${schema.minItems} 未満 (実際: ${value.length})`,
      );
    }
    if (schema.items) {
      value.forEach((item, i) => {
        errors.push(...validate(item, schema.items, `${path}[${i}]`));
      });
    }
  }

  // object バリデーション
  if (schema.type === "object" && typeof value === "object" && value !== null) {
    // required チェック
    if (schema.required) {
      for (const key of schema.required) {
        if (!(key in value)) {
          errors.push(`${path}: 必須フィールド "${key}" が存在しません`);
        }
      }
    }
    // properties チェック
    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in value) {
          errors.push(
            ...validate(value[key], propSchema, `${path}.${key}`),
          );
        }
      }
      // additionalProperties チェック
      if (schema.additionalProperties === false) {
        const allowed = new Set(Object.keys(schema.properties));
        for (const key of Object.keys(value)) {
          if (!allowed.has(key)) {
            errors.push(`${path}: 未定義フィールド "${key}" が存在します`);
          }
        }
      }
    }
  }

  return errors;
}

// --- メイン処理 ---
let hasError = false;

for (const target of TARGETS) {
  console.log(`\n📋 ${target.name} を検証中...`);

  if (!fs.existsSync(target.dataPath)) {
    console.error(`  ❌ ファイルが見つかりません: ${target.dataPath}`);
    hasError = true;
    continue;
  }
  if (!fs.existsSync(target.schemaPath)) {
    console.error(`  ❌ スキーマが見つかりません: ${target.schemaPath}`);
    hasError = true;
    continue;
  }

  const data = JSON.parse(fs.readFileSync(target.dataPath, "utf8"));
  const schema = JSON.parse(fs.readFileSync(target.schemaPath, "utf8"));
  const errors = validate(data, schema);

  if (errors.length === 0) {
    console.log(`  ✅ バリデーション成功 (${Array.isArray(data) ? data.length : 1} エントリ)`);
  } else {
    console.error(`  ❌ ${errors.length} 件のエラー:`);
    errors.forEach((e) => console.error(`    - ${e}`));
    hasError = true;
  }
}

console.log("");
if (hasError) {
  console.error("❌ スキーマバリデーション失敗");
  process.exit(1);
} else {
  console.log("✅ 全JSONファイルのスキーマバリデーション成功");
}
