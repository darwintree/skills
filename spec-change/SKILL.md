---
name: spec-change
description: >
  管理 docs/spec 的 spec-change-driven 流程。当用户要新增、调整、重写、讨论或确认 spec，
  或提到“spec change”“契约变更”“修改 spec”“调整 docs/spec 定位/内容”时使用。
  该 skill 要求先通过讨论确认契约变更细节，再创建带日期的 docs/spec/changes 文件，
  最后根据已确认的 change 修改最终 spec；实现计划和实现进度不得写入 change 文件。
---

# Spec Change Skill

管理 `docs/spec/` 的契约变更流程。该流程把“讨论契约变更”和“实现代码”分开：先确认 change，再更新最终 spec，之后才能从 spec 生成 exec-plan 或进入实现。

## 核心原则

- `docs/spec/*.md` 是权威最终契约，只呈现已确认的目标契约。
- `docs/spec/changes/YYYY-MM-DD-*.md` 是一次契约变更提案/决议，只描述契约层面的 delta。
- change 文件必须带日期，日期使用当前本地日期。
- change 文件不写实现步骤、任务拆分、执行进度、测试执行记录或“先改 A 再改 B”。
- spec 一经确认即视为冻结契约。实现过程中不得自行修改已确认 spec；若发现契约问题，必须创建新的 dated spec change。
- accepted change 必须同步更新对应最终 spec。不能只写 change，不改最终 spec。
- 用户明确要求审查、清理或重构正式 spec 文体与边界时，可以直接修改 skill 或 spec 文件；不强制为这类元规则清理创建 change 文件。

## 正式 spec 规则

`docs/spec/*.md` 是正式 spec。正式 spec 的正文必须满足：

- 只写已确认的目标契约，可以领先代码实现，但不写实现状态。
- 不写 `状态：draft`、`TBD`、`待确认`、`未决问题`、`建议方向`、`初版`、`本轮`、`本阶段`、`重构后` 等未确认或过程性内容。
- 不写背景、设计动机、历史问题、方案取舍或修订说明；这些内容属于 `docs/design/`、`docs/spec/changes/` 或 `docs/traces/`。
- 不引用 `docs/spec/legacy/*`。legacy 文档只能作为历史材料存在，不能成为正式 spec 的权威依赖。
- 不把模块边界写成建议；若边界已确认，写成模块契约，否则不要进入正式 spec。
- 可以保留候选契约小节，但只能简要描述想法，不写完整接口契约、字段细节、状态码、错误语义或实现承诺。候选内容进入正式契约前必须经过新的 spec change。
- 不写实现流程、任务拆分、执行进度、测试执行记录或实现状态。

正式 spec 推荐结构：

```md
# Xxx Spec

## Scope

## Concepts

## Contract

## State Rules / API Rules / Type Shapes

## Error Rules

## Invariants

## Candidate Contracts

## Out of Scope

## Acceptance Criteria
```

不需要机械使用所有章节。按文档类型选择合适章节，但保持静态正式契约口吻。

## 触发输入

用户通常会给出以下信息之一：

- 想新增或修改某个 `docs/spec/*.md`
- 想讨论某个模块、功能、API、状态或事件协议的契约
- 想把现有文档整理为 spec-change-driven 形式
- 想创建 `docs/spec/changes/YYYY-MM-DD-*.md`
- 想确认某个 change 并更新最终 spec

如果用户只是要求“继续实现某个 spec 的任务”，使用 `step` skill，不使用本 skill。

## 工作流

### 第 1 步：读取现有上下文

先读取与目标相关的文件：

- 相关 `docs/spec/*.md`
- 必要的 `docs/design/*.md`
- 必要的当前代码接口或类型定义

如果用户还没有指定目标 spec，先通过目录和内容判断可能影响的 spec。不要在缺少契约边界时直接写 change 文件。

### 第 2 步：讨论并收敛契约细节

先和用户确认契约层面的关键问题。问题要聚焦在长期契约，不要进入实现方案。

至少确认：

- Target Specs：本次变更影响哪些最终 spec
- Problem：当前契约缺少什么、冲突什么，或需要表达什么新能力
- Contract Delta：新增、修改、删除哪些契约点
- Non-Goals：明确不纳入本次契约的范围
- Compatibility：是否考虑兼容；本仓库默认 fail fast，不做历史兼容，除非用户明确要求
- Acceptance Criteria：最终 spec 被认为表达完整的可验收边界是什么

