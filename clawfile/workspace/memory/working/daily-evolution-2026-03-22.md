# 每日记忆提取报告 - 2026-03-22

**执行时间：** 2026-03-22 02:00 (Asia/Shanghai)  
**执行者：** memory-extractor-daily  
**周期：** 周日（额外执行记忆整合）

---

## 1. 原始日志检查

### 昨日日志扫描
| 日期 | 文件状态 | 日志行数 | 处理结果 |
|------|----------|----------|----------|
| 2026-03-21 | ❌ 不存在 | - | 无新日志 |

**结论：** raw/ 目录中未发现昨日（2026-03-21）的日志文件。上一个日志文件为 `2026-03-18.md`。

---

## 2. 记忆提取结果

由于昨日无新日志，本次提取未产生新的结构化记忆。

### 提取统计
| 类型 | 新提取数量 | 置信度≥0.7 | 已确认 |
|------|------------|------------|--------|
| 事实 (Facts) | 0 | - | - |
| 决策 (Decisions) | 0 | - | - |
| 偏好 (Preferences) | 0 | - | - |

---

## 3. 周日记忆整合

今天是周日，执行额外的记忆整合任务。

### 3.1 工作记忆审查
| 文件 | 类型 | 状态 | 整合决策 |
|------|------|------|----------|
| `daily-evolution-2026-03-18.md` | 日报 | 历史归档 | 不迁移，保留在 working/ |
| `ai-intelligence-system.md` | 系统文档 | 活跃使用 | 不迁移，保留在 working/ |
| `eko-kanban.md` | 任务看板 | 活跃使用 | 不迁移，保留在 working/ |

### 3.2 长期记忆库状态
**当前 longterm/ 目录：**
- `facts.json`: 5 条已确认事实
- `decisions.json`: 1 条已确认决策
- `preferences.json`: 3 条已确认偏好

**整合结果：** 无新内容需要迁移。所有 working/ 中的文件均为文档/看板类内容，不属于待确认记忆。

---

## 4. 索引更新

### 时间索引 (time-index.json)
```json
{
  "lastExtraction": "2026-03-22T02:00:00+08:00",
  "lastRawDate": "2026-03-18",
  "extractionHistory": [
    {"date": "2026-03-18", "hasNewLogs": true, "factsExtracted": 5},
    {"date": "2026-03-19", "hasNewLogs": false, "factsExtracted": 0},
    {"date": "2026-03-20", "hasNewLogs": false, "factsExtracted": 0},
    {"date": "2026-03-21", "hasNewLogs": false, "factsExtracted": 0},
    {"date": "2026-03-22", "hasNewLogs": false, "factsExtracted": 0}
  ],
  "nextScheduled": "2026-03-23T02:00:00+08:00"
}
```

### 标签索引 (tag-index.json)
```json
{
  "tags": {
    "user": {"count": 1, "files": ["longterm/facts.json"]},
    "project": {"count": 4, "files": ["longterm/facts.json"]},
    "communication": {"count": 1, "files": ["longterm/preferences.json"]},
    "work": {"count": 2, "files": ["longterm/preferences.json"]}
  },
  "lastUpdated": "2026-03-22T02:00:00+08:00"
}
```

---

## 5. 摘要

| 指标 | 数值 |
|------|------|
| 昨日新日志 | 0 条 |
| 新提取记忆 | 0 条 |
| 整合到长期记忆 | 0 条 |
| 冲突记忆检测 | 0 条 |
| 索引文件更新 | 2 个 |

### 备注
- 连续 4 天（03/19-03/22）未产生新的原始日志
- 建议检查 raw/ 目录的日志生成机制
- 长期记忆库保持 5事实+1决策+3偏好 的稳定状态

---

*本报告由 memory-extractor-daily 自动生成*
