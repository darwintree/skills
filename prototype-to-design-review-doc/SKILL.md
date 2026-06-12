---
name: prototype-to-design-review-doc
description: 将用于讲清业务逻辑的可交互原型转写成交付设计部门和跨职能评审用的设计评审文档。产物是 self-contained HTML：左栏导航、中栏说明、右栏内嵌可交互 demo（iframe），并可汇总后端/API 能力依赖。用户提到“把原型转成设计评审文档/交付设计的文档/design-review 文档”“根据原型写交付设计说明”“为某迭代生成评审文档”时使用。重点是区分作者声明的硬约束、后端能力依赖和留给设计的自由度；不要用它写最终 PRD、API 联调契约，也不要照着原型逐字段复刻 UI。
---

# 原型 → 设计评审文档

## 目标

把“讲清逻辑”的原型，转成设计可据此出高保真稿、业务 / 后端 / 前端 / QA 可一起评审的文档。

产物是一个 **self-contained HTML**：左侧栏导航包含并列的 **旅程总览（功能地图，默认首屏）**、后端/API 总览、评审关注点与原语清单；中栏读说明，右栏吸顶内嵌对应 demo（iframe，指向运行中的原型）。打开先落在旅程总览，读者据此理解端到端依赖与复用后再下钻到原语；切换原语时右侧 demo 同步切换。每个概览页与原语页都有稳定 URL hash，刷新或分享链接后应回到同一页。

文档只固定业务必须遵守的逻辑，不固定原型里的视觉、文案、控件、字段顺序、分步方式或临时实现。最终界面以设计稿为准。

## 产物形态

两段式，**内容与渲染分离**：

1. **结构化数据**：`docs/design-review/<迭代名>.json`，字段见同目录 [schema.json](schema.json)。这是你与作者交互、探索原型后产出的唯一可编辑源。
2. **渲染指令**：用同目录 [render.mjs](render.mjs) 把数据 + [template.html](template.html) 渲染成 `docs/design-review/<迭代名>.html`。

```bash
node $skillBasePath/render.mjs docs/design-review/<迭代名>.json
# 默认输出同名 .html；也可指定第二个参数作为输出路径
```

只改 JSON，不要手改生成的 HTML；每次改完重跑渲染指令。HTML 把 CSS / 渲染逻辑 / 数据全部内联，唯一外部依赖是右栏 demo 的 iframe（需原型 dev server 在运行，地址由 `demoBase` + 各原语 `demo` 相对路径拼成）与可选的 Mermaid CDN（旅程图，离线时自动降级为源码）。

## 核心规则

1. **硬约束是封闭白名单**：只有写入原语 `hard` 的内容才绑定设计；未列入的一律默认开放。
2. **硬约束必须可验收**：每条都能被 QA 判断通过 / 不通过。避免“友好”“合理”“清晰”等不可测词。
3. **不得从原型推断硬约束**：正则、限额、必填、默认值、字段顺序等，只有作者主动声明为约束时才写入 `hard`；其余疑似规则放 `concerns`（待补业务确认）或 `fieldNotes`。
4. **顺序需要真实依赖**：只有 B 的输入依赖 A 的输出时，才在 `journeys` 里把 A → B 画成顺序；无依赖的步骤用并行结构或 `journeyNotes` 说明为开放编排。
5. **引用优先于复述**：原语复用既有能力时，在 `design` / `journeyNotes` 里引用被复用原语；不要复制整套规则。
6. **API 是能力依赖，不是接口契约**：后端/API 能力在顶层 `backendApis` 定义一次，原语只用 `apiRefs` 引用；不要把 endpoint、method、payload、状态码写成设计评审文档的默认内容。

## 工作流

### 1. 预采访 Gate

写数据前先请作者主动声明约束。作者可只回答想声明的部分，不必逐条补全；缺失信息默认开放或进入 `concerns`。

可用开场：

> 先请你主动声明本次要固定的内容：迭代范围 / 非目标、原型 commit 或分支与 demo 入口、你认为必须写成硬约束的规则、需要依赖的后端/API 能力及用途、原型里只是演示占位的内容、已知边界 / 风险、评审参与方。未声明为硬约束的原型细节，我会默认留给设计或放入待确认项。

处理原则：
- 预采访信息只作为生成输入；不要把“预采访纪要”塞进数据文件。
- 作者已明确的信息写入对应字段，不放进 `concerns`。
- 原型里可能是真实规则但作者未声明的内容，放进 `concerns`（类型 `待补业务确认`），不得升级成 `hard`。
- 已明确的后端/API 能力写入顶层 `backendApis`；每个原语只用 `apiRefs` 引用，不在原语里重写 API 说明。

### 2. 探索原型并生成结构化数据

阅读原型和相关代码，按 [schema.json](schema.json) 生成 `docs/design-review/<迭代名>.json`：