一次只问必要问题。若问题能通过读代码或现有文档解决，先自行查证。

### 第 3 步：形成 change 草案

在用户明确认可契约方向后，创建或更新：

```text
docs/spec/changes/YYYY-MM-DD-short-name.md
```

文件名规则：

- `YYYY-MM-DD` 使用当前本地日期
- `short-name` 使用小写 kebab-case
- slug 表达契约主题，不使用无意义序号

change 文件使用以下结构：

```md
---
status: proposed
date: YYYY-MM-DD
---

# Xxx Spec Change

## Discussion Trace

- docs/traces/YYYY-MM-DD-short-name-discussion.md

## Target Specs

- docs/spec/example.md

## Problem

## Contract Delta

### Added

### Changed

### Removed

## Non-Goals

## Compatibility

## Acceptance Criteria

## Resolution
```

写作要求：

- `Contract Delta` 是核心，必须说明契约新增、修改、删除的内容。
- 没有对应内容的小节可以写 `None.`，不要留下空标题。
- `Resolution` 在 proposed 阶段写 `Pending.`。
- 不写实现流程、文件改造清单、任务拆分、测试执行记录或实现状态。
- 不复制整份最终 spec，只写 delta。
- 若本次 change 来自 `grill-me` / `grill-with-docs` 讨论，必须包含 `## Discussion Trace`，列出对应 `docs/traces/` 文件路径；trace 文件也应反向链接到本 change。无讨论 trace 时，该小节写 `None.`。

### 第 4 步：等待确认

创建 change 草案后，向用户总结关键 delta，并等待用户确认。

未确认前不要修改最终 spec。用户若要求调整 change，继续修改 change 文件，直到用户明确接受。

### 第 5 步：标记 accepted 并修改最终 spec

用户确认后：

1. 将 change front matter 的 `status` 改为 `accepted`。
2. 将 `Resolution` 改为契约层面的接受结论，例如：

   ```md
   Accepted. The final contract is reflected in `docs/spec/example.md`.
   ```

3. 根据 change 修改对应 `docs/spec/*.md`。

最终 spec 写作要求：

- 使用静态正式文档口吻描述目标契约。
- 不写修订说明、历史对比、迁移过程、实现流程或 “之前/现在/不再/改为” 类表述。
- 不写 `状态：draft`、`TBD`、`待确认`、`未决问题`、`建议方向`、`初版`、`本轮`、`本阶段`、`重构后` 等未确认或过程性内容。
- 不引用 `docs/spec/legacy/*`。
- 不写实现状态；目标契约可以领先代码实现。
- 候选契约只允许简要描述想法，不写完整接口契约或实现承诺。
- 不把 change 文件内容整段复制进最终 spec。
- 保持模块职责、功能契约、API/类型/状态/事件协议、错误边界、不变量和验收标准清晰可查。

### 第 6 步：自检

完成后检查：

- change 文件名包含当前日期，且位于 `docs/spec/changes/`。
- change 文件只包含契约 delta，没有实现步骤或进度。
- accepted change 已同步反映到最终 spec。
- 最终 spec 是长期契约正文，不含过程性语言。
- 最终 spec 不含 draft/TBD/待确认/未决问题/建议方向等未确认内容。
- 最终 spec 不引用 legacy spec。
- 若实现过程中需要改变契约，已明确需要新建 spec change，而不是直接改当前 spec。

## 与其他文档的边界

- `docs/spec/*.md`：最终契约。
- `docs/spec/changes/*.md`：契约变更记录。
- `docs/design/*.md`：概念建模、架构取舍和原因。
- `docs/exec-plan/*.md`：从 accepted spec 派生的实施计划。
- `docs/traces/*.md`：执行记录、验证记录和实现过程备注。

## 输出要求

完成本 skill 后，简要说明：

- 创建或更新的 change 文件
- 修改的最终 spec 文件
- change 当前状态
- 是否还需要生成或更新 exec-plan

不要声称已经进入实现，除非用户明确要求继续执行后续开发流程。
