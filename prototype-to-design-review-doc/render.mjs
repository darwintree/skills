#!/usr/bin/env node
// 把结构化评审数据 + 模板渲染成 self-contained HTML 设计评审文档。
// 用法：node skills/prototype-to-design-review-doc/render.mjs <data.json> [out.html]
// 数据结构见同目录 schema.json；默认输出为同名 .html。
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function fail(msg) {
  console.error("✘ " + msg);
  process.exit(1);
}

const [, , inputArg, outputArg] = process.argv;
if (!inputArg) {
  fail("缺少输入文件。用法：node render.mjs <data.json> [out.html]");
}

const inputPath = resolve(process.cwd(), inputArg);
const outputPath = outputArg
  ? resolve(process.cwd(), outputArg)
  : inputPath.replace(/\.(json|ya?ml)$/i, "") + ".html";

let raw;
try {
  raw = readFileSync(inputPath, "utf8");
} catch {
  fail("读不到输入文件：" + inputPath);
}

let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  fail("数据不是合法 JSON：" + e.message);
}

// 最小校验：确保必填字段存在，避免产出空壳。
if (!data || typeof data !== "object") fail("数据顶层必须是对象。");
if (!data.title) fail("缺少 title。");
if (!Array.isArray(data.primitives) || data.primitives.length === 0) {
  fail("primitives 必须是非空数组。");
}

if (data.backendApis == null) {
  data.backendApis = [];
} else if (!Array.isArray(data.backendApis)) {
  fail("backendApis 必须是数组。");
}

const apiIds = new Set();
const apiSources = new Set(["new", "existing"]);
const apiForwardCompatibility = new Set(["compatible", "incompatible", "unknown"]);
const shapeKinds = new Set(["query", "body", "response"]);
const highlightKinds = new Set(["added", "removed", "changed"]);

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function failAt(scope, msg) {
  fail(`${scope}: ${msg}`);
}

function parsePath(path, scope) {
  if (typeof path !== "string" || !path) {
    failAt(scope, "highlight.path 必须是非空字符串。");
  }
  const parts = path.split(".");
  parts.forEach((part) => {
    if (!part || part === "[]") failAt(scope, `highlight.path 不合法：${path}`);
    if (part.includes("[]") && !part.endsWith("[]")) {
      failAt(scope, `数组通配只支持 segment[] 形式：${path}`);
    }
  });
  return parts;
}

function isPrefixPath(a, b) {
  if (a.length >= b.length) return false;
  return a.every((part, index) => part === b[index]);
}

function pathExists(value, parts) {
  if (!parts.length) return true;
  const [head, ...rest] = parts;
  if (head.endsWith("[]")) {
    const key = head.slice(0, -2);
    if (!isPlainObject(value) || !Object.prototype.hasOwnProperty.call(value, key)) return false;
    const arr = value[key];
    if (!Array.isArray(arr) || arr.length === 0) return false;
    return arr.every((item) => pathExists(item, rest));
  }
  if (!isPlainObject(value) || !Object.prototype.hasOwnProperty.call(value, head)) return false;
  return pathExists(value[head], rest);
}

function normalizeShapeVariants(value, scope) {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  if (isPlainObject(value)) return [value];
  failAt(scope, "shape 段必须是对象或对象数组。");
}

function validateShapeVariant(variant, scope) {
  if (!isPlainObject(variant)) failAt(scope, "shape variant 必须是对象。");
  if (variant.title != null && typeof variant.title !== "string") {
    failAt(scope, "shape variant.title 必须是字符串。");
  }
  if (typeof variant.code !== "string" || !variant.code) {
    failAt(scope, "shape variant.code 必须是非空 JSON 字符串。");
  }
  let parsed;
  try {
    parsed = JSON.parse(variant.code);
  } catch (e) {
    failAt(scope, `shape variant.code 不是合法 JSON：${e.message}`);
  }
  if (variant.highlights == null) variant.highlights = [];
  if (!Array.isArray(variant.highlights)) {
    failAt(scope, "shape variant.highlights 必须是数组。");
  }

  const seen = [];
  variant.highlights.forEach((highlight, index) => {
    const hScope = `${scope}.highlights[${index}]`;
    if (!isPlainObject(highlight)) failAt(hScope, "highlight 必须是对象。");
    if (!highlightKinds.has(highlight.kind)) {
      failAt(hScope, 'highlight.kind 必须是 "added"、"removed" 或 "changed"。');
    }
    const parts = parsePath(highlight.path, hScope);
    if (!pathExists(parsed, parts)) {
      failAt(hScope, `highlight.path 在 code 中不存在：${highlight.path}`);
    }
    const duplicate = seen.find((item) => item.path === highlight.path);
    if (duplicate) {
      failAt(hScope, `highlight.path 重复：${highlight.path}`);
    }
    const conflict = seen.find((item) => isPrefixPath(item.parts, parts) || isPrefixPath(parts, item.parts));
    if (conflict) {
      failAt(hScope, `highlight.path 与 ${conflict.path} 存在祖先/后代冲突：${highlight.path}`);
    }
    seen.push({ path: highlight.path, parts });
  });
}