- `meta`：迭代范围 / 非目标 / 原型钉定（分支·commit·入口）/ 评审参与方。
- `demoBase` + 各原语 `demo`：拼成右栏 iframe 源；逐个确认能在运行的原型里定位到对应逻辑。
- `concerns`：只放仍需评审拍板、补信息或确认风险的未决事项；正文用“见关注点 #N”引用。
- `backendApis`：后端/API 能力清单，按能力定义一次。只写 `id`、`name`、`purpose`、`iteration` 和可选 `notes`；`iteration.source` 只能是 `new` / `existing`。新增接口不写 `forwardCompatibility`，只在 `notes` 里大致说明未定 endpoint、格式迭代等上下文；现有接口才写 `iteration.forwardCompatibility`（`compatible` / `incompatible` / `unknown`）。未知 endpoint / method / payload / 状态码不要编造，若阻塞评审则放 `concerns`。
- `freedoms`：适用于全文的设计自由度集中写一次。
- `journeys` + `journeyNotes`：Mermaid 表达原语 / 状态 / 真实依赖 / 复用关系；无序步骤不要画成直链。
- `primitives`：按业务能力 / 规则闭环切分，**不按页面、组件、步骤条或 API endpoint 默认切**。
  - 完整新增能力：`kind:"new"`，用 `summary`（职责）+ `hard`（硬约束）。
  - 既有能力增量变更：`kind:"change"`，用 `changes`（变动内容）+ `design`（设计新增关注）；一般不写 `hard`。
  - 都可带 `apiRefs`（引用后端/API 能力）、`design`、`fieldNotes`（字段参考 / 说明，非约束）、`cases`（正常态 / 异常边界）、`open`（开放问题）。
  - `apiRefs` 是原语唯一后端相关字段；后端业务规则继续写入 `summary` / `hard` / `cases` / `fieldNotes` / `open`。
  - 尽量给每个原语填写稳定英文 / 拼音 `id`，用于生成 `#primitive-<id>` 页面锚点；不要因标题文案调整而改动已有 `id`。

生成后运行渲染指令产出 HTML，并提醒作者下一步围绕“评审关注点”补充 / 拍板 / 删除未决项。

### 3. 澄清与调整

初稿后不要把任务视为完成。作者补充信息时，只改 JSON 再重跑渲染：

- 解决了关注点：迁入对应原语字段，从 `concerns` 删除该项。
- 形成新硬规则：写入对应原语 `hard`，并保证可验收。
- 明确了后端/API 能力：写入 `backendApis`，并在相关原语 `apiRefs` 引用；不要在每个原语重复 API 说明。
- 只是设计表达、演示占位或覆盖情形：写入 `design` / `fieldNotes` / `cases`，不留在 `concerns`。
- 打开新问题：新增到 `concerns`。
- 每次更新 `concerns` 后，重排 `n` 编号并同步所有“见关注点 #N”指针；无未决事项时 `concerns` 留空数组。

若作者明显已处在澄清调整轮，只做针对性更新，不重新预采访、不重写全部数据。

## QA 口径

不另写“验收标准”：
- `hard` = 功能验收断言。
- `cases` = 异常 / 状态用例来源。
- `journeys` = 端到端依赖口径。
- `backendApis` + `apiRefs` = 跨职能评审中的后端能力依赖与迭代口径，不替代 API 联调文档。

## 自检

- [ ] 已完成预采访 Gate；未把预采访纪要写进数据文件。
- [ ] 所有 `hard` 均来自作者主动声明，且每条可判断通过 / 不通过。
- [ ] 原型占位、临时校验、字段顺序、文案和布局未混入 `hard`（落在 `fieldNotes` / `freedoms` / `concerns`）。
- [ ] `concerns` 只保留未决事项；已解决项已迁入对应字段并重排编号、同步指针。
- [ ] `journeys` 中的串行关系都是真实依赖；无序步骤未被画成直链。
- [ ] `primitives` 按业务能力切分；复用关系用引用表达，没有复制规则。
- [ ] `backendApis` 已按后端/API 能力单次定义，每项都有 `iteration.source`；只有 `source:"existing"` 的 API 才填写 `iteration.forwardCompatibility`；`apiRefs` 只引用 API id，且没有新增 `backend` 嵌套字段。
- [ ] 未把 endpoint、method、payload、状态码等未确认接口契约编进文档；阻塞评审的接口未决项已放入 `concerns`。
- [ ] 每个概览页与原语页都有稳定 URL hash；刷新 `#journey`、`#backend-apis`、`#review-concerns` 与 `#primitive-<id>` 链接时能回到对应页面。
- [ ] new 原语含 `summary` + `hard` + `cases`；change 原语含 `changes` + `design` + `cases`。
- [ ] 已运行 `render.mjs` 产出 HTML，渲染无报错；Mermaid 可渲染（或降级源码可读），各原语 `demo` 链接可在运行的原型中定位。
