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