function validateApiShapes(api, apiIndex) {
  if (api.shapes == null) return;
  const scope = `backendApis[${apiIndex}] (${api.id}).shapes`;
  if (!isPlainObject(api.shapes)) failAt(scope, "shapes 必须是对象。");
  Object.entries(api.shapes).forEach(([kind, value]) => {
    if (!shapeKinds.has(kind)) {
      failAt(scope, `只支持 query、body、response，收到：${kind}`);
    }
    normalizeShapeVariants(value, `${scope}.${kind}`).forEach((variant, index) => {
      validateShapeVariant(variant, `${scope}.${kind}[${index}]`);
    });
  });
}

data.backendApis.forEach((api, i) => {
  if (!api || typeof api !== "object") fail(`backendApis[${i}] 必须是对象。`);
  if (typeof api.id !== "string" || !api.id) fail(`backendApis[${i}] 缺少 id。`);
  if (typeof api.name !== "string" || !api.name) fail(`backendApis[${i}] (${api.id}) 缺少 name。`);
  if (typeof api.purpose !== "string" || !api.purpose) fail(`backendApis[${i}] (${api.id}) 缺少 purpose。`);
  if (!api.iteration || typeof api.iteration !== "object" || Array.isArray(api.iteration)) {
    fail(`backendApis[${i}] (${api.id}) 缺少 iteration。`);
  }
  if (!apiSources.has(api.iteration.source)) {
    fail(`backendApis[${i}] (${api.id}) 的 iteration.source 必须是 "new" 或 "existing"。`);
  }
  if (api.iteration.source === "new" && api.iteration.forwardCompatibility != null) {
    fail(`backendApis[${i}] (${api.id}) 是新增接口，不应填写 iteration.forwardCompatibility。`);
  }
  if (
    api.iteration.source === "existing" &&
    !apiForwardCompatibility.has(api.iteration.forwardCompatibility)
  ) {
    fail(`backendApis[${i}] (${api.id}) 的 iteration.forwardCompatibility 必须是 "compatible"、"incompatible" 或 "unknown"。`);
  }
  if (apiIds.has(api.id)) fail(`backendApis id 重复：${api.id}`);
  validateApiShapes(api, i);
  apiIds.add(api.id);
});

data.primitives.forEach((p, i) => {
  if (!p.name) fail(`primitives[${i}] 缺少 name。`);
  if (p.kind !== "new" && p.kind !== "change") {
    fail(`primitives[${i}] (${p.name}) 的 kind 必须是 "new" 或 "change"。`);
  }
  if (p.apiRefs == null) return;
  if (!Array.isArray(p.apiRefs)) {
    fail(`primitives[${i}] (${p.name}) 的 apiRefs 必须是数组。`);
  }
  p.apiRefs.forEach((ref, refIndex) => {
    if (typeof ref !== "string" || !ref) {
      fail(`primitives[${i}] (${p.name}) 的 apiRefs[${refIndex}] 必须是非空字符串。`);
    }
    if (!apiIds.has(ref)) {
      fail(`primitives[${i}] (${p.name}) 的 apiRefs[${refIndex}] 引用了不存在的 backendApis id：${ref}`);
    }
  });
});

const templatePath = join(__dirname, "template.html");
let template;
try {
  template = readFileSync(templatePath, "utf8");
} catch {
  fail("读不到模板：" + templatePath);
}

// 安全注入：转义会提前结束 <script> 的序列与行分隔符。
const json = JSON.stringify(data)
  .replace(/</g, "\\u003c")
  .replace(/\u2028/g, "\\u2028")
  .replace(/\u2029/g, "\\u2029");

if (!template.includes("__DESIGN_REVIEW_DATA__")) {
  fail("模板缺少 __DESIGN_REVIEW_DATA__ 占位符。");
}
const html = template.replace("__DESIGN_REVIEW_DATA__", json);

writeFileSync(outputPath, html, "utf8");
console.log("✓ 已生成设计评审文档：" + outputPath);
